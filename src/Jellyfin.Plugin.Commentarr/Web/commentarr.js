/*! Commentarr 1.0.6 · https://github.com/tuikat/commentarr · AGPL-3.0-or-later */
window.__CMTR_CSS__ = "/* Commentarr player UI. Scoped under .cmtr-*; touches nothing of the host player.\n   Glass layers, continuous corners, one accent (the \"you are here\" marker and links). */\n.cmtr, .cmtr * { box-sizing: border-box; }\n.cmtr {\n  --c-text: #f5f5f7;\n  --c-text-2: rgba(235, 235, 245, 0.72);\n  --c-text-3: rgba(235, 235, 245, 0.52);\n  --c-accent: #0a84ff;\n  --c-glass: rgba(28, 28, 32, 0.72);\n  --c-glass-light: rgba(28, 28, 32, 0.5);\n  --c-fill: rgba(255, 255, 255, 0.1);\n  --c-fill-2: rgba(255, 255, 255, 0.17);\n  --c-blur: saturate(180%) blur(26px);\n  --c-rim: inset 0 0 0 0.5px rgba(255, 255, 255, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.1);\n  --c-ring: 0 0 0 2px rgba(0, 0, 0, 0.6), 0 0 0 4px rgba(255, 255, 255, 0.92);\n  --c-ease: cubic-bezier(0.25, 0.8, 0.25, 1);\n  font: 14px/1.45 -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Helvetica Neue\", Inter, \"Segoe UI\", system-ui, sans-serif;\n  color: var(--c-text);\n  -webkit-font-smoothing: antialiased;\n  letter-spacing: -0.006em;\n}\n@supports (corner-shape: squircle) {\n  .cmtr-menu, .cmtr-side, .cmtr-mini, .cmtr-mini-item, .cmtr-compose, .cmtr-btn, .cmtr-input, .cmtr-chip, .cmtr-seg, .cmtr-seg button { corner-shape: squircle; }\n}\n.cmtr button { font: inherit; color: inherit; }\n.cmtr button:focus-visible, .cmtr textarea:focus-visible, .cmtr input:focus-visible { outline: none; box-shadow: var(--c-ring); }\n\n/* --------------------------------------------------------- player button -- */\n.cmtr-fab {\n  position: fixed; right: 20px; bottom: 112px; z-index: 2147483000;\n  width: 44px; height: 44px; border: 0; border-radius: 50%;\n  display: grid; place-items: center; cursor: pointer;\n  background: var(--c-glass-light); box-shadow: var(--c-rim);\n  -webkit-backdrop-filter: var(--c-blur); backdrop-filter: var(--c-blur);\n  transition: opacity 0.25s var(--c-ease), background-color 0.18s var(--c-ease), transform 0.18s var(--c-ease);\n}\n.cmtr-fab:hover { background: var(--c-glass); }\n.cmtr-fab:active { transform: scale(0.94); }\n.cmtr-fab.is-idle { opacity: 0; pointer-events: none; }\n.cmtr-fab svg { width: 21px; height: 21px; }\n.cmtr-fab-count {\n  position: absolute; top: -4px; right: -4px; min-width: 20px; height: 20px; padding: 0 6px;\n  border-radius: 999px; background: #f5f5f7; color: #0b0b0d; font-size: 11px; font-weight: 700;\n  display: grid; place-items: center; font-variant-numeric: tabular-nums;\n}\n.cmtr-fab-count:empty { display: none; }\n\n/* the small menu that opens in place */\n.cmtr-menu {\n  position: fixed; right: 20px; bottom: 166px; z-index: 2147483001; width: 236px; padding: 6px;\n  border-radius: 20px; background: var(--c-glass); box-shadow: var(--c-rim), 0 18px 50px rgba(0, 0, 0, 0.5);\n  -webkit-backdrop-filter: var(--c-blur); backdrop-filter: var(--c-blur);\n  animation: cmtr-pop 0.18s var(--c-ease); transform-origin: 90% 100%;\n}\n.cmtr-menu[hidden] { display: none; }\n@keyframes cmtr-pop { from { opacity: 0; transform: scale(0.94) translateY(6px); } }\n.cmtr-menu-head { padding: 8px 12px 6px; font-size: 12px; color: var(--c-text-3); }\n.cmtr-menu button {\n  display: flex; align-items: center; justify-content: space-between; width: 100%;\n  border: 0; background: none; padding: 10px 12px; border-radius: 13px; cursor: pointer; text-align: left; font-weight: 500;\n}\n.cmtr-menu button:hover { background: var(--c-fill); }\n.cmtr-menu button[aria-checked=\"true\"]::after { content: \"\"; width: 7px; height: 7px; border-radius: 50%; background: var(--c-text); }\n.cmtr-menu small { display: block; color: var(--c-text-3); font-size: 12px; font-weight: 400; }\n\n/* ------------------------------------------------------------ overlay mode -- */\n.cmtr-corner {\n  position: fixed; top: 84px; right: 20px; z-index: 2147482999; width: min(320px, calc(100vw - 40px));\n  display: flex; flex-direction: column; gap: 8px; pointer-events: none;\n}\n.cmtr-corner > * { pointer-events: auto; }\n/* the live panel: four moments, always on, small */\n.cmtr-mini {\n  display: flex; flex-direction: column; gap: 6px; padding: 10px 10px 8px;\n  border-radius: 22px; background: rgba(18, 18, 22, 0.46); box-shadow: var(--c-rim);\n  -webkit-backdrop-filter: var(--c-blur); backdrop-filter: var(--c-blur);\n}\n.cmtr-mini-head { display: flex; align-items: center; gap: 4px; padding: 0 2px 0 6px; }\n.cmtr-mini-label { flex: 1; min-width: 0; font-size: 12px; font-weight: 600; color: var(--c-text-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.cmtr-icon { border: 0; width: 28px; height: 28px; border-radius: 50%; background: transparent; color: var(--c-text-2); display: grid; place-items: center; cursor: pointer; flex: none; }\n.cmtr-icon:hover { background: var(--c-fill); color: var(--c-text); }\n.cmtr-icon svg { width: 13px; height: 13px; }\n.cmtr-mini-list { display: flex; flex-direction: column; gap: 2px; }\n.cmtr-mini-item {\n  padding: 6px 8px; border-radius: 12px; font-size: 13.5px; line-height: 19px; color: var(--c-text);\n  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; word-break: break-word;\n  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.35);\n}\n.cmtr-mini-item b { font-weight: 600; color: var(--c-text-2); margin-right: 2px; }\n.cmtr-mini-item .cmtr-time { font-size: 11.5px; line-height: 18px; padding: 0 6px; margin-right: 2px; vertical-align: 1px; }\n.cmtr-mini-item.is-new { animation: cmtr-in 0.4s var(--c-ease); }\n.cmtr-mini-likes { color: var(--c-text-3); font-size: 12px; white-space: nowrap; }\n.cmtr-mini-empty { margin: 0; padding: 6px 8px 8px; font-size: 13px; color: var(--c-text-2); }\n.cmtr-mini-compose .cmtr-compose { margin: 2px 0 0; padding: 6px 6px 6px 8px; border-radius: 16px; background: rgba(255, 255, 255, 0.07); box-shadow: none; -webkit-backdrop-filter: none; backdrop-filter: none; }\n.cmtr-mini-compose .cmtr-input { font-size: 13.5px; line-height: 19px; min-height: 24px; padding: 3px 4px; }\n.cmtr-mini-compose .cmtr-compose-bar { margin-top: 4px; }\n.cmtr-mini-compose .cmtr-chip { height: 24px; font-size: 11.5px; padding: 0 9px; }\n.cmtr-mini-compose .cmtr-btn { height: 26px; font-size: 12px; padding: 0 12px; }\n@keyframes cmtr-in { from { opacity: 0; transform: translateY(6px); } }\n\n/* -------------------------------------------------------------- sidebar mode -- */\n.cmtr-side {\n  position: fixed; top: 12px; right: 12px; bottom: 12px; z-index: 2147482999; width: min(400px, calc(100vw - 24px));\n  display: flex; flex-direction: column; border-radius: 26px; overflow: hidden;\n  background: var(--c-glass); box-shadow: var(--c-rim), 0 24px 70px rgba(0, 0, 0, 0.5);\n  -webkit-backdrop-filter: var(--c-blur); backdrop-filter: var(--c-blur);\n  animation: cmtr-slide 0.28s var(--c-ease);\n}\n@keyframes cmtr-slide { from { opacity: 0; transform: translateX(24px); } }\n.cmtr-side-head { padding: 18px 18px 10px; display: grid; grid-template-columns: 1fr auto; gap: 2px 12px; align-items: start; }\n.cmtr-side-head h2 { margin: 0; font-size: 19px; line-height: 24px; font-weight: 700; letter-spacing: -0.02em; }\n.cmtr-side-head p { margin: 0; grid-column: 1; color: var(--c-text-2); font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.cmtr-x { grid-row: 1 / span 2; grid-column: 2; width: 32px; height: 32px; border: 0; border-radius: 50%; background: var(--c-fill); cursor: pointer; display: grid; place-items: center; }\n.cmtr-x:hover { background: var(--c-fill-2); }\n.cmtr-x svg { width: 13px; height: 13px; }\n\n.cmtr-tools { display: flex; gap: 8px; align-items: center; justify-content: space-between; padding: 0 18px 12px; flex-wrap: wrap; }\n.cmtr-seg { display: inline-flex; padding: 3px; gap: 2px; border-radius: 999px; background: var(--c-fill); }\n.cmtr-seg button { border: 0; background: none; height: 28px; padding: 0 12px; border-radius: 999px; cursor: pointer; font-weight: 600; font-size: 13px; color: var(--c-text-2); }\n.cmtr-seg button[aria-pressed=\"true\"] { background: rgba(255, 255, 255, 0.18); color: var(--c-text); }\n\n.cmtr-list { flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 4px 10px 12px; scrollbar-width: thin; }\n.cmtr-item { padding: 10px 8px 10px 10px; border-radius: 16px; position: relative; }\n.cmtr-item:hover { background: rgba(255, 255, 255, 0.04); }\n.cmtr-item.is-new { animation: cmtr-in 0.4s var(--c-ease); }\n.cmtr-replies { margin-left: 22px; }\n.cmtr-who { display: flex; align-items: baseline; gap: 6px; font-size: 13px; }\n.cmtr-who b { font-weight: 600; }\n.cmtr-who span { color: var(--c-text-3); font-size: 12px; }\n.cmtr-body { margin-top: 2px; white-space: pre-wrap; word-break: break-word; }\n.cmtr-body a, .cmtr-time {\n  color: var(--c-text); font-weight: 600; text-decoration: none; cursor: pointer;\n  background: var(--c-fill); border: 0; border-radius: 999px; padding: 0 7px; font-variant-numeric: tabular-nums; font-size: 12.5px; line-height: 20px; display: inline-block;\n}\n.cmtr-body a:hover, .cmtr-time:hover { background: var(--c-fill-2); }\n.cmtr-acts { display: flex; gap: 2px; margin-top: 4px; margin-left: -6px; }\n.cmtr-acts button { border: 0; background: none; color: var(--c-text-3); font-size: 12px; font-weight: 600; padding: 3px 7px; border-radius: 999px; cursor: pointer; }\n.cmtr-acts button:hover { color: var(--c-text); background: var(--c-fill); }\n.cmtr-acts button[aria-pressed=\"true\"] { color: var(--c-text); }\n.cmtr-note { color: var(--c-text-3); font-size: 12px; }\n.cmtr-reveal { border: 0; background: var(--c-fill); color: var(--c-text-2); border-radius: 999px; font: inherit; font-size: 12px; font-weight: 600; padding: 2px 10px; cursor: pointer; margin-top: 4px; }\n.cmtr-reveal:hover { color: var(--c-text); }\n.cmtr-mini-item .cmtr-reveal { margin-top: 0; font-size: 11.5px; line-height: 18px; padding: 0 8px; }\n.cmtr-chips { display: inline-flex; gap: 6px; flex-wrap: wrap; }\n\n.cmtr-now { display: flex; align-items: center; gap: 8px; margin: 6px 10px; color: var(--c-accent); font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; }\n.cmtr-now::before, .cmtr-now::after { content: \"\"; flex: 1; height: 1px; background: currentColor; opacity: 0.6; }\n.cmtr-empty { margin: 12px 10px; padding: 18px; border-radius: 16px; background: rgba(255, 255, 255, 0.04); color: var(--c-text-2); }\n\n.cmtr-compose { margin: 0 12px 12px; padding: 10px; border-radius: 18px; background: rgba(255, 255, 255, 0.07); }\n.cmtr-input { width: 100%; resize: none; border: 0; background: transparent; color: var(--c-text); font: inherit; font-size: 15px; line-height: 21px; padding: 4px 6px; min-height: 30px; max-height: 140px; }\n.cmtr-input::placeholder { color: var(--c-text-3); }\n.cmtr-compose-bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 6px; }\n.cmtr-chip { border: 0; height: 28px; padding: 0 11px; border-radius: 999px; background: var(--c-fill); color: var(--c-text); font-size: 12.5px; font-weight: 600; cursor: pointer; font-variant-numeric: tabular-nums; }\n/* same look on or off; when on, a small dot says the comment will be pinned */\n.cmtr-chip { display: inline-flex; align-items: center; gap: 6px; }\n.cmtr-chip[aria-pressed=\"true\"]::before { content: \"\"; width: 6px; height: 6px; border-radius: 50%; background: var(--c-accent); flex: none; }\n.cmtr-btn { border: 0; height: 30px; padding: 0 14px; border-radius: 999px; background: #f5f5f7; color: #0b0b0d !important; font-size: 13px; font-weight: 700; cursor: pointer; }\n.cmtr-btn.ghost { background: var(--c-fill); color: var(--c-text) !important; font-weight: 600; }\n.cmtr-btn:disabled { opacity: 0.45; cursor: default; }\n.cmtr-err { color: #ffb4ab; font-size: 12.5px; padding: 6px 6px 0; }\n.cmtr-err:empty { display: none; }\n.cmtr-replying { font-size: 12px; color: var(--c-text-2); padding: 0 6px 4px; display: flex; justify-content: space-between; }\n.cmtr-replying button { border: 0; background: none; color: var(--c-text-3); cursor: pointer; font-size: 12px; }\n\n.cmtr-foot { padding: 10px 18px 14px; display: flex; justify-content: space-between; gap: 8px; font-size: 12px; color: var(--c-text-3); }\n.cmtr-foot button { border: 0; background: none; color: var(--c-text-2); cursor: pointer; font-size: 12px; text-decoration: underline; text-underline-offset: 3px; padding: 0; }\n\n/* item menu (report / delete / hide) */\n.cmtr-pop { position: fixed; z-index: 2147483002; min-width: 190px; padding: 5px; border-radius: 16px; background: rgba(36, 36, 40, 0.92); box-shadow: var(--c-rim), 0 16px 40px rgba(0, 0, 0, 0.5); -webkit-backdrop-filter: var(--c-blur); backdrop-filter: var(--c-blur); }\n.cmtr-pop button { display: block; width: 100%; text-align: left; border: 0; background: none; padding: 9px 12px; border-radius: 11px; cursor: pointer; }\n.cmtr-pop button:hover { background: var(--c-fill); }\n\n/* ------------------------------------------------------------------ phone -- */\n@media (max-width: 640px) {\n  .cmtr-fab { right: 14px; bottom: 132px; }\n  .cmtr-menu { right: 14px; bottom: 186px; }\n  .cmtr-corner { top: 64px; right: 12px; width: calc(100vw - 24px); }\n  .cmtr-mini-item { -webkit-line-clamp: 2; }\n  .cmtr-side { top: auto; left: 0; right: 0; bottom: 0; width: 100%; height: 62vh; height: 62dvh; border-radius: 26px 26px 0 0; padding-bottom: env(safe-area-inset-bottom, 0px); animation-name: cmtr-up; }\n  @keyframes cmtr-up { from { opacity: 0.4; transform: translateY(30px); } }\n}\n@media (prefers-reduced-transparency: reduce) {\n  .cmtr-fab, .cmtr-menu, .cmtr-side, .cmtr-mini, .cmtr-pop { background: #1f1f23; -webkit-backdrop-filter: none; backdrop-filter: none; }\n}\n@media (prefers-reduced-motion: reduce) {\n  .cmtr *, .cmtr-fab, .cmtr-menu, .cmtr-side { animation: none !important; transition: none !important; }\n}\n\n/* the live panel's composer is one row: text, the \"At 2:40\" chip, Post */\n.cmtr-mini-compose .cmtr-compose { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }\n.cmtr-mini-compose .cmtr-input { flex: 1 1 120px; min-width: 0; }\n.cmtr-mini-compose .cmtr-compose-bar { margin: 0; flex: none; gap: 6px; }\n.cmtr-mini-compose .cmtr-err { flex-basis: 100%; }\n@media (max-width: 640px) {\n  /* three newest moments on a phone, so the panel stays out of the picture */\n  .cmtr-mini-item:first-child:nth-last-child(4) { display: none; }\n  .cmtr-mini { padding: 8px 8px 6px; gap: 4px; }\n  .cmtr-mini-item { font-size: 13px; line-height: 18px; padding: 4px 6px; }\n}\n\n/* the live panel steps aside after a long quiet stretch, and fades back when a comment arrives */\n.cmtr-corner { transition: opacity 0.6s var(--c-ease); }\n.cmtr-corner.is-resting { opacity: 0; pointer-events: none; }\n.cmtr-mini-item.is-filler { color: var(--c-text-2); }\n.cmtr-from { display: inline-block; font-size: 11.5px; line-height: 18px; padding: 0 6px; margin-right: 2px; border-radius: 999px; background: rgba(255, 255, 255, 0.06); color: var(--c-text-3); font-weight: 600; font-variant-numeric: tabular-nums; vertical-align: 1px; }\n\n/* sidebar beside the picture (wide screens): the player and its controls make room */\nhtml.cmtr-squeeze .videoPlayerContainer,\nhtml.cmtr-squeeze .videoOsdBottom,\nhtml.cmtr-squeeze .skinHeader.osdHeader,\nhtml.cmtr-squeeze .upNextContainer { right: 424px !important; }\nhtml.cmtr-squeeze .videoOsdBottom { left: 0; }\n.videoPlayerContainer, .videoOsdBottom { transition: right 0.28s var(--c-ease); }\nhtml.cmtr-squeeze .cmtr-side { animation: none; }\n@media (prefers-reduced-motion: reduce) { .videoPlayerContainer, .videoOsdBottom { transition: none; } }\n\n/* ------------------------------------------------- second screen (companion) -- */\n.cmtr-pillwrap { position: fixed; z-index: 2147482990; left: 50%; bottom: calc(18px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%);\n  display: flex; align-items: center; gap: 4px; padding: 5px; max-width: calc(100vw - 32px); border-radius: 999px;\n  background: var(--c-glass); box-shadow: var(--c-rim), 0 14px 40px rgba(0, 0, 0, 0.45); -webkit-backdrop-filter: var(--c-blur); backdrop-filter: var(--c-blur);\n  animation: cmtr-pill-in 0.3s var(--c-ease); }\n.cmtr-pillwrap[hidden] { display: none; }\n.cmtr-pill { display: flex; align-items: center; gap: 10px; min-width: 0; border: 0; background: none; padding: 5px 8px 5px 10px; border-radius: 999px; cursor: pointer; text-align: left; }\n.cmtr-pill:hover { background: var(--c-fill); }\n.cmtr-pill svg { width: 22px; height: 22px; flex: none; color: var(--c-accent); }\n.cmtr-pill span { display: flex; flex-direction: column; min-width: 0; line-height: 1.2; }\n.cmtr-pill b { font-size: 14px; font-weight: 600; }\n.cmtr-pill small { font-size: 12px; color: var(--c-text-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.cmtr-pill-x { flex: none; width: 32px; height: 32px; border: 0; border-radius: 50%; background: var(--c-fill); cursor: pointer; display: grid; place-items: center; }\n.cmtr-pill-x svg { width: 12px; height: 12px; }\n@keyframes cmtr-pill-in { from { opacity: 0.4; transform: translate(-50%, 30px); } }\n\n.cmtr-companion .cmtr-side { top: 0; right: 0; bottom: 0; left: 0; width: 100%; height: 100%; border-radius: 0; background: #111114; padding: env(safe-area-inset-top, 0px) 0 env(safe-area-inset-bottom, 0px); animation: none; }\n@media (min-width: 700px) { .cmtr-companion .cmtr-side { left: 50%; width: 640px; transform: translateX(-50%); box-shadow: 0 0 0 100vmax rgba(0, 0, 0, 0.72); } }\n.cmtr-remote { grid-column: 1 / -1; display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 10px; padding: 8px 8px 8px 12px; border-radius: 16px; background: var(--c-fill); }\n.cmtr-remote-where { min-width: 0; font-size: 13px; color: var(--c-text-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n.cmtr-remote-where button, .cmtr-remote-where > span { border: 0; background: none; padding: 0; cursor: pointer; color: inherit; }\n.cmtr-remote-where b { color: var(--c-text); font-weight: 600; font-variant-numeric: tabular-nums; margin-left: 4px; }\n.cmtr-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #30d158; margin-right: 7px; vertical-align: 1px; }\n.cmtr-dot.is-paused { background: var(--c-text-3); }\n";
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
    spoilers: pref('spoilers', false),   // also blur comments pinned ahead of you (and from later episodes)
    menuOpen: false, replyTo: null, pinNow: null, spoilNow: false, revealed: {},
    drafts: {},                        // what's typed in each composer, so a re-render never loses it
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

  // Numbers from the comment server go into attributes; never trust a server to send numbers.
  function clean(c) {
    if (!c || typeof c !== 'object') return null;
    var num = function (v) { var n = Number(v); return isFinite(n) ? n : 0; };
    c.id = num(c.id); c.likes = num(c.likes); c.createdAt = num(c.createdAt);
    c.parentId = c.parentId == null ? null : num(c.parentId);
    c.posMs = c.posMs == null ? null : num(c.posMs);
    c.runtimeMs = c.runtimeMs == null ? null : num(c.runtimeMs);
    c.author = c.author && typeof c.author === 'object' ? c.author : { name: 'Viewer', server: '' };
    c.fromEpisode = c.fromEpisode == null ? null : String(c.fromEpisode);
    c.spoiler = c.spoiler === true;
    return c;
  }
  function cleanAll(list) { return (Array.isArray(list) ? list : []).map(clean).filter(Boolean); }

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

  function setMode(m) { S.mode = m; setPref('mode', m); quiet.since = 0; S.miniKey = null; corner.classList.remove('is-resting'); render(); }

  // --------------------------------------------------------- loading data --
  function loadComments() {
    if (!S.media) return Promise.resolve();
    return api('GET', '/comments?sort=' + S.sort + '&ids=' + encodeURIComponent(S.media.ids.join(','))).then(function (r) {
      S.comments = cleanAll(r.comments);
      S.error = '';
      S.miniKey = null;
      // For an episode, also the best comments on the rest of the show: they fill a quiet panel.
      S.related = [];
      if (S.media.ids[0].indexOf('tv/') === 0) {
        api('GET', '/related?limit=20&ids=' + encodeURIComponent(S.media.ids.join(','))).then(function (x) { S.related = cleanAll(x.comments); S.miniKey = null; }, function () { });
      }
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
        var c; try { c = clean(JSON.parse(ev.data)); } catch (e) { return; } if (!c) return;
        if (S.comments.some(function (x) { return x.id === c.id; })) return;
        c.isNew = true;
        S.comments.unshift(c);
        quiet.since = 0; S.miniKey = null;
        fab.querySelector('.cmtr-fab-count').textContent = S.comments.length;
        render();
      });
      es.addEventListener('removed', function (ev) {
        var id; try { id = JSON.parse(ev.data).id; } catch (e) { return; }
        S.comments = S.comments.filter(function (x) { return x.id !== id && x.parentId !== id; });
        render();
      });
      es.addEventListener('spoiler', function (ev) {
        var d; try { d = JSON.parse(ev.data); } catch (e) { return; }
        [S.comments, S.related || []].forEach(function (list) { list.forEach(function (x) { if (x.id === Number(d.id)) x.spoiler = d.spoiler === true; }); });
        S.miniKey = null; render();
      });
      es.onerror = function () { if (es.readyState === 2) { S.es = null; setTimeout(function () { if (S.media && !S.es) openStream(); }, 10000); } };
    }).catch(function () { });
  }
  function closeStream() { if (S.es) { S.es.close(); S.es = null; } }

  // ---------------------------------------------------------- rendering --
  function isMovie() { return S.media && S.media.ids[0].indexOf('movie/') === 0; }
  function differentCut(c) { return c.posMs != null && c.runtimeMs && S.media && S.media.runtimeMs && Math.abs(c.runtimeMs - S.media.runtimeMs) / S.media.runtimeMs > 0.03; }
  // Is this episode later than the one playing? (S01E05 vs tv/tvdb/…/s1e3)
  function laterEpisode(label) {
    var m = /S(\d+)E(\d+)/.exec(label || ''), here = S.media && /s(\d+)e(\d+)$/.exec(S.media.ids[0] || '');
    if (!m || !here) return false;
    return Number(m[1]) * 10000 + Number(m[2]) > Number(here[1]) * 10000 + Number(here[2]);
  }
  // Why a comment is covered, or '' when it isn't. The writer's own spoiler flag always covers it;
  // the viewer's "Blur ahead" setting also covers moments they haven't reached and later episodes.
  function concealed(c) {
    if (c.mine || S.revealed[poolKey(c)]) return '';
    if (c.spoiler) return 'Spoiler';
    if (!S.spoilers) return '';
    if (c.fromEpisode ? laterEpisode(c.fromEpisode) : (c.posMs != null && c.posMs > S.posMs + 1000)) return 'Ahead of you';
    return '';
  }
  function revealBtn(c, why) {
    var where = c.fromEpisode ? ' in ' + esc(c.fromEpisode) : (c.posMs != null ? ' at ' + clock(c.posMs) : '');
    return '<button type="button" class="cmtr-reveal" data-reveal="' + poolKey(c) + '" aria-label="' + why + where + ', show it">' + why + where + ' · Show</button>';
  }

  function itemHtml(c) {
    var why = concealed(c);
    var server = c.author.sameServer ? '' : ' · ' + esc(c.author.server);
    // A covered comment's text is not in the page at all until it's revealed: no blur to squint through.
    return '<div class="cmtr-item' + (why ? ' cmtr-spoiler' : '') + (c.isNew ? ' is-new' : '') + '" data-id="' + c.id + '">' +
      '<div class="cmtr-who"><b>' + esc(c.author.name) + (c.mine ? ' (you)' : '') + '</b><span>' + server + ' · ' + ago(c.createdAt) + (c.spoiler && !why ? ' · spoiler' : '') + '</span></div>' +
      (why ? revealBtn(c, why)
        : '<div class="cmtr-body">' + (c.posMs != null ? '<button type="button" class="cmtr-time" data-seek="' + c.posMs + '" aria-label="Jump to ' + clock(c.posMs) + '">' + clock(c.posMs) + '</button> ' : '') + linkify(c.body) + '</div>') +
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

  // Comments are not pinned unless you tap the "At 18:32" chip.
  function defaultPin() { return false; }

  function composerHtml(where) {
    var pin = S.pinNow == null ? defaultPin() : S.pinNow;
    var reply = S.replyTo && S.comments.find(function (c) { return c.id === S.replyTo; });
    var name = S.me ? esc(S.me.name) : '';
    return '<form class="cmtr-compose" data-where="' + where + '">' +
      (reply ? '<div class="cmtr-replying"><span>Replying to ' + esc(reply.author.name) + '</span><button type="button" data-cancel-reply>Cancel</button></div>' : '') +
      '<textarea class="cmtr-input" rows="1" maxlength="1000" placeholder="' + (S.me && S.me.canPost === false ? 'Commenting is turned off for you' : 'Comment as ' + name + '…') + '" aria-label="Write a comment"' + (S.me && S.me.canPost === false ? ' disabled' : '') + '>' + esc(S.drafts[where] || '') + '</textarea>' +
      '<div class="cmtr-compose-bar">' +
        '<span class="cmtr-chips">' +
          (reply ? '' : '<button type="button" class="cmtr-chip" data-pin aria-pressed="' + pin + '" title="Show this comment at this moment for everyone">At ' + clock(S.posMs) + '</button>') +
          '<button type="button" class="cmtr-chip" data-spoil aria-pressed="' + !!S.spoilNow + '" title="Cover this comment until someone chooses to read it">Spoiler</button>' +
        '</span>' +
        '<button type="submit" class="cmtr-btn">Post</button>' +
      '</div><div class="cmtr-err" role="alert"></div></form>';
  }

  function render() {
    if (!root.isConnected) return;
    var playing = !!A.getVideo();
    // second screen: the full panel, filling a phone, following another device's playback
    var comp = !!(A.companion && A.companion());
    var mode = comp ? 'sidebar' : S.mode;
    root.classList.toggle('cmtr-companion', comp);
    fab.style.display = playing && !comp && !(hostBtn && hostBtn.isConnected) ? '' : 'none';
    if (!playing) { corner.innerHTML = ''; removeSide(); squeeze(false); return; }

    // overlay: a small, always-on panel of the latest moments, with a one-line composer
    if (mode === 'overlay') {
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

    if (mode === 'sidebar') renderSide(); else removeSide();
    squeeze(mode === 'sidebar' && !comp && window.innerWidth >= 900);
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
    remoteBar();
    side.querySelectorAll('[data-sort]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-sort') === S.sort); });
    var sp = side.querySelector('[data-spoilers]');
    sp.setAttribute('aria-pressed', S.spoilers);
    sp.title = S.spoilers ? 'Comments pinned ahead of you, and from later episodes, are covered' : 'Also cover comments pinned ahead of where you are, and from later episodes. Comments marked as spoilers are always covered.';
    sp.textContent = 'Hide ahead';
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

  // Second screen: which device we're following, where it is, and play/pause for it.
  function remoteBar() {
    var comp = A.companion && A.companion();
    var bar = side.querySelector('.cmtr-remote');
    if (!comp) { if (bar) bar.remove(); return; }
    if (!bar) { bar = h('div', 'cmtr-remote'); side.querySelector('.cmtr-side-head').appendChild(bar); }
    var i = A.companionInfo();
    var html = '<span class="cmtr-remote-where">' + (i.others ? '<button type="button" data-remote="next" title="Follow another device">' : '<span>') +
        '<i class="cmtr-dot' + (i.paused ? ' is-paused' : '') + '"></i>' + (i.paused ? 'Paused' : 'Playing') + ' on ' + esc(i.device) + (i.others ? ' ›</button>' : '</span>') +
        ' <b>' + clock(S.posMs) + '</b></span>' +
      (i.canControl ? '<button type="button" class="cmtr-chip" data-remote="' + (i.paused ? 'unpause' : 'pause') + '">' + (i.paused ? 'Play' : 'Pause') + '</button>' : '');
    if (bar._html !== html) { bar._html = html; bar.innerHTML = html; }
  }

  // On a wide screen the sidebar sits beside the picture instead of over it: the player shrinks
  // to the space on the left (the video keeps its aspect ratio), and springs back when it closes.
  function squeeze(on) { document.documentElement.classList.toggle('cmtr-squeeze', !!on); }
  window.addEventListener('resize', function () { if (S.mode === 'sidebar' && side && !(A.companion && A.companion())) squeeze(window.innerWidth >= 900); });

  // ------------------------------------------------- the live panel --
  // Up to four comments, like a live chat replay:
  //  1. moments pinned in the last few minutes of the video come first, newest at the bottom;
  //  2. empty slots rotate through the rest: this title's best comments, then the best from the
  //     show's other episodes (labelled), one slot every ~25 s, no repeats until all were shown;
  //  3. when there is nothing at all for a long stretch, the panel steps aside entirely and comes
  //     back by itself the moment a comment arrives.
  var MINI_MAX = 4, RECENT_MS = 5 * 60000, ROTATE_MS = 25000, QUIET_HIDE_MS = 90000;
  var rot = { order: [], at: 0, shown: [], lastTick: 0 };
  var quiet = { since: 0, hidden: false };

  function poolKey(c) { return (c.fromEpisode ? 'r' : 't') + c.id; }

  function fillPool() {
    var tops = S.comments.filter(function (c) { return !c.parentId; });
    var recentIds = {};
    var general = tops.filter(function (c) { return c.posMs == null; })
      .sort(function (a, b) { return b.likes - a.likes || b.createdAt - a.createdAt; });
    var olderMoments = tops.filter(function (c) { return c.posMs != null && !differentCut(c) && c.posMs < S.posMs - RECENT_MS; })
      .sort(function (a, b) { return b.likes - a.likes; });
    return general.concat(olderMoments, S.related || []).filter(function (c) { return !recentIds[c.id]; });
  }

  function miniPick() {
    var tops = S.comments.filter(function (c) { return !c.parentId; });
    var recent = tops.filter(function (c) {
      return c.posMs != null && !differentCut(c) && c.posMs <= S.posMs + 500 && c.posMs >= S.posMs - RECENT_MS;
    }).sort(function (a, b) { return a.posMs - b.posMs || a.createdAt - b.createdAt; }).slice(-MINI_MAX);
    var free = MINI_MAX - recent.length;
    var pool = fillPool();
    var fill = [];
    if (free > 0 && pool.length) {
      var keys = pool.map(poolKey);
      // keep the rotation order stable; new pool items join the end
      rot.order = rot.order.filter(function (k) { return keys.indexOf(k) >= 0; });
      keys.forEach(function (k) { if (rot.order.indexOf(k) < 0) rot.order.push(k); });
      var now = Date.now();
      if (!rot.shown.length || now - rot.lastTick > ROTATE_MS) {
        rot.lastTick = now;
        if (!rot.shown.length) {
          rot.shown = rot.order.slice(0, free);
          rot.at = rot.shown.length;
        } else if (rot.order.length > rot.shown.length) {
          // swap out the oldest shown filler for the next one in line
          rot.shown.shift();
          var guard = 0;
          while (guard++ < rot.order.length) {
            var next = rot.order[rot.at % rot.order.length]; rot.at++;
            if (rot.shown.indexOf(next) < 0) { rot.shown.push(next); break; }
          }
        }
      }
      rot.shown = rot.shown.filter(function (k) { return keys.indexOf(k) >= 0; }).slice(-free);
      while (rot.shown.length < Math.min(free, rot.order.length)) {
        var k2 = rot.order[rot.at % rot.order.length]; rot.at++;
        if (rot.shown.indexOf(k2) < 0) rot.shown.push(k2); else if (rot.at > rot.order.length * 2) break;
      }
      var byKey = {}; pool.forEach(function (c) { byKey[poolKey(c)] = c; });
      fill = rot.shown.map(function (k) { return byKey[k]; }).filter(Boolean);
    }
    var label = recent.length ? 'At this point' : (fill.some(function (c) { return !c.fromEpisode; }) ? 'On this ' + (isMovie() ? 'film' : 'episode') : (fill.length ? 'From this show' : ''));
    return { label: label, items: fill.concat(recent) };
  }

  function miniItem(c, isNew) {
    var tag = c.fromEpisode ? '<span class="cmtr-from">' + esc(c.fromEpisode) + '</span> '
      : (c.posMs != null ? '<button type="button" class="cmtr-time" data-seek="' + c.posMs + '" aria-label="Jump to ' + clock(c.posMs) + '">' + clock(c.posMs) + '</button> ' : '');
    var why = concealed(c);
    return '<div class="cmtr-mini-item' + (isNew ? ' is-new' : '') + (c.posMs == null || c.fromEpisode ? ' is-filler' : '') + '" data-id="' + poolKey(c) + '">' + (why ? '' : tag) +
      '<b>' + esc(c.author.name) + '</b> ' + (why ? revealBtn(c, why) : linkify(c.body)) +
      (c.likes ? ' <span class="cmtr-mini-likes">' + c.likes + ' ♥</span>' : '') + '</div>';
  }

  function renderMini() {
    var box = corner.querySelector('.cmtr-mini'); if (!box) return;
    var n = S.comments.length;
    var pick = miniPick();
    box.querySelector('.cmtr-mini-label').textContent = 'Comments' + (n ? ' · ' + n : '') + (pick.label ? ' · ' + pick.label : '');

    // Nothing to show for a long while: step aside for uninterrupted viewing.
    var typing = !!corner.querySelector('textarea:focus') || !!(corner.querySelector('textarea') || {}).value;
    if (pick.items.length || S.error || typing) { quiet.since = 0; }
    else if (!quiet.since) { quiet.since = Date.now(); }
    var hide = !!quiet.since && Date.now() - quiet.since > QUIET_HIDE_MS;
    if (hide !== quiet.hidden) { quiet.hidden = hide; corner.classList.toggle('is-resting', hide); }

    var key = pick.items.map(function (c) { return poolKey(c) + ':' + c.likes + (concealed(c) ? 's' : ''); }).join(',') + '|' + (S.error || '');
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
    list.innerHTML = pick.items.map(function (c) { return miniItem(c, !before[poolKey(c)]); }).join('');
  }

  // ------------------------------------------------------------ actions --
  root.addEventListener('click', function (e) {
    var t;
    if ((t = e.target.closest('[data-seek]'))) { e.preventDefault(); A.seek(Number(t.getAttribute('data-seek'))); return; }
    if ((t = e.target.closest('[data-remote]'))) {
      var act = t.getAttribute('data-remote');
      if (act === 'next') A.nextDevice(); else A.remote(act).catch(function (x) { alert(x.message); });
      render(); return;
    }
    if ((t = e.target.closest('[data-mode-to]'))) {
      if (A.companion && A.companion() && t.getAttribute('data-mode-to') === 'off') { A.closeCompanion(); render(); return; }
      setMode(t.getAttribute('data-mode-to')); return;
    }
    if ((t = e.target.closest('[data-sort]'))) { S.sort = t.getAttribute('data-sort'); setPref('sort', S.sort); if (S.sort === 'time') render(); else loadComments(); return; }
    if (e.target.closest('[data-spoilers]')) { S.spoilers = !S.spoilers; setPref('spoilers', S.spoilers); render(); return; }
    if ((t = e.target.closest('[data-reveal]'))) { S.revealed[t.getAttribute('data-reveal')] = true; S.miniKey = null; render(); return; }
    if ((t = e.target.closest('[data-spoil]'))) { S.spoilNow = t.getAttribute('aria-pressed') !== 'true'; root.querySelectorAll('[data-spoil]').forEach(function (b) { b.setAttribute('aria-pressed', S.spoilNow); }); return; }
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
    if (!S.media || !S.media.ids.length) { form.querySelector('.cmtr-err').textContent = 'Still working out which title this is. Try again in a moment.'; return; }
    var chip = form.querySelector('[data-pin]');
    var pinned = !S.replyTo && chip && chip.getAttribute('aria-pressed') === 'true';
    var spoil = form.querySelector('[data-spoil]');
    var spoiler = !!spoil && spoil.getAttribute('aria-pressed') === 'true';
    btn.disabled = true; err.textContent = '';
    api('POST', '/comments', {
      ids: S.media.ids, title: S.media.title + (S.media.subtitle ? ' ' + S.media.subtitle : ''),
      body: body, posMs: pinned ? Math.round(S.posMs) : null, runtimeMs: S.media.runtimeMs || null, parentId: S.replyTo, spoiler: spoiler,
    }).then(function (c) {
      c = clean(c);
      ta.value = ''; S.drafts = {}; S.replyTo = null; S.pinNow = null; S.spoilNow = false;
      if (!S.comments.some(function (x) { return x.id === c.id; })) { c.isNew = true; S.comments.unshift(c); }
      // A comment pinned to now belongs in the live panel straight away.
      S.miniKey = null; quiet.since = 0;
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
  root.addEventListener('input', function (e) {
    if (!e.target.matches('textarea')) return;
    var f = e.target.closest('form.cmtr-compose'); if (f) S.drafts[f.getAttribute('data-where')] = e.target.value;
    e.target.style.height = 'auto'; e.target.style.height = Math.min(140, e.target.scrollHeight) + 'px';
  });
  // Tapping a composer chip (Spoiler, At 12:34) must not take focus from the text box: on a phone
  // that would close the keyboard and let the panel redraw the composer.
  ['mousedown', 'pointerdown'].forEach(function (t) {
    root.addEventListener(t, function (e) { if (e.target.closest && e.target.closest('.cmtr-compose [data-spoil], .cmtr-compose [data-pin]')) e.preventDefault(); });
  });

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
    // Destructive last, so a quick tap never lands on it.
    if (c.posMs != null) items.push(['seek', 'Jump to ' + clock(c.posMs)]);
    if (c.canDelete) items.push(['spoiler', c.spoiler ? 'Not a spoiler' : 'Mark as spoiler']);
    if (!c.mine) items.push(['report', 'Report…']);
    if (c.canHide && !c.mine) items.push(['hide', 'Hide on my server']);
    if (c.canDelete) items.push(['delete', c.mine ? 'Delete comment' : 'Delete (your server\'s user)']);
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
      if (act === 'spoiler') {
        api('POST', '/comments/' + id + '/spoiler', { spoiler: !c.spoiler }).then(function (r) { c.spoiler = r.spoiler === true; S.miniKey = null; render(); }, function (x) { alert(x.message); });
      }
      if (act === 'delete') {
        if (!confirm('Delete this comment for everyone?')) return;
        api('DELETE', '/comments/' + id).then(function () { S.comments = S.comments.filter(function (x) { return x.id !== id && x.parentId !== id; }); render(); }, function (x) { alert(x.message); });
      }
      if (act === 'report') {
        var reason = prompt('Why are you reporting this comment? (spam, abuse, an unmarked spoiler…)', '');
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
    if (A.companion && A.companion()) { fab.style.display = 'none'; return; }
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
    // A different source on the <video> is a different playback: drop the old title at once,
    // so nothing (the list, the composer) can act on what was playing before.
    var src = v.currentSrc || v.src || '';
    if (src && S.src && src !== S.src && lastKey) {
      lastKey = null; S.media = null; S.comments = []; S.miniKey = null; closeStream(); render();
    }
    S.src = src;
    S.posMs = (v.currentTime || 0) * 1000;
    placeFab();
    A.getMedia().then(function (m) {
      if (!m) return;
      if (m.key !== lastKey) {
        lastKey = m.key;
        S.media = m; S.comments = []; S.miniKey = null; S.related = []; rot = { order: [], at: 0, shown: [], lastTick: 0 }; quiet = { since: 0, hidden: false }; corner.classList.remove('is-resting'); S.revealed = {}; S.replyTo = null;
        fab.querySelector('.cmtr-fab-count').textContent = '';
        api('GET', '/me').then(function (me) { S.me = me; render(); }, function (e) { S.error = e.message; render(); });
        if (m.ids.length) { loadComments(); openStream(); } else render();
      }
    }, function () { });
    if (S.mode === 'overlay') renderMini();
    // keep the "At 18:32" chip and the Now marker moving, without re-rendering every frame
    if (Date.now() - lastRender > 1000) { lastRender = Date.now(); if (side) remoteBar(); if ((S.mode === 'sidebar' || (A.companion && A.companion())) && side && !side.contains(document.activeElement)) renderSide(); else if (side) { var chip = side.querySelector('[data-pin]'); if (chip) chip.textContent = 'At ' + clock(S.posMs); } var cc = corner.querySelector('[data-pin]'); if (cc) cc.textContent = 'At ' + clock(S.posMs); }
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
