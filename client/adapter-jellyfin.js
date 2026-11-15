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

  function localVideo() {
    if (!/\/video\b/.test(location.hash)) return null;
    var v = document.querySelector('video.htmlvideoplayer') || document.querySelector('.videoPlayerContainer video');
    return v && v.offsetParent !== null ? v : null;
  }

  // ------------------------------------------------ second screen (companion) --
  // Something playing on one of your other devices (a TV app, say) can be followed from here:
  // a pill offers "Comments for what's on Living Room TV", and the full comment panel then tracks
  // the TV's position. The plugin stamps every real progress report from the TV the moment it
  // arrives; we add the time since then plus half our round trip, keep our own clock running
  // between polls, and ease small differences away so the clock never jumps for nothing.
  var comp = { open: false, list: [], sel: null, anchor: null, lastPoll: 0, polling: false, missingSince: 0, dismissed: {}, pill: null };
  var POLL_OPEN = 500, POLL_IDLE = 5000, SNAP_MS = 400, LOST_GRACE = 20000;
  var lc = function (o) { var r = {}; for (var k in o) r[k.charAt(0).toLowerCase() + k.slice(1)] = o[k]; return r; };

  function poll() {
    comp.polling = true; comp.lastPoll = Date.now();
    var t0 = performance.now();
    get('Commentarr/NowPlaying?exclude=' + encodeURIComponent(C().deviceId())).then(function (r) {
      var t1 = performance.now(), half = (t1 - t0) / 2;
      comp.list = ((r.sessions || r.Sessions || []).map(lc)).map(function (x) {
        x.positionMs = Number(x.positionMs) || 0; x.ageMs = Number(x.ageMs) || 0; x.paused = !!x.paused;
        x.estMs = x.positionMs + (x.paused ? 0 : x.ageMs + half);
        x.at = t1;
        return x;
      });
      var cur = comp.sel && comp.list.find(function (x) { return x.sessionId === comp.sel.sessionId; });
      if (cur) { comp.sel = cur; comp.missingSince = 0; sync(cur); }
      else if (comp.open && comp.sel) {
        if (!comp.missingSince) comp.missingSince = Date.now();
        if (Date.now() - comp.missingSince > LOST_GRACE) { comp.sel = null; comp.anchor = null; }
        if (comp.anchor) comp.anchor = { sid: comp.anchor.sid, item: comp.anchor.item, paused: true, pos: compPos(), t: performance.now() };
      }
      if (!comp.open) comp.sel = comp.list[0] || null;
      if (comp.open && !comp.sel && comp.list[0]) { comp.sel = comp.list[0]; sync(comp.sel); }
      if (comp.open && !comp.sel) comp.open = false;
      drawPill();
    }, function () { }).then(function () { comp.polling = false; });
  }

  function sync(x) {
    var a = comp.anchor;
    if (!a || a.sid !== x.sessionId || a.item !== x.itemId || a.paused !== x.paused) {
      comp.anchor = { sid: x.sessionId, item: x.itemId, paused: x.paused, pos: x.estMs, t: x.at };
      return;
    }
    var predicted = a.pos + (a.paused ? 0 : x.at - a.t);
    var err = x.estMs - predicted;
    // a real jump (seek, buffering, a late report) snaps; network jitter is eased away
    a.pos = Math.abs(err) > SNAP_MS ? x.estMs : predicted + err * 0.25;
    a.t = x.at;
  }
  function compPos() { var a = comp.anchor; return a ? Math.max(0, a.pos + (a.paused ? 0 : performance.now() - a.t)) : 0; }
  function companionLive() { return comp.open && !!comp.sel && !!comp.anchor && !localVideo(); }

  function drawPill() {
    var show = !comp.open && comp.sel && !localVideo() && !comp.dismissed[comp.sel.sessionId + ':' + comp.sel.itemId];
    if (!show) { if (comp.pill) comp.pill.hidden = true; return; }
    if (!comp.pill) {
      comp.pill = document.createElement('div');
      comp.pill.className = 'cmtr cmtr-pillwrap';
      comp.pill.innerHTML = '<button type="button" class="cmtr-pill" data-open><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M20 12.2c0 4-3.6 7.1-8 7.1-1.1 0-2.2-.2-3.1-.5L4.5 20l1.2-3.4C4.6 15.4 4 13.9 4 12.2 4 8.2 7.6 5 12 5s8 3.2 8 7.2Z"/></svg><span><b>Comments</b><small></small></span></button>' +
        '<button type="button" class="cmtr-pill-x" data-dismiss aria-label="Not now"><svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8"/></svg></button>';
      comp.pill.addEventListener('click', function (e) {
        if (e.target.closest('[data-dismiss]')) { if (comp.sel) comp.dismissed[comp.sel.sessionId + ':' + comp.sel.itemId] = true; drawPill(); return; }
        if (e.target.closest('[data-open]')) window.CommentarrAdapter.openCompanion();
      });
    }
    if (!comp.pill.isConnected) document.body.appendChild(comp.pill);
    comp.pill.hidden = false;
    comp.pill.querySelector('small').textContent = (comp.sel.title || 'Now playing') + ' on ' + (comp.sel.deviceName || 'your other device');
    comp.pill.querySelector('[data-open]').setAttribute('aria-label', 'Comments for ' + comp.pill.querySelector('small').textContent);
  }

  function remote(action, ms) {
    var x = comp.sel; if (!x) return Promise.reject(new Error('Nothing playing'));
    var q = 'Commentarr/Remote/' + encodeURIComponent(x.sessionId) + '?action=' + action + (ms != null ? '&ms=' + Math.round(ms) : '');
    // move our own clock at once; the TV's next report confirms or corrects it
    var a = comp.anchor;
    if (a) {
      if (action === 'seek') { a.pos = ms; a.t = performance.now(); }
      else { a.pos = compPos(); a.t = performance.now(); a.paused = action === 'pause'; x.paused = a.paused; }
    }
    return fetch(C().getUrl(q), { method: 'POST', headers: headers() }).then(function (r) {
      if (!r.ok) return r.json().catch(function () { return {}; }).then(function (j) { throw new Error(j.error || j.Error || 'The TV didn\'t respond'); });
      setTimeout(poll, 1500);
    });
  }

  // for bug reports: window.__commentarrState() in the browser console
  window.__commentarrState = function () { return { streamId: streamId, since: Math.round(since), now: Math.round(performance.now()), stale: media.stale, forItem: media.forItem, lastSrc: lastSrc, session: media.sessionId, companion: { open: comp.open, sel: comp.sel, anchor: comp.anchor, posMs: Math.round(compPos()) } }; };

  window.CommentarrAdapter = {
    getAuth: function () {
      return get('Commentarr/Token').then(function (r) {
        return { token: r.token || r.Token, exp: r.exp || r.Exp, serverUrl: r.serverUrl || r.ServerUrl };
      });
    },

    getMedia: function () {
      if (companionLive()) {
        var cid = comp.sel.itemId;
        if (media.forItem === cid && media.value) return Promise.resolve(media.value);
        if (media.pending) return media.pending;
        media.pending = resolve(cid).then(function (m) { media.forItem = cid; media.value = m; media.checkedAt = Date.now(); return m; })
          .catch(function () { return null; }).then(function (v) { media.pending = null; return v; });
        return media.pending;
      }
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
      var v = localVideo();
      if (v) { if (comp.open) comp.open = false; if (comp.pill) comp.pill.hidden = true; return v; }
      var due = comp.open ? POLL_OPEN : POLL_IDLE;
      if (!comp.polling && Date.now() - comp.lastPoll > due && document.visibilityState !== 'hidden' && C() && C().accessToken && C().accessToken()) poll();
      if (!companionLive()) return null;
      // stands in for a <video>: where the TV is now, and which playback this is
      return { currentTime: compPos() / 1000, currentSrc: 'companion:' + comp.sel.sessionId + ':' + comp.sel.itemId };
    },

    // ---- second screen
    companion: companionLive,
    companionInfo: function () { var x = comp.sel || {}; return { device: x.deviceName || 'TV', paused: !!(comp.anchor && comp.anchor.paused), canControl: !!x.canControl, others: comp.list.length > 1 }; },
    openCompanion: function () { if (!comp.sel) return; comp.open = true; sync(comp.sel); drawPill(); poll(); },
    closeCompanion: function () { comp.open = false; comp.dismissed[comp.sel ? comp.sel.sessionId + ':' + comp.sel.itemId : ''] = false; drawPill(); },
    nextDevice: function () {
      if (comp.list.length < 2 || !comp.sel) return;
      var i = comp.list.findIndex(function (x) { return x.sessionId === comp.sel.sessionId; });
      comp.sel = comp.list[(i + 1) % comp.list.length]; comp.anchor = null; sync(comp.sel);
    },
    remote: remote,

    seek: function (ms) {
      if (companionLive()) { remote('seek', ms).catch(function (e) { alert(e.message); }); return; }
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
