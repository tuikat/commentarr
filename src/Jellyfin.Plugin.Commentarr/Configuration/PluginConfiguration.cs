using MediaBrowser.Model.Plugins;

namespace Jellyfin.Plugin.Commentarr.Configuration;

public class PluginConfiguration : BasePluginConfiguration
{
    public const string DefaultServer = "https://comments.forester.dev";

    /// <summary>The comment server. The public one is shared by everyone; you can run your own.</summary>
    public string ServerUrl { get; set; } = DefaultServer;

    /// <summary>Set automatically on first use. Identifies this Jellyfin server to the comment server.</summary>
    public string ServerId { get; set; } = string.Empty;

    /// <summary>Set automatically on first use. Never sent to browsers.</summary>
    public string ServerKey { get; set; } = string.Empty;

    /// <summary>Which comment server the id/key above belong to (re-register when the URL changes).</summary>
    public string RegisteredUrl { get; set; } = string.Empty;

    /// <summary>Name other servers see next to your users' comments. Empty = Jellyfin's server name.</summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>Show the comments button in the player.</summary>
    public bool Enabled { get; set; } = true;
}
