# Commentarr

**Shared, timestamped comments for Jellyfin.** Watch something on your own server and see what everyone else said at that exact moment: the cameo at 1:02:10, the jump scare at 18:25, the ending people argue about.

Your library stays yours. Commentarr only knows *which title* you're watching (by its TMDB / TVDB / IMDb id) and what you wrote. Every Commentarr server joins the same conversation on **[comments.forester.dev](https://comments.forester.dev)**, so a comment written on one person's server shows up for everyone watching that film or episode, on any server, whatever version of the file they have.

> **Jellyfin 10.11** is supported and tested. A **Plex** userscript is included as an experiment (see below).

---

## Install (Jellyfin)

1. **Dashboard → Plugins → Repositories → +** and add:
   ```
   https://raw.githubusercontent.com/tuikat/commentarr/main/manifest.json
   ```
2. **Catalog → Commentarr → Install**, then restart Jellyfin.
3. Play anything. A small comments button appears at the bottom right of the player.

That's it. It connects to the shared comment server by itself. No account, no sign-up: people comment under their Jellyfin name and can change it in the comments panel.

## Using it

Tap the comments button for three choices:

- **Overlay**: the best-liked comment for the moment you're at fades in at the corner, one at a time, then gets out of the way. This is the "watch along with everyone" mode.
- **Sidebar**: every comment beside the video: sort by **Top**, **New**, or **By time** (with a *Now* line that follows playback), reply, like, report.
- **Off**: no comments while you watch.

**Pinned comments.** While you're mid-video, a new comment is pinned to the current moment (`At 18:32`) so it pops up for everyone at that exact point. Near the start and during the credits it isn't pinned by default, since those are usually about the whole thing. Tap the chip to change it either way. Typing a time like `1:02:10` in any comment turns it into a jump link.

**Spoilers.** Off by default. Turn on *Spoilers hidden* in the sidebar to blur comments pinned to moments you haven't reached yet.

**Different cuts.** Comments remember the length of the file they were written on. If yours is a different cut (extended, theatrical…), pinned comments say so, since their moment might not line up.

## Moderation (for Jellyfin admins)

**Dashboard → Plugins → Commentarr** has four tabs:

| Tab | What you can do |
| --- | --- |
| Connection | Comment server address, the name other servers see for yours, turn the button off |
| Reports | Comments your users reported, and your users' comments that anyone reported. **Hide** removes a comment for everyone on your server; **Delete** removes your own users' comments everywhere; **Block** hides everything from an outside person for your server |
| People | Your users who have commented; **ban** someone from commenting |
| Banned words | Your users can't post them, and other servers' comments containing them are hidden from your users |

Jellyfin administrators also get **Hide on my server** in each comment's ••• menu inside the player. The public server has its own moderators, word list and automatic hiding of comments reported by people on several different servers.

## Privacy

- Your Jellyfin server registers once and keeps a private key; it vouches for each of its users with a short-lived token. The comment server stores a **hashed** user id, the display name, and the comments. No emails, passwords, usernames, or library contents.
- What's shared: your display name, your server's display name, your comments, and the title ids they belong to.
- Public service terms and privacy: [forester.dev/terms](https://forester.dev/terms/) · [forester.dev/privacy](https://forester.dev/privacy/).

## Plex (experimental, untested)

Plex has no plugin system for its web player, so Commentarr for Plex is a **userscript** (Tampermonkey / Violentmonkey) that runs in your browser and uses the same shared comments:

1. Install a userscript manager.
2. Open [`commentarr-plex.user.js`](https://github.com/tuikat/commentarr/releases/latest/download/commentarr-plex.user.js) from the latest release.
3. Open Plex Web **from your server** (`http://your-server:32400/web`) and play something.

It is unverified, so reports and fixes are welcome.

## Your own comment server?

Almost everyone should stay on **comments.forester.dev**: that's where everyone else's comments are, and a comment section is only as good as the people in it. If you need a **private** space (a family or friends group that doesn't want to mix with the public), run [commentarr-server](https://github.com/tuikat/commentarr-server) and change *Comment server* in the plugin settings.

## Building

```bash
./build.sh            # needs node 22+ and docker (the .NET 9 SDK runs in a container)
```

Produces `dist/commentarr_<version>.zip` (the Jellyfin plugin) and `dist/commentarr-plex.user.js`.

- `client/`: the player UI: `core.js` + `commentarr.css`, with one adapter per media server
- `src/Jellyfin.Plugin.Commentarr/`: the Jellyfin plugin (registration, user tokens, settings and moderation page, script injection)

## Contributing

Bug reports, Plex testing, translations and ideas are all welcome: open an issue or a pull request. The best contribution of all is commenting: every comment you leave is there for the next person who watches.

## Licence

[AGPL-3.0-or-later](LICENSE). © Forester.
