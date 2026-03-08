"use client";

import { useState, useEffect } from "react";
import { useRaceData } from "@/hooks/use-race-data";
import { FlagIndicator } from "@/components/FlagIndicator";
import SessionBanner from "@/components/SessionBanner";
import { WeatherWidget } from "@/components/WeatherWidget";
import { RaceControlFeed } from "@/components/RaceControlFeed";
import { TireIcon } from "@/components/TireIcon";
import { formatLapTime, formatGap } from "@/lib/utils";
import type { Session, Meeting } from "@/lib/openf1/types";

export default function DashboardScreen() {
  const { state, connected, selectSession } = useRaceData();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedMeetingKey, setSelectedMeetingKey] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch meetings for selected year
  useEffect(() => {
    async function fetchMeetings() {
      try {
        const res = await fetch(`https://api.openf1.org/v1/meetings?year=${selectedYear}`);
        const data = await res.json();
        if (Array.isArray(data)) setMeetings(data);
      } catch { /* ignore */ }
    }
    fetchMeetings();
  }, [selectedYear]);

  async function fetchSessions(meetingKey: number) {
    setSelectedMeetingKey(meetingKey);
    setSessions([]);
    setError(null);
    try {
      const res = await fetch(`https://api.openf1.org/v1/sessions?meeting_key=${meetingKey}`);
      const data = await res.json();
      if (Array.isArray(data)) setSessions(data);
    } catch { /* ignore */ }
  }

  async function handleSelectSession(session: Session) {
    setLoading(true);
    setError(null);
    try {
      const res = await selectSession(session.session_key, session.meeting_key);
      if (!res) {
        setError("Failed to load session");
      }
    } catch {
      setError("Failed to load session");
    } finally {
      setLoading(false);
    }
  }

  async function handleReplaySession(session: Session) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/replay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", sessionKey: session.session_key, meetingKey: session.meeting_key }),
      });
      if (!res.ok) setError("Failed to start replay");
    } catch {
      setError("Failed to start replay");
    } finally {
      setLoading(false);
    }
  }

  async function replayAction(action: string, speed?: number) {
    await fetch("/api/replay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, speed }),
    });
  }

  const top5 = state.positions.slice(0, 5);

  return (
    <div className="min-h-screen bg-f1-dark">
      <SessionBanner session={state.session} meeting={state.meeting} />
      {state.replay?.active && (
        <div className="bg-f1-carbon border-b border-gray-700 px-4 py-2">
          <div className="mx-auto max-w-7xl flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-f1-red">Replay</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => replayAction(state.replay?.playing ? "pause" : "play")}
                className="px-3 py-1 rounded bg-f1-gray hover:bg-gray-600 text-sm font-bold transition-colors"
              >
                {state.replay?.playing ? "⏸" : "▶"}
              </button>
              <button
                onClick={() => replayAction("stop")}
                className="px-3 py-1 rounded bg-f1-gray hover:bg-gray-600 text-sm font-bold transition-colors"
              >
                ⏹
              </button>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 5, 10, 20].map(s => (
                <button
                  key={s}
                  onClick={() => replayAction("speed", s)}
                  className={`px-2 py-1 rounded text-xs font-mono font-bold transition-colors ${
                    state.replay?.speed === s
                      ? "bg-f1-red text-white"
                      : "bg-f1-gray text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
            <div className="flex-1 flex items-center gap-3">
              <span className="text-xs text-gray-400 font-mono">
                {state.replay?.currentTime
                  ? new Date(state.replay.currentTime).toLocaleTimeString()
                  : "--:--:--"}
              </span>
              <div className="flex-1 h-1 bg-f1-gray rounded-full overflow-hidden">
                <div
                  className="h-full bg-f1-red rounded-full transition-all duration-200"
                  style={{
                    width: `${
                      state.replay?.startTime && state.replay?.endTime && state.replay?.currentTime
                        ? ((new Date(state.replay.currentTime).getTime() - new Date(state.replay.startTime).getTime()) /
                            (new Date(state.replay.endTime).getTime() - new Date(state.replay.startTime).getTime())) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-xs text-gray-400 font-mono">
                {state.replay?.endTime
                  ? new Date(state.replay.endTime).toLocaleTimeString()
                  : "--:--:--"}
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="p-4 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight">
            <span className="text-f1-red">F1</span> DASHBOARD
          </h1>
          <div className="flex items-center gap-3">
            <FlagIndicator flag={state.currentFlag} />
            <div className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-xs text-gray-400">{connected ? "LIVE" : "DISCONNECTED"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Left column - Session selector & Race status */}
          <div className="space-y-4">
            {/* Session Selector */}
            <div className="rounded-lg bg-f1-carbon p-4">
              <h2 className="mb-3 font-bold text-sm uppercase tracking-wider text-gray-400">Session Selector</h2>
              <div className="flex gap-2 mb-3">
                {[2023, 2024, 2025].map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-3 py-1 rounded text-sm ${selectedYear === year ? "bg-f1-red text-white" : "bg-f1-gray text-gray-300 hover:bg-gray-600"}`}
                  >
                    {year}
                  </button>
                ))}
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {(meetings ?? []).map(meeting => {
                  const isSelected = selectedMeetingKey === meeting.meeting_key;
                  const isActive = state.meetingKey === meeting.meeting_key;
                  return (
                    <button
                      key={meeting.meeting_key}
                      onClick={() => fetchSessions(meeting.meeting_key)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        isActive
                          ? "bg-f1-red/10 text-white font-semibold border-l-2 border-f1-red"
                          : isSelected
                            ? "bg-f1-gray text-white"
                            : "hover:bg-f1-gray text-gray-300"
                      }`}
                    >
                      {meeting.meeting_name}
                      {isActive && <span className="ml-2 text-xs text-f1-red">(active)</span>}
                    </button>
                  );
                })}
              </div>
              {error && (
                <div className="mt-2 px-3 py-2 rounded bg-red-900/30 text-red-400 text-xs">
                  {error}
                </div>
              )}
              {(sessions ?? []).length > 0 && (
                <div className="mt-3 border-t border-gray-700 pt-3 space-y-1">
                  {(sessions ?? []).map(session => {
                    const isActive = state.sessionKey === session.session_key;
                    const isReplaying = isActive && !!state.replay?.active;
                    return (
                      <div key={session.session_key} className={`flex items-center gap-1 rounded text-sm transition-colors ${
                        isActive
                          ? "bg-f1-red text-white font-bold shadow-lg shadow-f1-red/20"
                          : "hover:bg-f1-gray text-gray-300"
                      } ${loading ? "opacity-50 cursor-wait" : ""}`}>
                        <button
                          onClick={() => handleSelectSession(session)}
                          disabled={loading}
                          className="flex-1 text-left px-3 py-2"
                        >
                          <span className="flex items-center justify-between">
                            <span>
                              {isReplaying ? "▶ " : isActive ? "▸ " : ""}{session.session_name}
                            </span>
                            <span className={`text-xs ${isActive ? "text-white/70" : "text-gray-500"}`}>
                              {new Date(session.date_start).toLocaleDateString()}
                            </span>
                          </span>
                        </button>
                        <button
                          onClick={() => handleReplaySession(session)}
                          disabled={loading}
                          title="Replay session"
                          className={`px-2 py-2 rounded-r text-xs font-bold transition-colors ${
                            isReplaying
                              ? "text-white/90"
                              : "text-gray-500 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          &#9654;
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Race Status */}
            <div className="rounded-lg bg-f1-carbon p-4">
              <h2 className="mb-3 font-bold text-sm uppercase tracking-wider text-gray-400">Race Status</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-400">Lap</div>
                  <div className="text-2xl font-bold font-mono">
                    {state.currentLap || "—"}{state.totalLaps ? `/${state.totalLaps}` : ""}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Fastest Lap</div>
                  <div className="text-lg font-bold font-mono text-f1-purple">
                    {state.fastestLap
                      ? `${state.drivers[state.fastestLap.driverNumber]?.name_acronym || "?"} ${formatLapTime(state.fastestLap.time)}`
                      : "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* Weather */}
            <div>
              <h2 className="mb-2 font-bold text-sm uppercase tracking-wider text-gray-400">Weather</h2>
              <WeatherWidget weather={state.weather} />
            </div>
          </div>

          {/* Center column - Mini Leaderboard */}
          <div className="space-y-4">
            <div className="rounded-lg bg-f1-carbon p-4">
              <h2 className="mb-3 font-bold text-sm uppercase tracking-wider text-gray-400">Top 5</h2>
              <div className="space-y-2">
                {top5.length === 0 && <div className="text-gray-500 text-sm">No data</div>}
                {top5.map((pos) => {
                  const driver = state.drivers[pos.driver_number];
                  if (!driver) return null;
                  const teamColor = driver.team_colour ? `#${driver.team_colour}` : "#fff";
                  const interval = state.intervals[pos.driver_number];
                  const currentStint = state.stints[pos.driver_number]?.slice(-1)[0];
                  return (
                    <div key={pos.driver_number} className="flex items-center gap-2 rounded bg-f1-dark px-3 py-2">
                      <span className="w-6 text-center font-bold">{pos.position}</span>
                      <div className="h-6 w-1 rounded" style={{ backgroundColor: teamColor }} />
                      <span className="font-bold text-sm" style={{ color: teamColor }}>{driver.name_acronym}</span>
                      <span className="flex-1 text-right font-mono text-sm text-gray-400">
                        {pos.position === 1 ? "LEADER" : formatGap(interval?.gap_to_leader)}
                      </span>
                      {currentStint && <TireIcon compound={currentStint.compound} size="sm" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lighting Quick Controls */}
            <div className="rounded-lg bg-f1-carbon p-4">
              <h2 className="mb-3 font-bold text-sm uppercase tracking-wider text-gray-400">Lighting</h2>
              <p className="text-xs text-gray-500 mb-2">
                Auto-synced with race flags. Manual override:
              </p>
              <div className="flex gap-2 flex-wrap">
                {["GREEN", "YELLOW", "RED", "SAFETY_CAR", "CHEQUERED"].map(flag => (
                  <button
                    key={flag}
                    onClick={async () => {
                      // Will read config from localStorage in settings
                      const config = JSON.parse(localStorage.getItem("hueConfig") || "{}");
                      if (config.bridgeIp && config.username) {
                        await fetch("/api/lighting", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "setFlag", flag, ...config }),
                        });
                      }
                    }}
                    className="px-3 py-1 rounded text-xs font-bold bg-f1-gray hover:bg-gray-600 transition-colors"
                    style={{
                      color: flag === "GREEN" ? "#22c55e" : flag === "YELLOW" || flag === "SAFETY_CAR" ? "#eab308" : flag === "RED" ? "#e10600" : "#ffffff",
                    }}
                  >
                    {flag.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Race Control Feed */}
          <div>
            <h2 className="mb-2 font-bold text-sm uppercase tracking-wider text-gray-400">Race Control</h2>
            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
              <RaceControlFeed messages={state.raceControl} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
