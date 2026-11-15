/* Commentarr: Plex Web adapter (userscript). EXPERIMENTAL: untested. AGPL-3.0-or-later.
 * Plex has no plugin system for its web player, so this runs in your browser via Tampermonkey /
 * Violentmonkey. It registers itself with the comment server like a small media server of one. */
(function () {
  'use strict';
  var SERVER = (function () { try { return localStorage.getItem('commentarr:server') || 'https://comments.forester.dev'; } catch (e) { return 'https://comments.forester.dev'; } })();
  var store = function (k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem('commentarr:plex:' + k)); localStorage.setItem('commentarr:plex:' + k, JSON.stringify(v)); } catch (e) { return null; } };

  function plexToken() {
    try { return localStorage.getItem('myPlexAccessToken') || (JSON.parse(localStorage.getItem('users') || '{}').users || [])[0].authToken; } catch (e) { return null; }
  }
  function plexBase() {
    // Works when Plex Web is opened from the server itself (http://server:32400/web).
    return location.origin.indexOf('app.plex.tv') === -1 ? location.origin : null;
  }
  function plexGet(path) {
    var base = plexBase(), tok = plexToken();
    if (!base || !tok) return Promise.reject(new Error('Open Plex Web from your server (http://your-server:32400/web) to use Commentarr.'));
    return fetch(base + path + (path.indexOf('?') > -1 ? '&' : '?') + 'includeGuids=1', { headers: { 'X-Plex-Token': tok, Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('Plex ' + r.status); return r.json(); })
      .then(function (j) { return (j.MediaContainer.Metadata || [])[0]; });
  }
  function guids(md) {
    var out = {};
    (md && md.Guid || []).forEach(function (g) { var m = /^(tmdb|imdb|tvdb):\/\/(.+)$/.exec(g.id); if (m) out[m[1]] = m[2]; });
    return out;
  }

  var cache = { key: null, value: null };
  var lastMove = 0;
  document.addEventListener('mousemove', function () { lastMove = Date.now(); }, true);
  document.addEventListener('touchstart', function () { lastMove = Date.now(); }, true);

  window.CommentarrAdapter = {
    getAuth: function () {
      var reg = store('reg');
      var ensure = reg ? Promise.resolve(reg) : fetch(SERVER + '/api/v1/servers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Plex viewer', kind: 'plex-userscript' }) })
        .then(function (r) { return r.json(); }).then(function (j) { store('reg', j); return j; });
      return ensure.then(function (r) {
        var uid = store('uid') || (store('uid', Math.random().toString(36).slice(2) + Date.now().toString(36)), store('uid'));
        return fetch(SERVER + '/api/v1/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Server ' + r.serverId + ':' + r.serverKey },
          body: JSON.stringify({ userId: uid, name: 'Plex viewer' }),
        }).then(function (x) { return x.json(); }).then(function (t) { return { token: t.token, exp: t.exp, serverUrl: SERVER }; });
      });
    },

    getMedia: function () {
      var m = /key=%2Flibrary%2Fmetadata%2F(\d+)/.exec(location.href) || /\/library\/metadata\/(\d+)/.exec(decodeURIComponent(location.href));
      if (!m) return Promise.resolve(cache.value);
      if (m[1] === cache.key) return Promise.resolve(cache.value);
      return plexGet('/library/metadata/' + m[1]).then(function (md) {
        var ids = [], g = guids(md), title = md.title, subtitle = '';
        if (md.type === 'movie') {
          if (g.tmdb) ids.push('movie/tmdb/' + g.tmdb);
          if (g.imdb) ids.push('movie/imdb/' + g.imdb.toLowerCase());
          subtitle = md.year ? String(md.year) : '';
          return { md: md, ids: ids, title: title, subtitle: subtitle };
        }
        return plexGet('/library/metadata/' + md.grandparentRatingKey).then(function (show) {
          var sg = guids(show), se = '/s' + md.parentIndex + 'e' + md.index;
          if (sg.tvdb) ids.push('tv/tvdb/' + sg.tvdb + se);
          if (sg.tmdb) ids.push('tv/tmdb/' + sg.tmdb + se);
          if (sg.imdb) ids.push('tv/imdb/' + sg.imdb.toLowerCase() + se);
          return { md: md, ids: ids, title: md.grandparentTitle, subtitle: 'S' + String(md.parentIndex).padStart(2, '0') + 'E' + String(md.index).padStart(2, '0') + ' · ' + md.title };
        });
      }).then(function (r) {
        cache.key = m[1];
        cache.value = { key: m[1], ids: r.ids, title: r.title, subtitle: r.subtitle, runtimeMs: r.md.duration || null };
        return cache.value;
      }).catch(function () { return cache.value; });
    },

    getVideo: function () {
      var v = document.querySelector('video');
      return v && v.offsetWidth > 200 ? v : null;
    },

    seek: function (ms) { var v = this.getVideo(); if (v) v.currentTime = ms / 1000; },
    controlsVisible: function () { return Date.now() - lastMove < 3000; },
    controlsTop: function () { return null; },
  };
})();
