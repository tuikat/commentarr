using System.Reflection;
using System.Security.Claims;
using Jellyfin.Plugin.Commentarr.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Jellyfin.Plugin.Commentarr.Api;

[ApiController]
[Route("Commentarr")]
public class CommentarrController : ControllerBase
{
    private readonly ServerLink _link;

    public CommentarrController(ServerLink link)
    {
        _link = link;
    }

    /// <summary>
    /// A short-lived comment-server token for the signed-in user. Jellyfin administrators get
    /// moderation rights for this server's comments.
    /// </summary>
    [HttpGet("Token")]
    [Authorize]
    public async Task<ActionResult> GetToken(CancellationToken ct)
    {
        var userId = User.FindFirst("Jellyfin-UserId")?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var name = User.FindFirst(ClaimTypes.Name)?.Value ?? "Viewer";
        var admin = User.IsInRole("Administrator");
        try
        {
            var t = await _link.TokenForAsync(userId.Replace("-", string.Empty, StringComparison.Ordinal), name, admin, ct).ConfigureAwait(false);
            return Ok(new
            {
                token = t.GetProperty("token").GetString(),
                exp = t.GetProperty("exp").GetInt64(),
                serverUrl = _link.ServerUrl,
                admin,
            });
        }
        catch (Exception ex) when (ex is InvalidOperationException or HttpRequestException or TaskCanceledException)
        {
            return StatusCode(502, new { error = "Couldn't reach the comment server: " + ex.Message });
        }
    }

    /// <summary>Connection state for the settings page.</summary>
    [HttpGet("Status")]
    [Authorize(Policy = "RequiresElevation")]
    public ActionResult GetStatus()
    {
        var cfg = Plugin.Instance!.Configuration;
        return Ok(new { serverUrl = _link.ServerUrl, registered = _link.IsRegistered, serverId = cfg.ServerId });
    }

    /// <summary>Register again with the comment server (after changing its address, or to start fresh).</summary>
    [HttpPost("Register")]
    [Authorize(Policy = "RequiresElevation")]
    public async Task<ActionResult> Register(CancellationToken ct)
    {
        try
        {
            await _link.EnsureRegisteredAsync(true, ct).ConfigureAwait(false);
            return Ok(new { registered = true, serverId = Plugin.Instance!.Configuration.ServerId });
        }
        catch (Exception ex) when (ex is InvalidOperationException or HttpRequestException or TaskCanceledException)
        {
            return StatusCode(502, new { error = ex.Message });
        }
    }

    [HttpGet("client.js")]
    [AllowAnonymous]
    public ActionResult Client()
    {
        var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(typeof(Plugin).Namespace + ".Web.commentarr.js");
        if (stream is null)
        {
            return NotFound();
        }

        Response.Headers["Cache-Control"] = "public, max-age=300";
        return File(stream, "application/javascript; charset=utf-8");
    }
}
