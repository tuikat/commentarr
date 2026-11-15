/*! Commentarr 1.0.1 · https://github.com/tuikat/commentarr · AGPL-3.0-or-later */
window.__CMTR_CSS__ = "/* Commentarr player UI. Scoped under .cmtr-*; touches nothing of the host player.\n   Glass layers, continuous corners, one accent (the \"you are here\" marker and links). */\n.cmtr, .cmtr * { box-sizing: border-box; }\n.cmtr {\n  --c-text: #f5f5f7;\n  --c-text-2: rgba(235, 235, 245, 0.72);\n  --c-text-3: rgba(235, 235, 245, 0.52);\n  --c-accent: #0a84ff;\n  --c-glass: rgba(28, 28, 32, 0.72);\n  --c-glass-light: rgba(28, 28, 32, 0.5);\n  --c-fill: rgba(255, 255, 255, 0.1);\n  --c-fill-2: rgba(255, 255, 255, 0.17);\n  --c-blur: saturate(180%) blur(26px);\n  --c-rim: inset 0 0 0 0.5px rgba(255, 255, 255, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.1);\n  --c-ring: 0 0 0 2px rgba(0, 0, 0, 0.6), 0 0 0 4px rgba(255, 255, 255, 0.92);\n  --c-ease: cubic-bezier(0.25, 0.8, 0.25, 1);\n  font: 14px/1.45 -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Helvetica Neue\", Inter, \"Segoe UI\", system-ui, sans-serif;\n  color: var(--c-text);\n  -webkit-font-smoothing: antialiased;\n  letter-spacing: -0.006em;\n}\n@supports (corner-shape: squircle) {\n  .cmtr-menu, .cmtr-side, .cmtr-mini, .cmtr-mini-item, .cmtr-compose, .cmtr-btn, .cmtr-input, .cmtr-chip, .cmtr-seg, .cmtr-seg button { corner-shape: squircle; }\n}\n.cmtr button { font: inherit; color: inherit; }\n.cmtr button:focus-visible, .cmtr textarea:focus-visible, .cmtr input:focus-visible { outline: none; box-shadow: var(--c-ring); }\n\n/* --------------------------------------------------------- player button -- */\n.cmtr-fab {\n  position: fixed; right: 20px; bottom: 112px; z-index: 2147483000;\n  width: 44px; height: 44px; border: 0; border-radius: 50%;\n  display: grid; place-items: center; cursor: pointer;\n  background: var(--c-glass-light); box-shadow: var(--c-rim);\n  -webkit-backdrop-filter: var(--c-blur); backdrop-filter: var(--c-blur);\n  transition: opacity 0.25s var(--c-ease), background-color 0.18s var(--c-ease), transform 0.18s var(--c-ease);\n}\n.cmtr-fab:hover { background: var(--c-glass); }\n.cmtr-fab:active { transform: scale(0.94); }\n.cmtr-fab.is-idle { opacity: 0; pointer-events: none; }\n.cmtr-fab svg { width: 21px; height: 21px; }\n.cmtr-fab-count {\n  position: absolute; top: -4px; right: -4px; min-width: 20px; height: 20px; padding: 0 6px;\n  border-radius: 999px; background: #f5f5f7; color: #0b0b0d; font-size: 11px; font-weight: 700;\n  display: grid; place-items: center; font-variant-numeric: tabular-nums;\n}\n.cmtr-fab-count:empty { display: none; }\n\n/* the small menu that opens in place */\n.cmtr-menu {\n  position: fixed; right: 20px; bottom: 166px; z-index: 2147483001; width: 236px; padding: 6px;\n  border-radius: 20px; background: var(--c-glass); box-shadow: var(--c-rim), 0 18px 50px rgba(0, 0, 0, 0.5);\n  -webkit-backdrop-filter: var(--c-blur); backdrop-filter: var(--c-blur);\n  animation: cmtr-pop 0.18s var(--c-ease); transform-origin: 90% 100%;\n}\n.cmtr-menu[hidden] { display: none; }\n@keyframes cmtr-pop { from { opacity: 0; transform: scale(0.94) translateY(6px); } }\n.cmtr-menu-head { padding: 8px 12px 6px; font-size: 12px; color: var(--c-text-3); }\n.cmtr-menu button {\n  display: flex; align-items: center; justify-content: space-between; width: 100%;\n  border: 0; background: none; padding: 10px 12px; border-radius: 13px; cursor: pointer; text-align: left; font-weight: 500;\n}\n.cmtr-menu button:hover { background: var(--c-fill); }\n.cmtr-menu button[aria-checked=\"true\"]::after { content: \"\"; width: 7px; height: 7px; border-radius: 50%; background: var(--c-text); }\n.cmtr-menu small { display: block; color: var(--c-text-3); font-size: 12px; font-weight: 400; }\n\n/* ------------------------------------------------------------ overlay mode -- */\n.cmtr-corner {\n  position: fixed; top: 84px; right: 20px; z-index: 2147482999; width: min(320px, calc(100vw - 40px));\n  display: flex; flex-direction: column; gap: 8px; pointer-events: none;\n}\n.cmtr-corner > * { pointer-events: auto; }\n/* the live panel: four moments, always on, small */\n.cmtr-mini {\n  display: flex; flex-direction: column; gap: 6px; padding: 10px 10px 8px;\n  border-radius: 22px; background: rgba(18, 18, 22, 0.46); box-shadow: var(--c-rim);\n  -webkit-backdrop-filter: var(--c-blur); backdrop-filter: var(--c-blur);\n}\n.cmtr-mini-head { display: flex; align-items: center; gap: 4px; padding: 0 2px 0 6px; }\n.cmtr-mini-label { flex: 1; min-width: 0; font-size: 12px; font-weight: 600; color: var(--c-text-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.cmtr-icon { border: 0; width: 28px; height: 28px; border-radius: 50%; background: transparent; color: var(--c-text-2); display: grid; place-items: center; cursor: pointer; flex: none; }\n.cmtr-icon:hover { background: var(--c-fill); color: var(--c-text); }\n.cmtr-icon svg { width: 13px; height: 13px; }\n.cmtr-mini-list { display: flex; flex-direction: column; gap: 2px; }\n.cmtr-mini-item {\n  padding: 6px 8px; border-radius: 12px; font-size: 13.5px; line-height: 19px; color: var(--c-text);\n  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word;\n  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.35);\n}\n.cmtr-mini-item b { font-weight: 600; color: var(--c-text-2); margin-right: 2px; }\n.cmtr-mini-item .cmtr-time { font-size: 11.5px; line-height: 18px; padding: 0 6px; margin-right: 2px; vertical-align: 1px; }\n.cmtr-mini-item.is-new { animation: cmtr-in 0.4s var(--c-ease); }\n.cmtr-mini-likes { color: var(--c-text-3); font-size: 12px; white-space: nowrap; }\n.cmtr-mini-empty { margin: 0; padding: 6px 8px 8px; font-size: 13px; color: var(--c-text-2); }\n.cmtr-mini-compose .cmtr-compose { margin: 2px 0 0; padding: 6px 6px 6px 8px; border-radius: 16px; background: rgba(255, 255, 255, 0.07); box-shadow: none; -webkit-backdrop-filter: none; backdrop-filter: none; }\n.cmtr-mini-compose .cmtr-input { font-size: 13.5px; line-height: 19px; min-height: 24px; padding: 3px 4px; }\n.cmtr-mini-compose .cmtr-compose-bar { margin-top: 4px; }\n.cmtr-mini-compose .cmtr-chip { height: 24px; font-size: 11.5px; padding: 0 9px; }\n.cmtr-mini-compose .cmtr-btn { height: 26px; font-size: 12px; padding: 0 12px; }\n@keyframes cmtr-in { from { opacity: 0; transform: translateY(6px); } }\n\n/* -------------------------------------------------------------- sidebar mode -- */\n.cmtr-side {\n  position: fixed; top: 12px; right: 12px; bottom: 12px; z-index: 2147482999; width: min(400px, calc(100vw - 24px));\n  display: flex; flex-direction: column; border-radius: 26px; overflow: hidden;\n  background: var(--c-glass); box-shadow: var(--c-rim), 0 24px 70px rgba(0, 0, 0, 0.5);\n  -webkit-backdrop-filter: var(--c-blur); backdrop-filter: var(--c-blur);\n  animation: cmtr-slide 0.28s var(--c-ease);\n}\n@keyframes cmtr-slide { from { opacity: 0; transform: translateX(24px); } }\n.cmtr-side-head { padding: 18px 18px 10px; display: grid; grid-template-columns: 1fr auto; gap: 2px 12px; align-items: start; }\n.cmtr-side-head h2 { margin: 0; font-size: 19px; line-height: 24px; font-weight: 700; letter-spacing: -0.02em; }\n.cmtr-side-head p { margin: 0; grid-column: 1; color: var(--c-text-2); font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.cmtr-x { grid-row: 1 / span 2; grid-column: 2; width: 32px; height: 32px; border: 0; border-radius: 50%; background: var(--c-fill); cursor: pointer; display: grid; place-items: center; }\n.cmtr-x:hover { background: var(--c-fill-2); }\n.cmtr-x svg { width: 13px; height: 13px; }\n\n.cmtr-tools { display: flex; gap: 8px; align-items: center; justify-content: space-between; padding: 0 18px 12px; flex-wrap: wrap; }\n.cmtr-seg { display: inline-flex; padding: 3px; gap: 2px; border-radius: 999px; background: var(--c-fill); }\n.cmtr-seg button { border: 0; background: none; height: 28px; padding: 0 12px; border-radius: 999px; cursor: pointer; font-weight: 600; font-size: 13px; color: var(--c-text-2); }\n.cmtr-seg button[aria-pressed=\"true\"] { background: rgba(255, 255, 255, 0.18); color: var(--c-text); }\n\n.cmtr-list { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 4px 10px 12px; scrollbar-width: thin; }\n.cmtr-item { padding: 10px 8px 10px 10px; border-radius: 16px; position: relative; }\n.cmtr-item:hover { background: rgba(255, 255, 255, 0.04); }\n.cmtr-item.is-new { animation: cmtr-in 0.4s var(--c-ease); }\n.cmtr-replies { margin-left: 22px; }\n.cmtr-who { display: flex; align-items: baseline; gap: 6px; font-size: 13px; }\n.cmtr-who b { font-weight: 600; }\n.cmtr-who span { color: var(--c-text-3); font-size: 12px; }\n.cmtr-body { margin-top: 2px; white-space: pre-wrap; word-break: break-word; }\n.cmtr-body a, .cmtr-time {\n  color: var(--c-text); font-weight: 600; text-decoration: none; cursor: pointer;\n  background: var(--c-fill); border: 0; border-radius: 999px; padding: 0 7px; font-variant-numeric: tabular-nums; font-size: 12.5px; line-height: 20px; display: inline-block;\n}\n.cmtr-body a:hover, .cmtr-time:hover { background: var(--c-fill-2); }\n.cmtr-acts { display: flex; gap: 2px; margin-top: 4px; margin-left: -6px; }\n.cmtr-acts button { border: 0; background: none; color: var(--c-text-3); font-size: 12px; font-weight: 600; padding: 3px 7px; border-radius: 999px; cursor: pointer; }\n.cmtr-acts button:hover { color: var(--c-text); background: var(--c-fill); }\n.cmtr-acts button[aria-pressed=\"true\"] { color: var(--c-text); }\n.cmtr-note { color: var(--c-text-3); font-size: 12px; }\n.cmtr-spoiler .cmtr-body { filter: blur(6px); user-select: none; }\n.cmtr-reveal { border: 0; background: var(--c-fill); border-radius: 999px; font-size: 12px; font-weight: 600; padding: 2px 9px; cursor: pointer; margin-top: 4px; }\n\n.cmtr-now { display: flex; align-items: center; gap: 8px; margin: 6px 10px; color: var(--c-accent); font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }\n.cmtr-now::before, .cmtr-now::after { content: \"\"; flex: 1; height: 1px; background: currentColor; opacity: 0.6; }\n.cmtr-empty { margin: 12px 10px; padding: 18px; border-radius: 16px; background: rgba(255, 255, 255, 0.04); color: var(--c-text-2); }\n\n.cmtr-compose { margin: 0 12px 12px; padding: 10px; border-radius: 18px; background: rgba(255, 255, 255, 0.07); }\n.cmtr-input { width: 100%; resize: none; border: 0; background: transparent; color: var(--c-text); font: inherit; font-size: 15px; line-height: 21px; padding: 4px 6px; min-height: 30px; max-height: 140px; }\n.cmtr-input::placeholder { color: var(--c-text-3); }\n.cmtr-compose-bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 6px; }\n.cmtr-chip { border: 0; height: 28px; padding: 0 11px; border-radius: 999px; background: var(--c-fill); color: var(--c-text-2); font-size: 12.5px; font-weight: 600; cursor: pointer; font-variant-numeric: tabular-nums; }\n.cmtr-chip[aria-pressed=\"true\"] { background: rgba(255, 255, 255, 0.2); color: var(--c-text); }\n.cmtr-btn { border: 0; height: 30px; padding: 0 14px; border-radius: 999px; background: #f5f5f7; color: #0b0b0d !important; font-size: 13px; font-weight: 700; cursor: pointer; }\n.cmtr-btn.ghost { background: var(--c-fill); color: var(--c-text) !important; font-weight: 600; }\n.cmtr-btn:disabled { opacity: 0.45; cursor: default; }\n.cmtr-err { color: #ffb4ab; font-size: 12.5px; padding: 6px 6px 0; }\n.cmtr-err:empty { display: none; }\n.cmtr-replying { font-size: 12px; color: var(--c-text-2); padding: 0 6px 4px; display: flex; justify-content: space-between; }\n.cmtr-replying button { border: 0; background: none; color: var(--c-text-3); cursor: pointer; font-size: 12px; }\n\n.cmtr-foot { padding: 10px 18px 14px; display: flex; justify-content: space-between; gap: 8px; font-size: 12px; color: var(--c-text-3); }\n.cmtr-foot button { border: 0; background: none; color: var(--c-text-2); cursor: pointer; font-size: 12px; text-decoration: underline; text-underline-offset: 3px; padding: 0; }\n\n/* item menu (report / delete / hide) */\n.cmtr-pop { position: fixed; z-index: 2147483002; min-width: 190px; padding: 5px; border-radius: 16px; background: rgba(36, 36, 40, 0.92); box-shadow: var(--c-rim), 0 16px 40px rgba(0, 0, 0, 0.5); -webkit-backdrop-filter: var(--c-blur); backdrop-filter: var(--c-blur); }\n.cmtr-pop button { display: block; width: 100%; text-align: left; border: 0; background: none; padding: 9px 12px; border-radius: 11px; cursor: pointer; }\n.cmtr-pop button:hover { background: var(--c-fill); }\n\n/* ------------------------------------------------------------------ phone -- */\n@media (max-width: 640px) {\n  .cmtr-fab { right: 14px; bottom: 132px; }\n  .cmtr-menu { right: 14px; bottom: 186px; }\n  .cmtr-corner { top: 64px; right: 12px; width: calc(100vw - 24px); }\n  .cmtr-mini-item { -webkit-line-clamp: 2; }\n  .cmtr-side { top: auto; left: 0; right: 0; bottom: 0; width: 100%; height: 62vh; height: 62dvh; border-radius: 26px 26px 0 0; padding-bottom: env(safe-area-inset-bottom, 0px); animation-name: cmtr-up; }\n  @keyframes cmtr-up { from { opacity: 0.4; transform: translateY(30px); } }\n}\n@media (prefers-reduced-transparency: reduce) {\n  .cmtr-fab, .cmtr-menu, .cmtr-side, .cmtr-mini, .cmtr-pop { background: #1f1f23; -webkit-backdrop-filter: none; backdrop-filter: none; }\n}\n@media (prefers-reduced-motion: reduce) {\n  .cmtr *, .cmtr-fab, .cmtr-menu, .cmtr-side { animation: none !important; transition: none !important; }\n}\n\n/* the live panel's composer is one row: text, the \"At 2:40\" chip, Post */\n.cmtr-mini-compose .cmtr-compose { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }\n.cmtr-mini-compose .cmtr-input { flex: 1 1 120px; min-width: 0; }\n.cmtr-mini-compose .cmtr-compose-bar { margin: 0; flex: none; gap: 6px; }\n.cmtr-mini-compose .cmtr-err { flex-basis: 100%; }\n@media (max-width: 640px) {\n  /* three newest moments on a phone, so the panel stays out of the picture */\n  .cmtr-mini-item:first-child:nth-last-child(4) { display: none; }\n  .cmtr-mini { padding: 8px 8px 6px; gap: 4px; }\n  .cmtr-mini-item { font-size: 13px; line-height: 18px; padding: 4px 6px; }\n}\n";
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

