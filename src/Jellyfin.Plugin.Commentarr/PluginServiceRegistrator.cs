using Jellyfin.Plugin.Commentarr.Services;
using Jellyfin.Plugin.Commentarr.Web;
using MediaBrowser.Controller;
using MediaBrowser.Controller.Plugins;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Jellyfin.Plugin.Commentarr;

public class PluginServiceRegistrator : IPluginServiceRegistrator
{
    public void RegisterServices(IServiceCollection serviceCollection, IServerApplicationHost applicationHost)
    {
        serviceCollection.AddHttpClient();
        serviceCollection.AddSingleton<ServerLink>();
        // Precise playback positions for the second-screen companion.
        serviceCollection.AddSingleton<PlaybackClock>();
        serviceCollection.AddHostedService(sp => sp.GetRequiredService<PlaybackClock>());
        serviceCollection.AddSingleton<IStartupFilter, ReportStampStartupFilter>();
        // Adds the player script to jellyfin-web's index.html as it is served; nothing on disk changes.
        serviceCollection.AddSingleton<IStartupFilter, ScriptInjectionStartupFilter>();
    }
}
