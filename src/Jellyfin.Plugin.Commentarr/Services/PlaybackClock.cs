using System.Collections.Concurrent;
using System.Diagnostics;
using MediaBrowser.Controller.Library;
using MediaBrowser.Controller.Session;
using Microsoft.Extensions.Hosting;

namespace Jellyfin.Plugin.Commentarr.Services;

/// <summary>
/// Remembers, for every playing session, the last position its client reported and exactly when
/// that report arrived (a monotonic clock, not the wall clock). The companion view on a phone uses
/// it to follow a TV's playback closely: position = reported + time since the report.
/// Reports Jellyfin makes up itself (IsAutomated) are ignored; they repeat stale positions.
/// </summary>
public sealed class PlaybackClock : IHostedService
{
    public sealed record Mark(Guid ItemId, long PositionTicks, bool Paused, long At);

    private readonly ISessionManager _sessions;
    private readonly ConcurrentDictionary<string, Mark> _marks = new(StringComparer.Ordinal);
    private readonly ConcurrentDictionary<string, long> _arrived = new(StringComparer.Ordinal);

    /// <summary>A playback report from this device just reached the server (see ReportStampStartupFilter).</summary>
    public void Arrived(string deviceId) => _arrived[deviceId] = Stopwatch.GetTimestamp();

    public PlaybackClock(ISessionManager sessions)
    {
        _sessions = sessions;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _sessions.PlaybackStart += OnReport;
        _sessions.PlaybackProgress += OnReport;
        _sessions.PlaybackStopped += OnStopped;
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _sessions.PlaybackStart -= OnReport;
        _sessions.PlaybackProgress -= OnReport;
        _sessions.PlaybackStopped -= OnStopped;
        return Task.CompletedTask;
    }

    private void OnReport(object? sender, PlaybackProgressEventArgs e)
    {
        if (e.IsAutomated || e.Session is null || e.Item is null)
        {
            return;
        }

        // The position is from when the report arrived, not from now: Jellyfin announces it late.
        var at = Stopwatch.GetTimestamp();
        if (e.Session.DeviceId is { } dev && _arrived.TryGetValue(dev, out var a) && Stopwatch.GetElapsedTime(a).TotalSeconds < 8)
        {
            at = a;
        }

        _marks[e.Session.Id] = new Mark(e.Item.Id, e.PlaybackPositionTicks ?? 0, e.IsPaused, at);
    }

    private void OnStopped(object? sender, PlaybackStopEventArgs e)
    {
        if (e.Session is not null)
        {
            _marks.TryRemove(e.Session.Id, out _);
        }
    }

    public Mark? Get(string sessionId) => _marks.TryGetValue(sessionId, out var m) ? m : null;

    /// <summary>After we tell a device to seek or pause, assume it did until its next report says otherwise.</summary>
    public void Set(string sessionId, Guid itemId, long positionTicks, bool paused)
        => _marks[sessionId] = new Mark(itemId, positionTicks, paused, Stopwatch.GetTimestamp());

    public static double AgeMs(Mark m) => Stopwatch.GetElapsedTime(m.At).TotalMilliseconds;
}
