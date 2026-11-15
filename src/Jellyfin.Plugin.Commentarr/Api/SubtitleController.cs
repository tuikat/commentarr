using Jellyfin.Plugin.Commentarr.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jellyfin.Plugin.Commentarr.Api;

/// <summary>
/// The "Comments" subtitle track. Anonymous because TV apps fetch subtitle links without a login
/// header, so every link is signed for one item and one user (see PlaybackInfoStartupFilter).
/// </summary>
[ApiController]
[Route("Commentarr/Subtitles")]
public class SubtitleController : ControllerBase
{
    private readonly CommentSubtitles _subs;

    public SubtitleController(CommentSubtitles subs)
    {
        _subs = subs;
    }

    [HttpGet("{itemId}/Stream.{ext}")]
    [AllowAnonymous]
    public async Task<ActionResult> Get([FromRoute] string itemId, [FromRoute] string ext, [FromQuery] string? u, [FromQuery] string? s, CancellationToken ct)
    {
        if (Plugin.Instance?.Configuration.SubtitleTrack != true) return NotFound();
        if (!Guid.TryParse(itemId, out var item) || !Guid.TryParse(u, out var user)) return NotFound();
        if (!CommentSubtitles.Verify(item.ToString("N"), user.ToString("N"), s)) return NotFound();

        List<CommentSubtitles.Cue> cues;
        try
        {
            cues = await _subs.CuesAsync(item, user, ct).ConfigureAwait(false);
        }
        catch (Exception ex) when (ex is InvalidOperationException or HttpRequestException or TaskCanceledException)
        {
            cues = new() { new CommentSubtitles.Cue(1000, 6000, "Comments: the comment server can't be reached right now") };
        }

        Response.Headers["Cache-Control"] = "no-store";
        return ext.ToLowerInvariant() switch
        {
            "vtt" => Content(CommentSubtitles.Vtt(cues), "text/vtt; charset=utf-8"),
            "srt" or "subrip" => Content(CommentSubtitles.Srt(cues), "application/x-subrip; charset=utf-8"),
            "js" => Content(CommentSubtitles.Js(cues), "application/json; charset=utf-8"),
            _ => NotFound(),
        };
    }
}
