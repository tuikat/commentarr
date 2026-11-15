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
    featured: { shown: {}, lastAt: 0, el: null, timer: null },
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

  fab.addEventListener('click', function (e) { e.stopPropagation(); S.menuOpen = !S.menuOpen; renderMenu(); });
  document.addEventListener('click', function (e) { if (S.menuOpen && !menu.contains(e.target) && e.target !== fab) { S.menuOpen = false; renderMenu(); } closePop(e); }, true);

  function renderMenu() {
    menu.hidden = !S.menuOpen;
    fab.setAttribute('aria-expanded', S.menuOpen);
    if (!S.menuOpen) return;
    var n = S.comments.length;
    var opt = function (mode, label, sub) { return '<button type="button" role="menuitemradio" aria-checked="' + (S.mode === mode) + '" data-mode="' + mode + '"><span>' + label + '<small>' + sub + '</small></span></button>'; };
    menu.innerHTML = '<div class="cmtr-menu-head">' + (S.media ? (n === 1 ? '1 comment' : n + ' comments') + ' on this ' + (S.media.ids[0].indexOf('movie/') === 0 ? 'film' : 'episode') : 'Comments') + '</div>' +
      opt('overlay', 'Overlay', 'Moments pop up in the corner') +
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
    fab.style.display = playing ? '' : 'none';
    if (!playing) { corner.innerHTML = ''; removeSide(); return; }

    // overlay: the corner shows featured moments and a compact composer
    if (S.mode === 'overlay') {
      removeSide();
      if (!corner.querySelector('.cmtr-corner-bar')) {
        corner.innerHTML = '<div class="cmtr-slot"></div><div class="cmtr-corner-bar"><button type="button" class="cmtr-btn ghost" data-open-compose>Comment</button><button type="button" class="cmtr-btn ghost" data-mode-to="sidebar">All comments</button></div>';
      }
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

  // ------------------------------------------------- featured moments --
  // One comment at a time: the best-liked pinned comment in the last ~20 s, shown ~6 s,
  // never more often than every 15 s. That is the "featured" stream; the list has the rest.
  function tickFeatured() {
    if (S.mode !== 'overlay' || !S.media) return;
    var F = S.featured, now = Date.now();
    var slot = corner.querySelector('.cmtr-slot'); if (!slot) return;
    if (F.el && now - F.el._at > 6500) { var old = F.el; old.classList.add('is-out'); setTimeout(function () { old.remove(); }, 400); F.el = null; }
    if (F.el || now - F.lastAt < 15000) return;
    var pick = null;
    S.comments.forEach(function (c) {
      if (c.parentId || c.posMs == null || F.shown[c.id] || differentCut(c)) return;
      if (c.posMs > S.posMs + 500 || c.posMs < S.posMs - 20000) return;
      if (!pick || c.likes > pick.likes || (c.likes === pick.likes && c.posMs > pick.posMs)) pick = c;
    });
    if (!pick) return;
    F.shown[pick.id] = true; F.lastAt = now;
    var el = h('div', 'cmtr-feature', '<div class="cmtr-who"><b>' + esc(pick.author.name) + '</b><span>' + clock(pick.posMs) + (pick.likes ? ' · ' + pick.likes + ' like' + (pick.likes === 1 ? '' : 's') : '') + '</span></div><div class="cmtr-body">' + linkify(pick.body) + '</div>');
    el._at = now;
    slot.appendChild(el);
    F.el = el;
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
    if (e.target.closest('[data-open-compose]')) {
      var bar = corner.querySelector('.cmtr-corner-bar');
      if (!corner.querySelector('form')) { var w = h('div', '', composerHtml('corner')); corner.insertBefore(w.firstChild, bar); }
      focusComposer();
    }
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
      if (form.getAttribute('data-where') === 'corner') form.remove();
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
    var top = A.controlsTop && A.controlsTop();
    var phone = window.innerWidth <= 640;
    var bottom = top ? Math.max(phone ? 120 : 96, window.innerHeight - top + 14) : (phone ? 132 : 112);
    fab.style.bottom = bottom + 'px';
    menu.style.bottom = (bottom + 54) + 'px';
    var typing = !!root.querySelector('form.cmtr-compose textarea:focus');
    var controls = A.controlsVisible();
    // The sidebar has its own close button; the round button would sit on top of it.
    fab.style.visibility = S.mode === 'sidebar' ? 'hidden' : '';
    fab.classList.toggle('is-idle', !(S.menuOpen || controls || typing));
    // In overlay mode only the featured moment stays up; its buttons come and go with the controls.
    var bar = corner.querySelector('.cmtr-corner-bar');
    if (bar) bar.style.visibility = controls || typing || corner.querySelector('form') ? '' : 'hidden';
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
        S.media = m; S.comments = []; S.featured = { shown: {}, lastAt: 0, el: null }; S.revealed = {}; S.replyTo = null;
        fab.querySelector('.cmtr-fab-count').textContent = '';
        api('GET', '/me').then(function (me) { S.me = me; render(); }, function (e) { S.error = e.message; render(); });
        if (m.ids.length) { loadComments(); openStream(); } else render();
      }
    }, function () { });
    tickFeatured();
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
