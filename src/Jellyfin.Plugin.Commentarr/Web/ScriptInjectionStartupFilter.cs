using System.Text;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Jellyfin.Plugin.Commentarr.Web;

/// <summary>
/// Injects the client CSS and script into jellyfin-web's index.html as it is served.
/// Defensive by design: only the web index is touched, it is idempotent, and on any
/// error the original page is served unchanged.
/// </summary>
public class ScriptInjectionStartupFilter : IStartupFilter
{
    private const string Marker = "Commentarr/client.js";
    private readonly ILogger<ScriptInjectionStartupFilter> _logger;

    public ScriptInjectionStartupFilter(ILogger<ScriptInjectionStartupFilter> logger)
    {
        _logger = logger;
    }

    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next)
    {
        return app =>
        {
            app.Use(InvokeAsync);
            next(app);
        };
    }

    private static bool IsIndexRequest(string? path)
    {
        if (string.IsNullOrEmpty(path))
        {
            return false;
        }

        return path.EndsWith("/web/", StringComparison.OrdinalIgnoreCase)
            || path.EndsWith("/web/index.html", StringComparison.OrdinalIgnoreCase)
            || path.EndsWith("/web", StringComparison.OrdinalIgnoreCase);
    }

    private async Task InvokeAsync(HttpContext context, Func<Task> next)
    {
        var plugin = Plugin.Instance;
        if (plugin is null
            || !plugin.Configuration.Enabled
            || !HttpMethods.IsGet(context.Request.Method)
            || !IsIndexRequest(context.Request.Path.Value))
        {
            await next().ConfigureAwait(false);
            return;
        }

        // A plain, complete 200 is the only thing we can rewrite.
        context.Request.Headers.Remove("Accept-Encoding");
        context.Request.Headers.Remove("Range");
        context.Request.Headers.Remove("If-Range");
        context.Request.Headers.Remove("If-None-Match");
        context.Request.Headers.Remove("If-Modified-Since");

        var original = context.Response.Body;
        using var buffer = new MemoryStream();
        context.Response.Body = buffer;
        try
        {
            await next().ConfigureAwait(false);
        }
        catch
        {
            context.Response.Body = original;
            throw;
        }

        context.Response.Body = original;
        buffer.Seek(0, SeekOrigin.Begin);

        var isHtml = context.Response.StatusCode == 200
            && (context.Response.ContentType?.Contains("text/html", StringComparison.OrdinalIgnoreCase) ?? false);
        if (!isHtml)
        {
            await buffer.CopyToAsync(original).ConfigureAwait(false);
            return;
        }

        string html;
        using (var reader = new StreamReader(buffer, Encoding.UTF8, true, 1024, leaveOpen: true))
        {
            html = await reader.ReadToEndAsync().ConfigureAwait(false);
        }

        try
        {
            if (html.IndexOf(Marker, StringComparison.OrdinalIgnoreCase) < 0)
            {
                var v = plugin.AssetVersion;
                // Relative to /web/, so it also works behind a base URL.
                var tags = $"<script defer src=\"../{Marker}?v={v}\"></script>";
                var at = html.LastIndexOf("</body>", StringComparison.OrdinalIgnoreCase);
                if (at >= 0)
                {
                    html = html.Substring(0, at) + tags + html.Substring(at);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Commentarr: injection failed, serving the original page");
        }

        var bytes = Encoding.UTF8.GetBytes(html);
        context.Response.ContentLength = bytes.Length;
        context.Response.Headers.Remove("ETag");
        context.Response.Headers.Remove("Last-Modified");
        context.Response.Headers["Cache-Control"] = "no-cache";
        await original.WriteAsync(bytes).ConfigureAwait(false);
    }
}
