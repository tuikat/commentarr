#!/bin/bash
# Builds the Commentarr Jellyfin plugin and the Plex userscript.
#   ./build.sh                 -> dist/commentarr_<ver>.zip, dist/commentarr-plex.user.js, manifest entry
#   ./build.sh install         -> also installs into a local Jellyfin and restarts it. Set
#                                 JELLYFIN_PLUGINS (its data/plugins folder) and JELLYFIN_CONTAINER.
# Needs: node 22+, docker (the .NET 9 SDK runs in a container).
set -euo pipefail
cd "$(dirname "$0")"
VER=$(grep -oP '(?<=<AssemblyVersion>)[^<]+' src/Jellyfin.Plugin.Commentarr/Jellyfin.Plugin.Commentarr.csproj)
SHORT=${VER%.0}
node build-client.mjs "$SHORT"
mkdir -p dist .nuget build
docker run --rm -v "$PWD":/src -v "$PWD/.nuget":/root/.nuget -w /src/src/Jellyfin.Plugin.Commentarr \
  mcr.microsoft.com/dotnet/sdk:9.0 dotnet publish -c Release -o /src/build --nologo -v q
ZIP="dist/commentarr_${VER}.zip"
rm -f "$ZIP"
STAGE=$(mktemp -d)
cp build/Jellyfin.Plugin.Commentarr.dll "$STAGE/"
cp images/icon.png "$STAGE/thumb.png"
cat > "$STAGE/meta.json" <<JSON
{"category":"General","changelog":"See https://github.com/tuikat/commentarr/releases","description":"Shared, timestamped comments in the player.","guid":"7eb6fc71-dd42-48bb-bed9-cca916e7b848","name":"Commentarr","overview":"See what everyone else said at this exact moment.","owner":"tuikat","targetAbi":"10.11.0.0","timestamp":"$(date -u +%Y-%m-%dT%H:%M:%SZ)","version":"$VER","status":"Active","autoUpdate":true,"imagePath":"thumb.png","assemblies":["Jellyfin.Plugin.Commentarr.dll"]}
JSON
(cd "$STAGE" && zip -qj - Jellyfin.Plugin.Commentarr.dll meta.json thumb.png) > "$ZIP"
rm -rf "$STAGE"
echo "built $ZIP  md5 $(md5sum "$ZIP" | cut -d' ' -f1)"
if [ "${1:-}" = install ]; then
  PLUGINS=${JELLYFIN_PLUGINS:?set JELLYFIN_PLUGINS to your Jellyfin data/plugins folder}
  CONTAINER=${JELLYFIN_CONTAINER:-jellyfin}
  DEST="$PLUGINS/Commentarr_$VER"
  docker stop "$CONTAINER" >/dev/null
  rm -rf "$PLUGINS"/Commentarr_*
  mkdir -p "$DEST" && unzip -qo "$ZIP" -d "$DEST" && chown -R 99:100 "$DEST"
  docker start "$CONTAINER" >/dev/null
  echo "installed to $DEST; Jellyfin restarting"
fi
