using Jellyfin.Plugin.Commentarr.Configuration;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;

namespace Jellyfin.Plugin.Commentarr;

/// <summary>Commentarr: shared, timestamped comments in the Jellyfin player.</summary>
public class Plugin : BasePlugin<PluginConfiguration>, IHasWebPages
{
    public static readonly Guid PluginId = Guid.Parse("7eb6fc71-dd42-48bb-bed9-cca916e7b848");

    public Plugin(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer)
        : base(applicationPaths, xmlSerializer)
    {
        Instance = this;
    }

    public static Plugin? Instance { get; private set; }

    public override string Name => "Commentarr";

    public override Guid Id => PluginId;

    public override string Description => "Shared, timestamped comments in the player. Watch something and see what everyone else said at that moment.";

    public string AssetVersion => GetType().Assembly.GetName().Version?.ToString() ?? "1";

    public IEnumerable<PluginPageInfo> GetPages() => new[]
    {
        new PluginPageInfo
        {
            Name = "Commentarr",
            EmbeddedResourcePath = GetType().Namespace + ".Configuration.configPage.html",
        },
    };
}