/*
 * Commentarr: player UI core. AGPL-3.0-or-later. https://github.com/tuikat/commentarr
 *
 * Host-agnostic: an adapter (Jellyfin plugin, Plex userscript) tells the core how to get a
 * comment-server token, what is playing, where the <video> is and how to seek. The core draws
 * the player button, its menu, the overlay and the sidebar, and talks to the comment server.
 *
 * Adapter interface (window.CommentarrAdapter):
 *   getAuth()        -> Promise<{ token, exp, serverUrl }>
 *   getMedia()       -> Promise<{ key, ids: string[], title, subtitle, runtimeMs } | null>
 *   getVideo()       -> HTMLVideoElement | null   (null = no player on screen)
 *   seek(ms)         -> void
 *   controlsVisible()-> boolean                   (host's own player controls showing)
 *   controlsTop()    -> number | null             (px from viewport top of the host control bar)
 */
(function () {
  'use strict';
  if (window.__cmtrCore) return;
  window.__cmtrCore = true;

  var A = null;                      // the adapter
  var LS = 'commentarr:';
  var pref = function (k, d) { try { var v = localStorage.getItem(LS + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  var setPref = function (k, v) { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e) { } };

  var S = {
    auth: null, me: null, media: null, comments: [], loadedKey: null,
    mode: pref('mode', 'overlay'),      // overlay | sidebar | off
    sort: pref('sort', 'top'),           // top | new
    spoilers: pref('spoilers', false),   // hide pinned comments you haven't reached yet
    menuOpen: false, replyTo: null, pinNow: null, revealed: {},
    miniKey: null,
    es: null, posMs: 0, error: '',
  };

  var ICON = {
    bubble: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M20 12.2c0 4-3.6 7.1-8 7.1-1.1 0-2.2-.2-3.1-.5L4.5 20l1.2-3.4C4.6 15.4 4 13.9 4 12.2 4 8.2 7.6 5 12 5s8 3.2 8 7.2Z"/></svg>',
    x: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8"/></svg>',
  };

  // ------------------------------------------------------------ utilities --
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function clock(ms) {
    var s = Math.max(0, Math.floor(ms / 1000)), hh = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
    return (hh ? hh + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0');
  }
  function ago(t) {
    var d = (Date.now() - t) / 1000;
    if (d < 60) return 'just now';
    if (d < 3600) return Math.floor(d / 60) + ' min ago';
    if (d < 86400) return Math.floor(d / 3600) + ' h ago';
    if (d < 86400 * 30) return Math.floor(d / 86400) + ' d ago';
    return new Date(t).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  }
  // "18:32" or "1:02:03" inside a comment becomes a jump link
  function linkify(text) {
    return esc(text).replace(/(^|[\s(])((?:\d{1,2}:)?\d{1,2}:\d{2})(?=$|[\s).,!?])/g, function (all, pre, t) {
      var p = t.split(':').map(Number), ms = (p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]) * 1000;
      return pre + '<a href="#" data-seek="' + ms + '">' + t + '</a>';
    });
  }

  // ------------------------------------------------------------ server API --
  function authed() {
    if (S.auth && S.auth.exp - Date.now() > 120000) return Promise.resolve(S.auth);
    return A.getAuth().then(function (a) { S.auth = a; return a; });
  }
  function api(method, path, body) {
    return authed().then(function (a) {
      return fetch(a.serverUrl.replace(/\/+$/, '') + '/api/v1' + path, {
        method: method,
        headers: { Authorization: 'Bearer ' + a.token, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (r.status === 401) S.auth = null;
          if (!r.ok) throw new Error(j.error || 'The comment server said no (' + r.status + ').');
          return j;
        });
      });
    });
  }

  // ------------------------------------------------------------ the button --
  var root = h('div', 'cmtr');
  var fab = h('button', 'cmtr-fab is-idle', ICON.bubble + '<span class="cmtr-fab-count"></span>');
  fab.type = 'button';
  fab.setAttribute('aria-label', 'Comments');
  fab.setAttribute('aria-haspopup', 'menu');
  var menu = h('div', 'cmtr-menu'); menu.hidden = true; menu.setAttribute('role', 'menu');
  var corner = h('div', 'cmtr-corner');
  var side = null;
  root.appendChild(fab); root.appendChild(menu); root.appendChild(corner);

  // The host's own control-row button when the adapter can provide one; the floating button otherwise.
  var hostBtn = null;
  function toggleMenu(e) { e.preventDefault(); e.stopPropagation(); S.menuOpen = !S.menuOpen; renderMenu(); }
  fab.addEventListener('click', toggleMenu);
  document.addEventListener('click', function (e) {
    if (S.menuOpen && !menu.contains(e.target) && e.target !== fab && !(hostBtn && hostBtn.contains(e.target))) { S.menuOpen = false; renderMenu(); }
    closePop(e);
  }, true);

  function trigger() { return hostBtn && hostBtn.isConnected ? hostBtn : fab; }

  function placeMenu() {
    var t = trigger();
    if (t === fab) { menu.style.right = ''; return; }
    var r = t.getBoundingClientRect();
    menu.style.bottom = Math.max(12, window.innerHeight - r.top + 10) + 'px';
    menu.style.right = Math.max(12, Math.min(window.innerWidth - 248, window.innerWidth - r.right - 8)) + 'px';
  }

  function renderMenu() {
    menu.hidden = !S.menuOpen;
    trigger().setAttribute('aria-expanded', S.menuOpen);
    if (!S.menuOpen) return;
    placeMenu();
    var n = S.comments.length;
    var opt = function (mode, label, sub) { return '<button type="button" role="menuitemradio" aria-checked="' + (S.mode === mode) + '" data-mode="' + mode + '"><span>' + label + '<small>' + sub + '</small></span></button>'; };
    menu.innerHTML = '<div class="cmtr-menu-head">' + (S.media ? (n === 1 ? '1 comment' : n + ' comments') + ' on this ' + (S.media.ids[0].indexOf('movie/') === 0 ? 'film' : 'episode') : 'Comments') + '</div>' +
      opt('overlay', 'Overlay', 'A small live panel in the corner') +
      opt('sidebar', 'Sidebar', 'Every comment, beside the video') +
      opt('off', 'Off', 'Hide comments while watching');
  }
  menu.addEventListener('click', function (e) {
    var b = e.target.closest('[data-mode]'); if (!b) return;
    setMode(b.getAttribute('data-mode'));
    S.menuOpen = false; renderMenu();
  });

  function setMode(m) { S.mode = m; setPref('mode', m); render(); }

  // --------------------------------------------------------- loading data --
  function loadComments() {
    if (!S.media) return Promise.resolve();
    return api('GET', '/comments?sort=' + S.sort + '&ids=' + encodeURIComponent(S.media.ids.join(','))).then(function (r) {
      S.comments = r.comments || [];
      S.error = '';
      fab.querySelector('.cmtr-fab-count').textContent = S.comments.length ? (S.comments.length > 99 ? '99+' : S.comments.length) : '';
      render();
    }, function (e) { S.error = e.message; render(); });
  }

  function openStream() {
    closeStream();
    if (!S.media || typeof EventSource === 'undefined') return;
    authed().then(function (a) {
      var url = a.serverUrl.replace(/\/+$/, '') + '/api/v1/stream?ids=' + encodeURIComponent(S.media.ids.join(',')) + '&token=' + encodeURIComponent(a.token);
      var es = new EventSource(url);
      S.es = es;
      es.addEventListener('comment', function (ev) {
        var c; try { c = JSON.parse(ev.data); } catch (e) { return; }
        if (S.comments.some(function (x) { return x.id === c.id; })) return;
        c.isNew = true;
        S.comments.unshift(c);
        fab.querySelector('.cmtr-fab-count').textContent = S.comments.length;
        render();
      });
      es.addEventListener('removed', function (ev) {
        var id; try { id = JSON.parse(ev.data).id; } catch (e) { return; }
        S.comments = S.comments.filter(function (x) { return x.id !== id && x.parentId !== id; });
        render();
      });
      es.onerror = function () { if (es.readyState === 2) { S.es = null; setTimeout(function () { if (S.media && !S.es) openStream(); }, 10000); } };
    }).catch(function () { });
  }
  function closeStream() { if (S.es) { S.es.close(); S.es = null; } }

  // ---------------------------------------------------------- rendering --
  function isMovie() { return S.media && S.media.ids[0].indexOf('movie/') === 0; }
  function differentCut(c) { return c.posMs != null && c.runtimeMs && S.media && S.media.runtimeMs && Math.abs(c.runtimeMs - S.media.runtimeMs) / S.media.runtimeMs > 0.03; }
  function hiddenAsSpoiler(c) { return S.spoilers && c.posMs != null && c.posMs > S.posMs + 1000 && !S.revealed[c.id]; }

  function itemHtml(c) {
    var spoiler = hiddenAsSpoiler(c);
    var server = c.author.sameServer ? '' : ' · ' + esc(c.author.server);
    return '<div class="cmtr-item' + (spoiler ? ' cmtr-spoiler' : '') + (c.isNew ? ' is-new' : '') + '" data-id="' + c.id + '">' +
      '<div class="cmtr-who"><b>' + esc(c.author.name) + (c.mine ? ' (you)' : '') + '</b><span>' + server + ' · ' + ago(c.createdAt) + '</span></div>' +
      '<div class="cmtr-body">' + (c.posMs != null ? '<button type="button" class="cmtr-time" data-seek="' + c.posMs + '" aria-label="Jump to ' + clock(c.posMs) + '">' + clock(c.posMs) + '</button> ' : '') + linkify(c.body) + '</div>' +
      (spoiler ? '<button type="button" class="cmtr-reveal" data-reveal="' + c.id + '">Spoiler at ' + clock(c.posMs) + ' · show</button>' : '') +
      (differentCut(c) ? '<div class="cmtr-note">Written on a different cut, so the moment may be off.</div>' : '') +
      '<div class="cmtr-acts">' +
        '<button type="button" data-like="' + c.id + '" aria-pressed="' + !!c.liked + '">' + (c.liked ? 'Liked' : 'Like') + (c.likes ? ' · ' + c.likes : '') + '</button>' +
        (c.parentId ? '' : '<button type="button" data-reply="' + c.id + '">Reply</button>') +
        '<button type="button" data-more="' + c.id + '" aria-label="More actions">•••</button>' +
      '</div></div>';
  }

  function listHtml() {
    if (S.error) return '<div class="cmtr-empty">' + esc(S.error) + '</div>';
    if (!S.media) return '<div class="cmtr-empty">Finding this title…</div>';
    if (!S.media.ids.length) return '<div class="cmtr-empty">This ' + (isMovie() ? 'film' : 'episode') + ' has no TMDB, TVDB or IMDb id in your library, so it can\'t join a shared thread. Refreshing its metadata usually fixes that.</div>';
    var tops = S.comments.filter(function (c) { return !c.parentId; });
    if (!tops.length) return '<div class="cmtr-empty">No comments yet. Be the first: pin one to this moment and everyone who watches later will see it here.</div>';
    var replies = {};
    S.comments.forEach(function (c) { if (c.parentId) (replies[c.parentId] = replies[c.parentId] || []).push(c); });
    var out = '', nowPlaced = false;
    var sorted = tops.slice();
    if (S.sort === 'time') sorted.sort(function (a, b) { return (a.posMs == null ? 1e15 : a.posMs) - (b.posMs == null ? 1e15 : b.posMs); });
    sorted.forEach(function (c) {
      if (S.sort === 'time' && !nowPlaced && c.posMs != null && c.posMs > S.posMs) { out += '<div class="cmtr-now">Now · ' + clock(S.posMs) + '</div>'; nowPlaced = true; }
      out += itemHtml(c);
      var r = replies[c.id];
      if (r) out += '<div class="cmtr-replies">' + r.sort(function (a, b) { return a.createdAt - b.createdAt; }).map(itemHtml).join('') + '</div>';
    });
    S.comments.forEach(function (c) { delete c.isNew; });
    return out;
  }

  // Pin to the current moment by default mid-video; not in the first 2 min or the credits.
  function defaultPin() {
    var rt = S.media && S.media.runtimeMs;
    return S.posMs > 120000 && (!rt || S.posMs < rt * 0.92);
  }

  function composerHtml(where) {
    var pin = S.pinNow == null ? defaultPin() : S.pinNow;
    var reply = S.replyTo && S.comments.find(function (c) { return c.id === S.replyTo; });
    var name = S.me ? esc(S.me.name) : '';
    return '<form class="cmtr-compose" data-where="' + where + '">' +
      (reply ? '<div class="cmtr-replying"><span>Replying to ' + esc(reply.author.name) + '</span><button type="button" data-cancel-reply>Cancel</button></div>' : '') +
      '<textarea class="cmtr-input" rows="1" maxlength="1000" placeholder="' + (S.me && S.me.canPost === false ? 'Commenting is turned off for you' : 'Comment as ' + name + '…') + '" aria-label="Write a comment"' + (S.me && S.me.canPost === false ? ' disabled' : '') + '></textarea>' +
      '<div class="cmtr-compose-bar">' +
        (reply ? '<span></span>' : '<button type="button" class="cmtr-chip" data-pin aria-pressed="' + pin + '" title="Show this comment at this moment for everyone">At ' + clock(S.posMs) + '</button>') +
        '<button type="submit" class="cmtr-btn">Post</button>' +
      '</div><div class="cmtr-err" role="alert"></div></form>';
  }

  function render() {
    if (!root.isConnected) return;
    var playing = !!A.getVideo();
    fab.style.display = playing && !(hostBtn && hostBtn.isConnected) ? '' : 'none';
    if (!playing) { corner.innerHTML = ''; removeSide(); return; }

    // overlay: a small, always-on panel of the latest moments, with a one-line composer
    if (S.mode === 'overlay') {
      removeSide();
      if (!corner.querySelector('.cmtr-mini')) {
        corner.innerHTML =
          '<section class="cmtr-mini" aria-label="Comments">' +
            '<header class="cmtr-mini-head"><span class="cmtr-mini-label"></span>' +
              '<button type="button" class="cmtr-icon" data-mode-to="sidebar" aria-label="Show all comments" title="All comments"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9"/></svg></button>' +
              '<button type="button" class="cmtr-icon" data-mode-to="off" aria-label="Hide comments" title="Hide">' + ICON.x + '</button></header>' +
            '<div class="cmtr-mini-list" aria-live="polite"></div>' +
            '<div class="cmtr-mini-compose"></div>' +
          '</section>';
        corner.querySelector('.cmtr-mini-compose').innerHTML = composerHtml('corner');
        S.miniKey = null;
      }
      renderMini();
    } else {
      corner.innerHTML = '';
    }

    if (S.mode === 'sidebar') renderSide(); else removeSide();
    if (S.menuOpen) renderMenu();
  }

  function renderSide() {
    var first = !side;
    if (first) {
      side = h('section', 'cmtr-side');
      side.setAttribute('role', 'complementary');
      side.setAttribute('aria-label', 'Comments');
      side.innerHTML =
        '<header class="cmtr-side-head"><h2>Comments</h2><button type="button" class="cmtr-x" data-mode-to="off" aria-label="Close comments">' + ICON.x + '</button><p class="cmtr-sub"></p></header>' +
        '<div class="cmtr-tools"><div class="cmtr-seg" role="group" aria-label="Sort">' +
          '<button type="button" data-sort="top">Top</button><button type="button" data-sort="new">New</button><button type="button" data-sort="time">By time</button></div>' +
          '<button type="button" class="cmtr-chip" data-spoilers>Spoilers</button></div>' +
        '<div class="cmtr-slot-compose"></div>' +
        '<div class="cmtr-list" aria-live="polite"></div>' +
        '<footer class="cmtr-foot"><span class="cmtr-me"></span><button type="button" data-rename>Change name</button></footer>';
      root.appendChild(side);
    }
    var sub = S.media ? (S.media.title + (S.media.subtitle ? ' · ' + S.media.subtitle : '')) : '';
    side.querySelector('.cmtr-sub').textContent = sub;
    side.querySelectorAll('[data-sort]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-sort') === S.sort); });
    var sp = side.querySelector('[data-spoilers]');
    sp.setAttribute('aria-pressed', S.spoilers);
    sp.title = S.spoilers ? 'Comments pinned ahead of you are blurred' : 'Blur comments pinned ahead of where you are';
    sp.textContent = S.spoilers ? 'Spoilers hidden' : 'Spoilers shown';
    var slot = side.querySelector('.cmtr-slot-compose');
    var form = slot.querySelector('form');
    var keep = form && document.activeElement === form.querySelector('textarea');
    if (!keep) slot.innerHTML = composerHtml('side');
    else { var chip = form.querySelector('[data-pin]'); if (chip && S.pinNow == null) { chip.setAttribute('aria-pressed', defaultPin()); } if (chip) chip.textContent = 'At ' + clock(S.posMs); }
    var list = side.querySelector('.cmtr-list'), top = list.scrollTop;
    list.innerHTML = listHtml();
    list.scrollTop = top;
    side.querySelector('.cmtr-me').textContent = S.me ? 'You are ' + S.me.name : '';
  }
  function removeSide() { if (side) { side.remove(); side = null; } }

  // ------------------------------------------------- the live panel --
  // The four latest moments you've passed, oldest at the top, the newest sliding in at the bottom
  // as you reach it, like a live chat replay. Before the first pinned moment it shows the top
  // whole-title comments instead, so the panel is never empty when there is something to read.
  var MINI_MAX = 4;
  function miniPick() {
    var tops = S.comments.filter(function (c) { return !c.parentId; });
    var moments = tops.filter(function (c) { return c.posMs != null && !differentCut(c) && c.posMs <= S.posMs + 500; })
      .sort(function (a, b) { return a.posMs - b.posMs || a.createdAt - b.createdAt; });
    if (moments.length) return { label: 'At this point', items: moments.slice(-MINI_MAX) };
    var general = tops.filter(function (c) { return c.posMs == null; })
      .sort(function (a, b) { return b.likes - a.likes || b.createdAt - a.createdAt; }).slice(0, MINI_MAX);
    return { label: general.length ? 'Top comments' : '', items: general };
  }

  function renderMini() {
    var box = corner.querySelector('.cmtr-mini'); if (!box) return;
    var n = S.comments.length;
    var pick = miniPick();
    box.querySelector('.cmtr-mini-label').textContent = 'Comments' + (n ? ' · ' + n : '') + (pick.label ? ' · ' + pick.label : '');
    var key = pick.items.map(function (c) { return c.id + ':' + c.likes; }).join(',') + '|' + (S.error || '');
    if (key === S.miniKey) return;
    var before = {};
    box.querySelectorAll('.cmtr-mini-item').forEach(function (el) { before[el.getAttribute('data-id')] = true; });
    S.miniKey = key;
    var list = box.querySelector('.cmtr-mini-list');
    if (S.error) { list.innerHTML = '<p class="cmtr-mini-empty">' + esc(S.error) + '</p>'; return; }
    if (!pick.items.length) {
      list.innerHTML = '<p class="cmtr-mini-empty">' + (n ? 'Comments show up here as you reach their moment.' : 'No comments yet. Say something about this moment.') + '</p>';
      return;
    }
    list.innerHTML = pick.items.map(function (c) {
      return '<div class="cmtr-mini-item' + (before[c.id] ? '' : ' is-new') + '" data-id="' + c.id + '">' +
        (c.posMs != null ? '<button type="button" class="cmtr-time" data-seek="' + c.posMs + '" aria-label="Jump to ' + clock(c.posMs) + '">' + clock(c.posMs) + '</button> ' : '') +
        '<b>' + esc(c.author.name) + '</b> ' + linkify(c.body) +
        (c.likes ? ' <span class="cmtr-mini-likes">' + c.likes + ' ♥</span>' : '') + '</div>';
    }).join('');
  }

  // ------------------------------------------------------------ actions --
  root.addEventListener('click', function (e) {
    var t;
    if ((t = e.target.closest('[data-seek]'))) { e.preventDefault(); A.seek(Number(t.getAttribute('data-seek'))); return; }
    if ((t = e.target.closest('[data-mode-to]'))) { setMode(t.getAttribute('data-mode-to')); return; }
    if ((t = e.target.closest('[data-sort]'))) { S.sort = t.getAttribute('data-sort'); setPref('sort', S.sort); if (S.sort === 'time') render(); else loadComments(); return; }
    if (e.target.closest('[data-spoilers]')) { S.spoilers = !S.spoilers; setPref('spoilers', S.spoilers); render(); return; }
    if ((t = e.target.closest('[data-reveal]'))) { S.revealed[t.getAttribute('data-reveal')] = true; render(); return; }
    if ((t = e.target.closest('[data-pin]'))) { S.pinNow = t.getAttribute('aria-pressed') !== 'true'; t.setAttribute('aria-pressed', S.pinNow); return; }
    if ((t = e.target.closest('[data-reply]'))) { S.replyTo = Number(t.getAttribute('data-reply')); if (S.mode !== 'sidebar') setMode('sidebar'); else { var f = side.querySelector('.cmtr-slot-compose'); f.innerHTML = composerHtml('side'); } focusComposer(); return; }
    if (e.target.closest('[data-cancel-reply]')) { S.replyTo = null; if (side) side.querySelector('.cmtr-slot-compose').innerHTML = composerHtml('side'); return; }
    if ((t = e.target.closest('[data-like]'))) { like(Number(t.getAttribute('data-like'))); return; }
    if ((t = e.target.closest('[data-more]'))) { e.stopPropagation(); openPop(t, Number(t.getAttribute('data-more'))); return; }
    if (e.target.closest('[data-rename]')) { rename(); return; }
  });

  root.addEventListener('submit', function (e) {
    var form = e.target.closest('form.cmtr-compose'); if (!form) return;
    e.preventDefault();
    var ta = form.querySelector('textarea'), btn = form.querySelector('[type=submit]'), err = form.querySelector('.cmtr-err');
    var body = ta.value.trim(); if (!body) return;
    var chip = form.querySelector('[data-pin]');
    var pinned = !S.replyTo && chip && chip.getAttribute('aria-pressed') === 'true';
    btn.disabled = true; err.textContent = '';
    api('POST', '/comments', {
      ids: S.media.ids, title: S.media.title + (S.media.subtitle ? ' ' + S.media.subtitle : ''),
      body: body, posMs: pinned ? Math.round(S.posMs) : null, runtimeMs: S.media.runtimeMs || null, parentId: S.replyTo,
    }).then(function (c) {
      ta.value = ''; S.replyTo = null; S.pinNow = null;
      if (!S.comments.some(function (x) { return x.id === c.id; })) { c.isNew = true; S.comments.unshift(c); }
      // A comment pinned to now belongs in the live panel straight away.
      S.miniKey = null;
      render();
    }, function (x) { err.textContent = x.message; }).then(function () { btn.disabled = false; });
  });

  root.addEventListener('keydown', function (e) {
    // keep the host player's shortcuts (space = pause, f = fullscreen…) out of our text boxes
    if (e.target.matches && e.target.matches('textarea, input')) {
      e.stopPropagation();
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); var f = e.target.closest('form'); if (f) f.requestSubmit(); }
      if (e.key === 'Escape') { e.target.blur(); }
    }
    if (e.key === 'Escape' && S.menuOpen) { S.menuOpen = false; renderMenu(); fab.focus(); }
  }, true);
  root.addEventListener('keyup', function (e) { if (e.target.matches && e.target.matches('textarea, input')) e.stopPropagation(); }, true);
  root.addEventListener('keypress', function (e) { if (e.target.matches && e.target.matches('textarea, input')) e.stopPropagation(); }, true);
  root.addEventListener('input', function (e) { if (e.target.matches('textarea')) { e.target.style.height = 'auto'; e.target.style.height = Math.min(140, e.target.scrollHeight) + 'px'; } });

  function focusComposer() { setTimeout(function () { var ta = root.querySelector('form.cmtr-compose textarea'); if (ta) ta.focus(); }, 30); }

  function like(id) {
    var c = S.comments.find(function (x) { return x.id === id; }); if (!c) return;
    api('POST', '/comments/' + id + '/like').then(function (r) { c.liked = r.liked; c.likes = r.likes; render(); }, function () { });
  }

  var pop = null;
  function closePop(e) { if (pop && (!e || !pop.contains(e.target))) { pop.remove(); pop = null; } }
  function openPop(anchor, id) {
    closePop();
    var c = S.comments.find(function (x) { return x.id === id; }); if (!c) return;
    pop = h('div', 'cmtr-pop');
    pop.setAttribute('role', 'menu');
    var items = [];
    if (c.canDelete) items.push(['delete', c.mine ? 'Delete' : 'Delete (your server\'s user)']);
    if (!c.mine) items.push(['report', 'Report…']);
    if (c.canHide && !c.mine) items.push(['hide', 'Hide on my server']);
    if (c.posMs != null) items.push(['seek', 'Jump to ' + clock(c.posMs)]);
    pop.innerHTML = items.map(function (i) { return '<button type="button" role="menuitem" data-act="' + i[0] + '">' + i[1] + '</button>'; }).join('');
    root.appendChild(pop);
    var r = anchor.getBoundingClientRect();
    pop.style.top = Math.min(window.innerHeight - pop.offsetHeight - 8, r.bottom + 4) + 'px';
    pop.style.left = Math.max(8, Math.min(window.innerWidth - pop.offsetWidth - 8, r.right - pop.offsetWidth)) + 'px';
    pop.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return;
      var act = b.getAttribute('data-act');
      closePop();
      if (act === 'seek') return A.seek(c.posMs);
      if (act === 'delete') {
        if (!confirm('Delete this comment for everyone?')) return;
        api('DELETE', '/comments/' + id).then(function () { S.comments = S.comments.filter(function (x) { return x.id !== id && x.parentId !== id; }); render(); }, function (x) { alert(x.message); });
      }
      if (act === 'report') {
        var reason = prompt('Why are you reporting this comment? (spam, abuse, spoiler without a timestamp…)', '');
        if (reason == null) return;
        api('POST', '/comments/' + id + '/report', { reason: reason }).then(function () { alert('Thanks, the moderators will take a look.'); }, function (x) { alert(x.message); });
      }
      if (act === 'hide') {
        api('POST', '/server/comments/' + id + '/hide').then(function () { S.comments = S.comments.filter(function (x) { return x.id !== id; }); render(); }, function (x) { alert(x.message); });
      }
    });
  }

  function rename() {
    var name = prompt('Your name on comments (2–32 characters). Everyone on every server sees it.', S.me ? S.me.name : '');
    if (name == null) return;
    api('PUT', '/me', { name: name }).then(function (r) {
      S.me.name = r.name;
      S.comments.forEach(function (c) { if (c.mine) c.author.name = r.name; });
      render();
    }, function (x) { alert(x.message); });
  }

  // ---------------------------------------------------------- main loop --
  function placeFab() {
    // Prefer a button in the host's own control row; fall back to the floating one.
    hostBtn = A.mountButton ? A.mountButton() : null;
    if (hostBtn && !hostBtn._cmtr) { hostBtn._cmtr = true; hostBtn.addEventListener('click', toggleMenu); }
    var typing = !!root.querySelector('form.cmtr-compose textarea:focus');
    var controls = A.controlsVisible();
    if (hostBtn && hostBtn.isConnected) {
      fab.style.display = 'none';
      hostBtn.classList.toggle('cmtr-on', S.mode !== 'off');
      if (S.menuOpen) placeMenu();
      return;
    }
    fab.style.display = '';
    var top = A.controlsTop && A.controlsTop();
    var phone = window.innerWidth <= 640;
    var bottom = top ? Math.max(phone ? 120 : 96, window.innerHeight - top + 14) : (phone ? 132 : 112);
    fab.style.bottom = bottom + 'px';
    menu.style.bottom = (bottom + 54) + 'px';
    // The sidebar has its own close button; the round button would sit on top of it.
    fab.style.visibility = S.mode === 'sidebar' ? 'hidden' : '';
    fab.classList.toggle('is-idle', !(S.menuOpen || controls || typing));
  }

  var lastKey = null, lastRender = 0;
  function tick() {
    var v = A.getVideo();
    if (!v) {
      if (lastKey) { lastKey = null; S.media = null; S.comments = []; closeStream(); S.menuOpen = false; renderMenu(); render(); }
      fab.style.display = 'none';
      return;
    }
    if (!root.isConnected) document.body.appendChild(root);
    S.posMs = (v.currentTime || 0) * 1000;
    placeFab();
    A.getMedia().then(function (m) {
      if (!m) return;
      if (m.key !== lastKey) {
        lastKey = m.key;
        S.media = m; S.comments = []; S.miniKey = null; S.revealed = {}; S.replyTo = null;
        fab.querySelector('.cmtr-fab-count').textContent = '';
        api('GET', '/me').then(function (me) { S.me = me; render(); }, function (e) { S.error = e.message; render(); });
        if (m.ids.length) { loadComments(); openStream(); } else render();
      }
    }, function () { });
    if (S.mode === 'overlay') renderMini();
    // keep the "At 18:32" chip and the Now marker moving, without re-rendering every frame
    if (Date.now() - lastRender > 1000) { lastRender = Date.now(); if (S.mode === 'sidebar' && side && !side.contains(document.activeElement)) renderSide(); else if (side) { var chip = side.querySelector('[data-pin]'); if (chip) chip.textContent = 'At ' + clock(S.posMs); } var cc = corner.querySelector('[data-pin]'); if (cc) cc.textContent = 'At ' + clock(S.posMs); }
  }

  function boot() {
    A = window.CommentarrAdapter;
    if (!A) return setTimeout(boot, 500);
    var style = document.createElement('style');
    style.textContent = window.__CMTR_CSS__ || '';
    document.head.appendChild(style);
    setInterval(tick, 250);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.Commentarr = { setMode: setMode, reload: loadComments };
})();
