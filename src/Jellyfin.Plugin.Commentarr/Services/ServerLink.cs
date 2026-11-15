using System.Net.Http.Json;
using System.Text.Json;
using MediaBrowser.Controller;
using Microsoft.Extensions.Logging;

namespace Jellyfin.Plugin.Commentarr.Services;

/// <summary>
/// The link between this Jellyfin server and the comment server: registers once, then vouches
/// for each signed-in Jellyfin user so their browser gets a short-lived comment token.
/// The server key stays here; browsers only ever see their own token.
/// </summary>
public sealed class ServerLink
{
    private readonly IHttpClientFactory _http;
    private readonly IServerApplicationHost _host;
    private readonly ILogger<ServerLink> _logger;
    private readonly SemaphoreSlim _gate = new(1, 1);

    public ServerLink(IHttpClientFactory http, IServerApplicationHost host, ILogger<ServerLink> logger)
    {
        _http = http;
        _host = host;
        _logger = logger;
    }

    public string ServerUrl => (Plugin.Instance!.Configuration.ServerUrl ?? string.Empty).Trim().TrimEnd('/');

    private string ServerName
    {
        get
        {
            var name = Plugin.Instance!.Configuration.DisplayName;
            return string.IsNullOrWhiteSpace(name) ? _host.FriendlyName : name.Trim();
        }
    }

    private HttpClient Client()
    {
        var c = _http.CreateClient("Commentarr");
        c.Timeout = TimeSpan.FromSeconds(10);
        return c;
    }

    public bool IsRegistered
    {
        get
        {
            var cfg = Plugin.Instance!.Configuration;
            return !string.IsNullOrEmpty(cfg.ServerId) && !string.IsNullOrEmpty(cfg.ServerKey)
                && string.Equals(cfg.RegisteredUrl, ServerUrl, StringComparison.OrdinalIgnoreCase);
        }
    }

    public async Task EnsureRegisteredAsync(bool force, CancellationToken ct)
    {
        if (IsRegistered && !force)
        {
            return;
        }

        await _gate.WaitAsync(ct).ConfigureAwait(false);
        try
        {
            if (IsRegistered && !force)
            {
                return;
            }

            if (!Uri.TryCreate(ServerUrl, UriKind.Absolute, out var uri) || (uri.Scheme != "https" && uri.Scheme != "http"))
            {
                throw new InvalidOperationException("The comment server address isn't a valid http(s) URL.");
            }

            using var res = await Client().PostAsJsonAsync(ServerUrl + "/api/v1/servers", new { name = ServerName, kind = "jellyfin" }, ct).ConfigureAwait(false);
            var body = await res.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
            if (!res.IsSuccessStatusCode)
            {
                throw new InvalidOperationException("The comment server refused to register this server: " + ErrorOf(body, (int)res.StatusCode));
            }

            using var doc = JsonDocument.Parse(body);
            var cfg = Plugin.Instance!.Configuration;
            cfg.ServerId = doc.RootElement.GetProperty("serverId").GetString() ?? string.Empty;
            cfg.ServerKey = doc.RootElement.GetProperty("serverKey").GetString() ?? string.Empty;
            cfg.RegisteredUrl = ServerUrl;
            Plugin.Instance.SaveConfiguration();
            _logger.LogInformation("Commentarr: registered with {Url} as {Id}", ServerUrl, cfg.ServerId);
        }
        finally
        {
            _gate.Release();
        }
    }

    /// <summary>A comment-server token for one Jellyfin user. Re-registers once if the key was lost server-side.</summary>
    public async Task<JsonElement> TokenForAsync(string userId, string userName, bool isAdmin, CancellationToken ct)
    {
        await EnsureRegisteredAsync(false, ct).ConfigureAwait(false);
        var first = await RequestToken(userId, userName, isAdmin, ct).ConfigureAwait(false);
        if (first.Status == 401)
        {
            await EnsureRegisteredAsync(true, ct).ConfigureAwait(false);
            first = await RequestToken(userId, userName, isAdmin, ct).ConfigureAwait(false);
        }

        if (first.Status != 200)
        {
            throw new InvalidOperationException(ErrorOf(first.Body, first.Status));
        }

        using var doc = JsonDocument.Parse(first.Body);
        return doc.RootElement.Clone();
    }

    private async Task<(int Status, string Body)> RequestToken(string userId, string userName, bool isAdmin, CancellationToken ct)
    {
        var cfg = Plugin.Instance!.Configuration;
        using var req = new HttpRequestMessage(HttpMethod.Post, ServerUrl + "/api/v1/token")
        {
            Content = JsonContent.Create(new { userId, name = userName, admin = isAdmin, serverName = ServerName }),
        };
        req.Headers.TryAddWithoutValidation("Authorization", $"Server {cfg.ServerId}:{cfg.ServerKey}");
        using var res = await Client().SendAsync(req, ct).ConfigureAwait(false);
        return ((int)res.StatusCode, await res.Content.ReadAsStringAsync(ct).ConfigureAwait(false));
    }

    private static string ErrorOf(string body, int status)
    {
        try
        {
            using var doc = JsonDocument.Parse(body);
            if (doc.RootElement.TryGetProperty("error", out var e))
            {
                return e.GetString() ?? ("HTTP " + status);
            }
        }
        catch (JsonException)
        {
        }

        return "HTTP " + status;
    }
}
