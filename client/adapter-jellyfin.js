/* Commentarr: Jellyfin web adapter. Loaded by the Commentarr Jellyfin plugin. AGPL-3.0-or-later. */
(function () {
  'use strict';
  var C = function () { return window.ApiClient || null; };
  var headers = function () { return { Authorization: 'MediaBrowser Token="' + C().accessToken() + '"', Accept: 'application/json' }; };
  var get = function (path) {
    return fetch(C().getUrl(path), { headers: headers(), cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('Jellyfin ' + r.status); return r.json(); });
  };

  var media = { forItem: null, value: null, pending: null, checkedAt: 0, sessionId: null, stale: null };

  function idsFor(item, series) {
    var ids = [];
    var p = item.ProviderIds || {};
    if (item.Type === 'Movie') {
      if (p.Tmdb) ids.push('movie/tmdb/' + p.Tmdb);
      if (p.Imdb) ids.push('movie/imdb/' + String(p.Imdb).toLowerCase());
    } else if (item.Type === 'Episode' && series && item.ParentIndexNumber != null && item.IndexNumber != null) {
      var sp = series.ProviderIds || {}, se = '/s' + item.ParentIndexNumber + 'e' + item.IndexNumber;
      if (sp.Tvdb) ids.push('tv/tvdb/' + sp.Tvdb + se);
      if (sp.Tmdb) ids.push('tv/tmdb/' + sp.Tmdb + se);
      if (sp.Imdb) ids.push('tv/imdb/' + String(sp.Imdb).toLowerCase() + se);
    }
    return ids;
  }

  // Which item is this browser playing?
  // 1. The stream itself: every request the player makes is /videos/<item id>/... (HLS segments,
  //    direct streams). That is always the current video, from its first second.
  // 2. Jellyfin's session for this device: only as a fallback, because it lags a few seconds
  //    behind a new video and still names the previous one in that window.
  var streamId = null;
  var since = 0;   // performance.now() when the current playback began; older requests belong to the last video
  var VIDEO_URL = /\/videos\/([0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12})\//i;
  try {
    new PerformanceObserver(function (list) {
      list.getEntries().forEach(function (e) {
        if (e.startTime < since) return;
        var m = VIDEO_URL.exec(e.name);
        if (m) streamId = m[1].replace(/-/g, '').toLowerCase();
      });
    }).observe({ type: 'resource', buffered: true });
    // A long video makes thousands of segment requests; keep the browser's timing buffer from
    // filling up, or new requests stop being reported at all.
    performance.setResourceTimingBufferSize && performance.setResourceTimingBufferSize(3000);
    performance.addEventListener && performance.addEventListener('resourcetimingbufferfull', function () { performance.clearResourceTimings(); });
  } catch (e) { /* very old browser: session fallback only */ }

  function sessionPlaying() {
    var c = C();
    return get('Sessions?deviceId=' + encodeURIComponent(c.deviceId())).then(function (list) {
      var s = (list || []).find(function (x) { return x.NowPlayingItem; });
      media.sessionId = s ? s.Id : null;
      return s ? String(s.NowPlayingItem.Id).replace(/-/g, '').toLowerCase() : null;
    });
  }

  // A new <video> source means a new playback: forget everything about the last one.
  var lastSrc = null;
  function playbackChanged() {
    var v = document.querySelector('video.htmlvideoplayer') || document.querySelector('.videoPlayerContainer video');
    var src = v ? (v.currentSrc || v.src || '') : '';
    if (src && src !== lastSrc) {
      var changed = lastSrc !== null;
      lastSrc = src;
      return changed;
    }
    return false;
  }

  function resolve(itemId) {
    var uid = C().getCurrentUserId();
    return get('Users/' + uid + '/Items/' + itemId).then(function (item) {
      var withSeries = item.Type === 'Episode' && item.SeriesId ? get('Users/' + uid + '/Items/' + item.SeriesId) : Promise.resolve(null);
      return withSeries.then(function (series) {
        var subtitle = item.Type === 'Episode'
          ? 'S' + String(item.ParentIndexNumber).padStart(2, '0') + 'E' + String(item.IndexNumber).padStart(2, '0') + (item.Name ? ' · ' + item.Name : '')
          : (item.ProductionYear ? String(item.ProductionYear) : '');
        return {
          key: itemId,
          ids: idsFor(item, series),
          title: item.Type === 'Episode' ? (item.SeriesName || (series && series.Name) || '') : item.Name,
          subtitle: subtitle,
          runtimeMs: item.RunTimeTicks ? Math.round(item.RunTimeTicks / 10000) : null,
        };
      });
    });
  }

  // for bug reports: window.__commentarrState() in the browser console
  window.__commentarrState = function () { return { streamId: streamId, since: Math.round(since), now: Math.round(performance.now()), stale: media.stale, forItem: media.forItem, lastSrc: lastSrc, session: media.sessionId }; };

  window.CommentarrAdapter = {
    getAuth: function () {
      return get('Commentarr/Token').then(function (r) {
        return { token: r.token || r.Token, exp: r.exp || r.Exp, serverUrl: r.serverUrl || r.ServerUrl };
      });
    },

    getMedia: function () {
      // On a new playback, the previous item is the one answer we must never accept again until
      // the stream confirms it (replaying the same title is the only case where it is right).
      if (playbackChanged()) { media.stale = media.forItem; media.value = null; media.forItem = null; streamId = null; since = performance.now() - 2000; }
      if (streamId && streamId === media.stale) media.stale = null;
      // The stream names the item directly; trust it whenever it disagrees with what we have.
      if (streamId && streamId !== media.forItem && !media.pending) {
        var sid = streamId;
        media.pending = resolve(sid).then(function (m) { media.forItem = sid; media.value = m; media.checkedAt = Date.now(); return m; })
          .catch(function () { return null; }) // e.g. an alternate version's media source id
          .then(function (v) { media.pending = null; return v; });
        sessionPlaying().catch(function () { }); // keeps sessionId fresh for seeking
        return media.pending;
      }
      if (media.pending) return media.pending;
      if (media.value && Date.now() - media.checkedAt < 4000) return Promise.resolve(media.value);
      media.pending = sessionPlaying().then(function (id) {
        media.checkedAt = Date.now();
        if (!id) return media.value;
        // While the stream says otherwise, the session is the stale one.
        if (streamId && id !== streamId) return media.value;
        // Right after switching videos the session still names the previous one: wait for the stream.
        if (!streamId && id === media.stale) return null;
        if (id === media.forItem && media.value) return media.value;
        return resolve(id).then(function (m) { media.forItem = id; media.value = m; return m; });
      }).catch(function () { return media.value; }).then(function (v) { media.pending = null; return v; });
      return media.pending;
    },

    getVideo: function () {
      if (!/\/video\b/.test(location.hash)) return null;
      var v = document.querySelector('video.htmlvideoplayer') || document.querySelector('.videoPlayerContainer video');
      return v && v.offsetParent !== null ? v : null;
    },

    seek: function (ms) {
      var c = C();
      if (media.sessionId) {
        fetch(c.getUrl('Sessions/' + media.sessionId + '/Playing/Seek?SeekPositionTicks=' + Math.round(ms * 10000)), { method: 'POST', headers: headers() })
          .catch(function () { var v = window.CommentarrAdapter.getVideo(); if (v) v.currentTime = ms / 1000; });
      } else {
        var v = window.CommentarrAdapter.getVideo(); if (v) v.currentTime = ms / 1000;
      }
    },

    controlsVisible: function () {
      var osd = document.querySelector('.videoOsdBottom');
      if (!osd) return false;
      var cs = getComputedStyle(osd);
      return !osd.classList.contains('hide') && !osd.classList.contains('videoOsdBottom-hidden') && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.2;
    },

    // A comments button in Jellyfin's own control row, styled like its neighbours (PiP, fullscreen).
    mountButton: function () {
      var anchor = document.querySelector('.videoOsdBottom .btnPip') || document.querySelector('.videoOsdBottom .btnFullscreen');
      if (!anchor || !anchor.parentNode) return null;
      var b = anchor.parentNode.querySelector('.btnCommentarr');
      if (!b) {
        b = document.createElement('button');
        b.setAttribute('is', 'paper-icon-button-light');
        b.className = 'btnCommentarr autoSize paper-icon-button-light';
        b.type = 'button';
        b.title = 'Comments';
        b.setAttribute('aria-label', 'Comments');
        b.setAttribute('aria-haspopup', 'menu');
        b.innerHTML = '<span class="xlargePaperIconButton material-icons forum" aria-hidden="true"></span>';
        anchor.parentNode.insertBefore(b, anchor);
      }
      return b;
    },

    controlsTop: function () {
      var osd = document.querySelector('.videoOsdBottom .osdControls') || document.querySelector('.videoOsdBottom');
      return osd ? osd.getBoundingClientRect().top : null;
    },
  };
})();
