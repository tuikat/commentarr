using System.Security.Claims;
using Jellyfin.Plugin.Commentarr.Services;
using MediaBrowser.Controller.Session;
using MediaBrowser.Model.Session;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jellyfin.Plugin.Commentarr.Api;

/// <summary>
/// Second screen: what the signed-in user is playing on their other devices (a TV app, say), with
/// a precise position, and simple remote control of it. Only ever the caller's own sessions.
/// </summary>
[ApiController]
[Route("Commentarr")]
[Authorize]
public class CompanionController : ControllerBase
{
    private readonly ISessionManager _sessions;
    private readonly PlaybackClock _clock;

    public CompanionController(ISessionManager sessions, PlaybackClock clock)
    {
        _sessions = sessions;
        _clock = clock;
    }

    private Guid? UserId => Guid.TryParse(User.FindFirst("Jellyfin-UserId")?.Value, out var g) ? g : null;

    [HttpGet("NowPlaying")]
    public ActionResult NowPlaying([FromQuery] string? exclude)
    {
        var uid = UserId;
        if (uid is null)
        {
            return Unauthorized();
        }

        var list = _sessions.Sessions
            .Where(s => s.UserId.Equals(uid.Value) && s.NowPlayingItem is not null && !string.Equals(s.DeviceId, exclude, StringComparison.Ordinal))
            .Select(s =>
            {
                var item = s.NowPlayingItem!;
                var mark = _clock.Get(s.Id);
                long ticks;
                bool paused;
                double age;
                if (mark is not null && mark.ItemId.Equals(item.Id))
                {
                    ticks = mark.PositionTicks;
                    paused = mark.Paused;
                    age = PlaybackClock.AgeMs(mark);
                }
                else
                {
                    // Playing since before Jellyfin started tracking: fall back to the session's own record.
                    ticks = s.PlayState?.PositionTicks ?? 0;
                    paused = s.PlayState?.IsPaused ?? false;
                    age = Math.Max(0, (DateTime.UtcNow - s.LastPlaybackCheckIn).TotalMilliseconds);
                }

                return new
                {
                    sessionId = s.Id,
                    deviceName = s.DeviceName,
                    client = s.Client,
                    itemId = item.Id.ToString("N"),
                    title = string.IsNullOrEmpty(item.SeriesName) ? item.Name : item.SeriesName,
                    positionMs = ticks / 10000,
                    ageMs = Math.Round(age),
                    paused,
                    canControl = s.SupportsMediaControl,
                    lastReport = s.LastPlaybackCheckIn,
                };
            })
            .OrderByDescending(x => x.lastReport)
            .ToList();
        return Ok(new { sessions = list });
    }

    /// <summary>Seek, pause or resume one of the caller's own sessions.</summary>
    [HttpPost("Remote/{sessionId}")]
    public async Task<ActionResult> Remote([FromRoute] string sessionId, [FromQuery] string action, [FromQuery] long? ms, CancellationToken ct)
    {
        var uid = UserId;
        var s = _sessions.Sessions.FirstOrDefault(x => string.Equals(x.Id, sessionId, StringComparison.Ordinal));
        if (uid is null || s is null || !s.UserId.Equals(uid.Value) || s.NowPlayingItem is null)
        {
            return NotFound(new { error = "That device isn't playing anything." });
        }

        if (!s.SupportsMediaControl)
        {
            return Conflict(new { error = "That device can't be controlled remotely." });
        }

        var req = action switch
        {
            "seek" when ms is >= 0 => new PlaystateRequest { Command = PlaystateCommand.Seek, SeekPositionTicks = ms.Value * 10000 },
            "pause" => new PlaystateRequest { Command = PlaystateCommand.Pause },
            "unpause" => new PlaystateRequest { Command = PlaystateCommand.Unpause },
            _ => null,
        };
        if (req is null)
        {
            return BadRequest(new { error = "Unknown action" });
        }

        req.ControllingUserId = uid.Value.ToString("N");
        await _sessions.SendPlaystateCommand(null, s.Id, req, ct).ConfigureAwait(false);

        // Assume the device obeyed until its next report.
        var mark = _clock.Get(s.Id);
        var item = s.NowPlayingItem.Id;
        var pos = mark is not null && mark.ItemId.Equals(item)
            ? mark.PositionTicks + (mark.Paused ? 0 : (long)(PlaybackClock.AgeMs(mark) * 10000))
            : s.PlayState?.PositionTicks ?? 0;
        var paused = mark?.Paused ?? s.PlayState?.IsPaused ?? false;
        if (action == "seek")
        {
            pos = ms!.Value * 10000;
        }
        else
        {
            paused = action == "pause";
        }

        _clock.Set(s.Id, item, pos, paused);
        return Ok(new { ok = true });
    }
}
