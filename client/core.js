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
    return '<form class="cmtr-compose' + (S.drafts[where] ? ' has-text' : '') + '" data-where="' + where + '">' +
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
    squeeze(mode === 'sidebar' && !comp);
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
  // Wide screens and phones held sideways: the sidebar sits on the right and the video shrinks to
  // the left of it. Phones held upright: it's a sheet along the bottom and the video moves up above it.
  function squeeze(on) {
    var wide = window.innerWidth >= 900 || window.innerWidth > window.innerHeight;
    document.documentElement.classList.toggle('cmtr-squeeze', !!on && wide);
    document.documentElement.classList.toggle('cmtr-squeeze-bottom', !!on && !wide);
  }
  window.addEventListener('resize', function () { if (S.mode === 'sidebar' && side && !(A.companion && A.companion())) squeeze(true); });

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
      ta.value = ''; form.classList.remove('has-text'); S.drafts = {}; S.replyTo = null; S.pinNow = null; S.spoilNow = false;
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
    var f = e.target.closest('form.cmtr-compose'); if (f) { S.drafts[f.getAttribute('data-where')] = e.target.value; f.classList.toggle('has-text', !!e.target.value.trim()); }
    e.target.style.height = 'auto'; e.target.style.height = Math.min(140, e.target.scrollHeight) + 'px';
  });
  // Tapping a composer chip (Spoiler, At 12:34) must not take focus from the text box: on a phone
  // that would close the keyboard and let the panel redraw the composer.
  ['mousedown', 'pointerdown'].forEach(function (t) {
    root.addEventListener(t, function (e) { if (e.target.closest && e.target.closest('.cmtr-compose [data-spoil], .cmtr-compose [data-pin], .cmtr-compose [type=submit]')) e.preventDefault(); });
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

  function placeCorner() {
    var hb = window.innerHeight < 560 && A.controlsVisible() && A.headerBottom ? A.headerBottom() : 0;
    var top = hb ? Math.round(hb + 6) + 'px' : '';
    if (corner.style.top !== top) corner.style.top = top;
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
    placeCorner();
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
