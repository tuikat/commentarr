using System.Text;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Jellyfin.Plugin.Commentarr.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Jellyfin.Plugin.Commentarr.Web;

/// <summary>
/// Adds a "Comments" subtitle track to the track list every player asks for before playing
/// (POST/GET /Items/{id}/PlaybackInfo), pointing at a signed link the plugin serves. Nothing is
/// written to the library. On anything unexpected the original response goes out untouched.
/// </summary>
public partial class PlaybackInfoStartupFilter : IStartupFilter
{
    private readonly CommentSubtitles _subs;
    private readonly ILogger<PlaybackInfoStartupFilter> _logger;

    public PlaybackInfoStartupFilter(CommentSubtitles subs, ILogger<PlaybackInfoStartupFilter> logger)
    {
        _subs = subs;
        _logger = logger;
    }

    [GeneratedRegex(@"/Items/([0-9a-fA-F-]{32,36})/PlaybackInfo$", RegexOptions.IgnoreCase)]
    private static partial Regex PathRx();

    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next)
    {
        return app =>
        {
            app.Use(InvokeAsync);
            next(app);
        };
    }

    private async Task InvokeAsync(HttpContext ctx, Func<Task> next)
    {
        var m = ctx.Request.Path.Value is { } p ? PathRx().Match(p) : Match.Empty;
        if (!m.Success || Plugin.Instance?.Configuration.SubtitleTrack != true
            || !(HttpMethods.IsPost(ctx.Request.Method) || HttpMethods.IsGet(ctx.Request.Method))
            || !Guid.TryParse(m.Groups[1].Value, out var itemId)
            || _subs.IdsFor(_subs.Item(itemId)).Count == 0)
        {
            await next().ConfigureAwait(false);
            return;
        }

        ctx.Request.Headers.Remove("Accept-Encoding");
        var original = ctx.Response.Body;
        using var buffer = new MemoryStream();
        ctx.Response.Body = buffer;
        try
        {
            await next().ConfigureAwait(false);
        }
        finally
        {
            ctx.Response.Body = original;
        }

        buffer.Seek(0, SeekOrigin.Begin);
        byte[]? changed = null;
        try
        {
            var uid = ctx.User.FindFirst("Jellyfin-UserId")?.Value;
            if (ctx.Response.StatusCode == 200 && Guid.TryParse(uid, out var user)
                && (ctx.Response.ContentType?.Contains("json", StringComparison.OrdinalIgnoreCase) ?? false))
            {
                changed = AddTrack(buffer.ToArray(), itemId.ToString("N"), user.ToString("N"));
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Commentarr: couldn't add the Comments track, serving the original");
        }

        if (changed is null)
        {
            await buffer.CopyToAsync(original).ConfigureAwait(false);
            return;
        }

        ctx.Response.ContentLength = changed.Length;
        await original.WriteAsync(changed).ConfigureAwait(false);
    }

    private static byte[]? AddTrack(byte[] json, string itemId, string userId)
    {
        if (JsonNode.Parse(json) is not JsonObject root) return null;
        // Jellyfin answers in PascalCase, or camelCase when a client asks for it.
        var camel = root.ContainsKey("mediaSources");
        string K(string name) => camel ? char.ToLowerInvariant(name[0]) + name[1..] : name;
        if (root[K("MediaSources")] is not JsonArray sources) return null;

        var any = false;
        foreach (var src in sources.OfType<JsonObject>())
        {
            if (src[K("MediaStreams")] is not JsonArray streams) continue;
            if (streams.OfType<JsonObject>().Any(s => (string?)s[K("Title")] == CommentSubtitles.TrackTitle && ((string?)s[K("DeliveryUrl")])?.Contains("/Commentarr/", StringComparison.Ordinal) == true)) continue;

            // Match the format this player already gets for external subtitles; WebVTT otherwise.
            var srt = streams.OfType<JsonObject>().Any(s => (string?)s[K("DeliveryMethod")] == "External"
                && ((string?)s[K("DeliveryUrl")])?.Split('?')[0].EndsWith(".srt", StringComparison.OrdinalIgnoreCase) == true);
            var index = streams.OfType<JsonObject>().Select(s => (int?)s[K("Index")] ?? -1).DefaultIfEmpty(-1).Max() + 1;
            var track = new JsonObject
            {
                [K("Codec")] = srt ? "subrip" : "webvtt",
                [K("Title")] = CommentSubtitles.TrackTitle,
                [K("DisplayTitle")] = CommentSubtitles.TrackTitle,
                [K("LocalizedDefault")] = "Default",
                [K("LocalizedExternal")] = "External",
                [K("IsDefault")] = false,
                [K("IsForced")] = false,
                [K("IsHearingImpaired")] = false,
                [K("IsInterlaced")] = false,
                [K("IsExternal")] = true,
                [K("IsTextSubtitleStream")] = true,
                [K("SupportsExternalStream")] = true,
                [K("Type")] = "Subtitle",
                [K("Index")] = index,
                [K("DeliveryMethod")] = "External",
                [K("DeliveryUrl")] = CommentSubtitles.Url(itemId, userId, srt ? "srt" : "vtt"),
            };
            streams.Add(track);
            any = true;
        }

        return any ? Encoding.UTF8.GetBytes(root.ToJsonString()) : null;
    }
}
