using System.Text.RegularExpressions;
using Jellyfin.Plugin.Commentarr.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace Jellyfin.Plugin.Commentarr.Web;

/// <summary>
/// Notes the instant a playback report reaches the server, before Jellyfin spends time on it
/// (it saves progress to the database before announcing it, which takes about a second).
/// Reads only the request path and the device id; never the body, never changes anything.
/// </summary>
public partial class ReportStampStartupFilter : IStartupFilter
{
    private readonly PlaybackClock _clock;

    public ReportStampStartupFilter(PlaybackClock clock)
    {
        _clock = clock;
    }

    [GeneratedRegex("DeviceId=\"([^\"]+)\"", RegexOptions.IgnoreCase)]
    private static partial Regex DeviceIdRx();

    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next)
    {
        return app =>
        {
            app.Use(async (ctx, nxt) =>
            {
                try
                {
                    var path = ctx.Request.Path.Value;
                    if (HttpMethods.IsPost(ctx.Request.Method) && path is not null
                        && path.Contains("/Sessions/Playing", StringComparison.OrdinalIgnoreCase))
                    {
                        string? device = null;
                        foreach (var h in new[] { "Authorization", "X-Emby-Authorization" })
                        {
                            var m = DeviceIdRx().Match(ctx.Request.Headers[h].ToString());
                            if (m.Success) { device = Uri.UnescapeDataString(m.Groups[1].Value); break; }
                        }

                        if (device is not null)
                        {
                            _clock.Arrived(device);
                        }
                    }
                }
                catch
                {
                    // never get in the way of playback
                }

                await nxt(ctx).ConfigureAwait(false);
            });
            next(app);
        };
    }
}
