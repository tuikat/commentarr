// Bundles the player UI: CSS + adapter + core -> one file each for Jellyfin and the Plex userscript.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const v = process.argv[2] || '1.0.0';
const css = readFileSync('client/commentarr.css', 'utf8');
const core = readFileSync('client/core.js', 'utf8');
const banner = `/*! Commentarr ${v} · https://github.com/tuikat/commentarr · AGPL-3.0-or-later */\n`;
const cssLine = `window.__CMTR_CSS__ = ${JSON.stringify(css)};\n`;
writeFileSync('src/Jellyfin.Plugin.Commentarr/Web/commentarr.js', banner + cssLine + readFileSync('client/adapter-jellyfin.js', 'utf8') + '\n' + core);
mkdirSync('dist', { recursive: true });
const meta = `// ==UserScript==
// @name         Commentarr for Plex (experimental)
// @namespace    https://forester.dev/commentarr
// @version      ${v}
// @description  Shared, timestamped comments in Plex Web. EXPERIMENTAL and untested; Jellyfin is the supported platform.
// @author       Forester
// @license      AGPL-3.0-or-later
// @homepageURL  https://github.com/tuikat/commentarr
// @match        *://*/web/*
// @match        https://app.plex.tv/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
`;
writeFileSync('dist/commentarr-plex.user.js', meta + banner + cssLine + readFileSync('client/adapter-plex.js', 'utf8') + '\n' + core);
console.log('client bundles built', v);
