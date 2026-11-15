using System.Collections.Concurrent;
using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using MediaBrowser.Controller.Entities;
using MediaBrowser.Controller.Entities.Movies;
using MediaBrowser.Controller.Entities.TV;
using MediaBrowser.Controller.Library;

namespace Jellyfin.Plugin.Commentarr.Services;

/// <summary>
/// Turns the comments pinned to moments in a film or episode into a subtitle track, for players that
/// can't show the comments panel (TV apps). Built fresh when a player loads the track.
/// </summary>
public sealed class CommentSubtitles
{
    public const string TrackTitle = "Comments";

    private readonly ServerLink _link;
    private readonly ILibraryManager _library;
    private readonly IUserManager _users;
    private readonly ConcurrentDictionary<string, (DateTime At, List<Cue> Cues)> _cache = new(StringComparer.Ordinal);

    public CommentSubtitles(ServerLink link, ILibraryManager library, IUserManager users)
    {
        _link = link;
        _library = library;
        _users = users;
    }

    public sealed record Cue(long StartMs, long EndMs, string Text);

    private sealed record Line(long StartMs, long EndMs, string Text);

    /// <summary>The shared thread ids for an item, or none when it can't have a thread (same rules as the player).</summary>
    public List<string> IdsFor(BaseItem? item)
    {
        var ids = new List<string>();
        static string? P(BaseItem i, string k) => i.ProviderIds is { } d && d.TryGetValue(k, out var v) && !string.IsNullOrWhiteSpace(v) ? v : null;
        if (item is Movie m)
        {
            if (P(m, "Tmdb") is { } t) ids.Add("movie/tmdb/" + t);
            if (P(m, "Imdb") is { } i) ids.Add("movie/imdb/" + i.ToLowerInvariant());
        }
        else if (item is Episode e && e.Series is { } s && e.ParentIndexNumber is { } sn && e.IndexNumber is { } en)
        {
            var se = "/s" + sn.ToString(CultureInfo.InvariantCulture) + "e" + en.ToString(CultureInfo.InvariantCulture);
            if (P(s, "Tvdb") is { } a) ids.Add("tv/tvdb/" + a + se);
            if (P(s, "Tmdb") is { } b) ids.Add("tv/tmdb/" + b + se);
            if (P(s, "Imdb") is { } c) ids.Add("tv/imdb/" + c.ToLowerInvariant() + se);
        }

        return ids;
    }

    public BaseItem? Item(Guid id) => _library.GetItemById(id);

    // ---------------------------------------------------------------- signed links --

    private static byte[] Secret()
    {
        var plugin = Plugin.Instance!;
        if (string.IsNullOrEmpty(plugin.Configuration.SubtitleSecret))
        {
            plugin.Configuration.SubtitleSecret = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            plugin.SaveConfiguration();
        }

        return Encoding.UTF8.GetBytes(plugin.Configuration.SubtitleSecret);
    }

    public static string Sign(string itemId, string userId)
        => Convert.ToHexString(HMACSHA256.HashData(Secret(), Encoding.UTF8.GetBytes(itemId + ":" + userId)))[..32].ToLowerInvariant();

    public static bool Verify(string itemId, string userId, string? sig)
        => sig is { Length: 32 } && CryptographicOperations.FixedTimeEquals(Encoding.ASCII.GetBytes(Sign(itemId, userId)), Encoding.ASCII.GetBytes(sig.ToLowerInvariant()));

    public static string Url(string itemId, string userId, string ext)
        => $"/Commentarr/Subtitles/{itemId}/Stream.{ext}?u={userId}&s={Sign(itemId, userId)}";

    // ---------------------------------------------------------------- building --

