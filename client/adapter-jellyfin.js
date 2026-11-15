/* Commentarr: Jellyfin web adapter. Loaded by the Commentarr Jellyfin plugin. AGPL-3.0-or-later. */
(function () {
  'use strict';
  var C = function () { return window.ApiClient || null; };
  var headers = function () { return { Authorization: 'MediaBrowser Token="' + C().accessToken() + '"', Accept: 'application/json' }; };
  var get = function (path) {
    return fetch(C().getUrl(path), { headers: headers(), cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('Jellyfin ' + r.status); return r.json(); });
  };

  var media = { forItem: null, value: null, pending: null, checkedAt: 0, sessionId: null };

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

  // Which item is this browser playing? Ask Jellyfin for this device's session.
  function nowPlaying() {
    var c = C();
    return get('Sessions?deviceId=' + encodeURIComponent(c.deviceId())).then(function (list) {
      var s = (list || []).find(function (x) { return x.NowPlayingItem; });
      media.sessionId = s ? s.Id : null;
      return s ? s.NowPlayingItem.Id : null;
    });
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

  window.CommentarrAdapter = {
    getAuth: function () {
      return get('Commentarr/Token').then(function (r) {
        return { token: r.token || r.Token, exp: r.exp || r.Exp, serverUrl: r.serverUrl || r.ServerUrl };
      });
    },

    getMedia: function () {
      // Re-check what's playing every few seconds (next episode, autoplay); otherwise reuse.
      if (media.pending) return media.pending;
      if (media.value && Date.now() - media.checkedAt < 4000) return Promise.resolve(media.value);
      media.pending = nowPlaying().then(function (id) {
        media.checkedAt = Date.now();
        if (!id) return media.value;
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
