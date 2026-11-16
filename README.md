<img src="images/icon-square.png" alt="" width="96" align="right">

# Commentarr

**Shared, timestamped comments for Jellyfin.** Watch something on your own server and see what everyone else said at that exact moment: the cameo at 1:02:10, the jump scare at 18:25, the ending people argue about.

Your library stays yours. Commentarr only knows *which title* you're watching (by its TMDB / TVDB / IMDb id) and what you wrote. Every Commentarr server joins the same conversation on **[comments.forester.dev](https://comments.forester.dev)**, so a comment written on one person's server shows up for everyone watching that film or episode, on any server, whatever version of the file they have.

**Add it to Jellyfin** (Dashboard → Plugins → Repositories → +):

```
https://raw.githubusercontent.com/tuikat/commentarr/main/manifest.json
```

> **Jellyfin 10.11** is supported and tested. A **Plex** userscript is included as an experiment (see below).

---

## Install (Jellyfin)

1. **Dashboard → Plugins → Repositories → +** and add:
   ```
   https://raw.githubusercontent.com/tuikat/commentarr/main/manifest.json
   ```
2. **Catalog → Commentarr → Install**, then restart Jellyfin.
3. Play anything. A comments button appears in the player's control row, next to fullscreen.

That's it. It connects to the shared comment server by itself. No account, no sign-up: people comment under their Jellyfin name and can change it in the comments panel.

## Using it

Tap the comments button in the player controls for four choices:

- **Bubble** (the default on phones): one comment at a time in a small speech bubble, popping up as you reach its moment and fading a few seconds later. Seeking ahead doesn't replay what you skipped. Tap a bubble to open the overlay panel and write your own; closing it goes back to bubbles.
- **Overlay**: a small panel in the corner with up to four comments (three on a phone), like a live chat replay. Comments pinned to the last few minutes of what you're watching come first and slide in as you reach them. Quiet stretches are filled by the title's best comments, and for an episode the best from the rest of the show (labelled, e.g. `S23E02`), rotating every half minute. If there's nothing to show for a while, the panel steps aside entirely and comes back when a comment arrives. A one-line box lets you add your own.
- **Sidebar**: every comment beside the video: sort by **Top**, **New**, or **By time** (with a *Now* line that follows playback), reply, like, report. On a wide screen the video shrinks to make room instead of being covered.
- **Off**: no comments while you watch.

**Pinned comments.** Tap the `At 18:32` chip before posting to pin a comment to that moment, so it pops up for everyone at that exact point (a small dot shows it's on). Comments aren't pinned unless you choose to. Typing a time like `1:02:10` in any comment turns it into a jump link.

**Spoilers.** Tap *Spoiler* before posting to cover your comment until someone chooses to read it; you (or your server's admin) can mark or unmark it later from the ••• menu. Viewers can also turn on *Hide ahead* to cover comments pinned to moments they haven't reached yet and comments from later episodes.

**Watching on a TV.** TV apps (Android TV, Roku, Apple TV, webOS…) can't show the panel themselves, so use your phone as a second screen. Open Jellyfin on your phone in the browser or the Jellyfin app while something plays on your TV, and a **Comments** pill appears at the bottom. Tap it for the full comment panel, following the TV to within a fraction of a second. Pinned comments arrive as the TV reaches them, posting pins to the TV's moment, tapping a time jumps the TV there, and **Play/Pause** controls it. With more than one device playing, tap the device name to switch.

**Comments as subtitles.** Films and episodes also get a subtitle track called **Comments**. Pick it in any app's subtitle menu, TV apps included, and comments pinned to moments appear as subtitles at their moment (two at a time at most). The track is built fresh each time playback starts, so comments posted while you watch show up the next time. Most TV apps show one subtitle track at a time, so it replaces dialogue subtitles while it's on. Server admins can turn the track off, and choose to leave spoilers out of it, in the plugin settings.

**Different cuts.** Comments remember the length of the file they were written on. If yours is a different cut (extended, theatrical…), pinned comments say so, since their moment might not line up.

## Moderation (for Jellyfin admins)

**Dashboard → Plugins → Commentarr** has four tabs:

| Tab | What you can do |
| --- | --- |
| Connection | Comment server address, the name other servers see for yours, turn the button off, the Comments subtitle track (on by default) and whether spoilers are left out of it (off by default) |
| Reports | Comments your users reported, and your users' comments that anyone reported. **Hide** removes a comment for everyone on your server; **Delete** removes your own users' comments everywhere; **Block** hides everything from an outside person for your server |
| People | Your users who have commented; **ban** someone from commenting |
| Banned words | Your users can't post them, and other servers' comments containing them are hidden from your users |

Jellyfin administrators also get **Hide on my server** in each comment's ••• menu inside the player. The public server has its own moderators and word list, rate limits per person, per server and per address, and automatically hides a comment for review once people on several established servers report it.

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

## Other Jellyfin apps

App developers can add Commentarr natively: any app signed in to Jellyfin gets a comment token from this plugin and talks to the comment server directly. See the [API reference](https://github.com/tuikat/commentarr-server/blob/main/docs/API.md).

## Your own comment server?

Almost everyone should stay on **comments.forester.dev**: that's where everyone else's comments are, and a comment section is only as good as the people in it. If you need a **private** space (a family or friends group that doesn't want to mix with the public), run [commentarr-server](https://github.com/tuikat/commentarr-server) and change *Comment server* in the plugin settings.

## Building

```bash
./build.sh            # needs node 22+ and docker (the .NET 9 SDK runs in a container)
```

Produces `dist/commentarr_<version>.zip` (the Jellyfin plugin) and `dist/commentarr-plex.user.js`.

- `client/`: the player UI: `core.js` + `commentarr.css`, with one adapter per media server
- `src/Jellyfin.Plugin.Commentarr/`: the Jellyfin plugin (registration, user tokens, settings and moderation page, script injection)

`./build.sh install` also copies the plugin into a local Jellyfin: set `JELLYFIN_PLUGINS` to its `data/plugins` folder (and `JELLYFIN_CONTAINER` if the container isn't called `jellyfin`).

Something wrong in the player? Open the browser console and run `__commentarrState()`; include the output in your issue.

## Contributing

Bug reports, Plex testing, translations and ideas are all welcome: open an issue or a pull request. The best contribution of all is commenting: every comment you leave is there for the next person who watches.

## Licence

[AGPL-3.0-or-later](LICENSE). © Forester.