    public async Task<List<Cue>> CuesAsync(Guid itemId, Guid userId, CancellationToken ct)
    {
        var key = itemId.ToString("N") + ":" + userId.ToString("N");
        if (_cache.TryGetValue(key, out var hit) && DateTime.UtcNow - hit.At < TimeSpan.FromSeconds(20))
        {
            return hit.Cues;
        }

        var item = _library.GetItemById(itemId);
        var ids = IdsFor(item);
        var cues = new List<Cue>();
        if (ids.Count > 0)
        {
            var user = _users.GetUserById(userId);
            var tok = await _link.TokenForAsync(userId.ToString("N"), user?.Username ?? "Viewer", false, ct).ConfigureAwait(false);
            var data = await _link.CommentsAsync(tok.GetProperty("token").GetString()!, ids, ct).ConfigureAwait(false);
            var runtimeMs = item!.RunTimeTicks is { } rt ? rt / 10000 : (long?)null;
            var hideSpoilers = Plugin.Instance!.Configuration.SubtitleHideSpoilers;
            var lines = new List<Line>();
            foreach (var c in data.GetProperty("comments").EnumerateArray())
            {
                if (c.TryGetProperty("parentId", out var pid) && pid.ValueKind != JsonValueKind.Null) continue;
                if (!c.TryGetProperty("posMs", out var pos) || pos.ValueKind != JsonValueKind.Number) continue;
                var spoiler = c.TryGetProperty("spoiler", out var sp) && sp.ValueKind == JsonValueKind.True;
                if (spoiler && hideSpoilers) continue;
                // written on a different cut: its moment probably doesn't line up with this file
                if (runtimeMs is > 0 && c.TryGetProperty("runtimeMs", out var crt) && crt.ValueKind == JsonValueKind.Number
                    && Math.Abs(crt.GetDouble() - runtimeMs.Value) / runtimeMs.Value > 0.03) continue;
                var name = c.GetProperty("author").GetProperty("name").GetString() ?? "Viewer";
                var body = Clip(string.Join(' ', (c.GetProperty("body").GetString() ?? string.Empty).Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries)), 120);
                var text = (spoiler ? "[Spoiler] " : string.Empty) + name + ": " + body;
                var start = pos.GetInt64();
                lines.Add(new Line(start, start + Math.Clamp(2500 + (60 * body.Length), 3500, 8000), text));
            }

            cues = Layout(lines);
        }

        if (cues.Count == 0)
        {
            cues.Add(new Cue(1000, 6000, "Comments: nothing pinned to a moment yet"));
        }

        _cache[key] = (DateTime.UtcNow, cues);
        return cues;
    }

    private static string Clip(string s, int max)
    {
        if (s.Length <= max) return s;
        var cut = s.LastIndexOf(' ', max - 1);
        return s[..(cut > max / 2 ? cut : max - 1)] + "…";
    }

    /// <summary>
    /// Many players show only one cue at a time, so overlapping comments are merged: at any moment
    /// the (up to) two most recent comments that are still on screen, one per line.
    /// </summary>
    private static List<Cue> Layout(List<Line> lines)
    {
        lines.Sort((a, b) => a.StartMs.CompareTo(b.StartMs));
        var edges = lines.SelectMany(l => new[] { l.StartMs, l.EndMs }).Distinct().Order().ToList();
        var outp = new List<Cue>();
        for (var i = 0; i + 1 < edges.Count; i++)
        {
            long a = edges[i], b = edges[i + 1];
            var on = lines.Where(l => l.StartMs <= a && l.EndMs >= b).TakeLast(2).Select(l => l.Text).ToList();
            if (on.Count == 0) continue;
            var text = string.Join("\n", on);
            if (outp.Count > 0 && outp[^1].EndMs == a && outp[^1].Text == text)
            {
                outp[^1] = outp[^1] with { EndMs = b };
            }
            else
            {
                outp.Add(new Cue(a, b, text));
            }
        }

        return outp;
    }

    // ---------------------------------------------------------------- formats --

    // Only what every subtitle parser understands: quotes stay as they are (Android TV shows &#39; literally).
    private static string Enc(string s) => s.Replace("&", "&amp;", StringComparison.Ordinal).Replace("<", "&lt;", StringComparison.Ordinal).Replace(">", "&gt;", StringComparison.Ordinal);

    private static string Time(long ms, char sep)
    {
        var t = TimeSpan.FromMilliseconds(ms);
        return string.Format(CultureInfo.InvariantCulture, "{0:00}:{1:00}:{2:00}{3}{4:000}", (int)t.TotalHours, t.Minutes, t.Seconds, sep, t.Milliseconds);
    }

    public static string Vtt(List<Cue> cues)
    {
        var sb = new StringBuilder("WEBVTT\n\n");
        foreach (var c in cues)
        {
            sb.Append(Time(c.StartMs, '.')).Append(" --> ").Append(Time(c.EndMs, '.')).Append('\n').Append(Enc(c.Text)).Append("\n\n");
        }

        return sb.ToString();
    }

    public static string Srt(List<Cue> cues)
    {
        var sb = new StringBuilder();
        var n = 1;
        foreach (var c in cues)
        {
            sb.Append(n++).Append('\n').Append(Time(c.StartMs, ',')).Append(" --> ").Append(Time(c.EndMs, ',')).Append('\n').Append(Enc(c.Text)).Append("\n\n");
        }

        return sb.ToString();
    }

    /// <summary>jellyfin-web's own subtitle format (it asks for Stream.js); its renderer treats Text as HTML.</summary>
    public static string Js(List<Cue> cues)
        => JsonSerializer.Serialize(new
        {
            TrackEvents = cues.Select((c, i) => new
            {
                Id = (i + 1).ToString(CultureInfo.InvariantCulture),
                Text = Enc(c.Text),
                StartPositionTicks = c.StartMs * 10000,
                EndPositionTicks = c.EndMs * 10000,
            }),
        });
}
