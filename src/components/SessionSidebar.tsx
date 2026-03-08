"use client";

import { useState, useEffect } from "react";
import type { Session, Meeting, RaceState } from "@/lib/openf1/types";

interface SessionSidebarProps {
  state: RaceState;
  onSelectSession: (session: Session) => Promise<void>;
}

export function SessionSidebar({ state, onSelectSession }: SessionSidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedMeetingKey, setSelectedMeetingKey] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      await onSelectSession(session);
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

  return (
    <div className="h-full flex flex-col bg-f1-carbon border-l border-gray-800 w-72">
      {/* Active Session Info */}
      <div className="p-3 border-b border-gray-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Active Session</h3>
        {state.session ? (
          <div>
            <div className="text-sm font-bold text-white">{state.meeting?.meeting_name ?? ""}</div>
            <div className="text-xs text-gray-300">{state.session.session_name}</div>
            <div className="text-xs text-gray-500 mt-1">
              {state.session.circuit_short_name} &middot; {state.session.country_name}
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500">No session selected</div>
        )}
      </div>

      {/* Replay Controls */}
      {state.replay?.active && (
        <div className="p-3 border-b border-gray-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-f1-red mb-2">Replay</h3>
          <div className="flex items-center gap-2 mb-2">
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
            <div className="flex items-center gap-1 ml-auto">
              {[1, 2, 5, 10, 20].map(s => (
                <button
                  key={s}
                  onClick={() => replayAction("speed", s)}
                  className={`px-1.5 py-0.5 rounded text-xs font-mono font-bold transition-colors ${
                    state.replay?.speed === s
                      ? "bg-f1-red text-white"
                      : "bg-f1-gray text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      )}

      {/* Session Selector */}
      <div className="p-3 border-b border-gray-800">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Select Session</h3>
        <div className="flex gap-1 mb-2">
          {[2023, 2024, 2025].map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-2 py-1 rounded text-xs font-bold ${
                selectedYear === year
                  ? "bg-f1-red text-white"
                  : "bg-f1-gray text-gray-300 hover:bg-gray-600"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Meetings List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-0.5">
          {(meetings ?? []).map(meeting => {
            const isSelected = selectedMeetingKey === meeting.meeting_key;
            const isActive = state.meetingKey === meeting.meeting_key;
            return (
              <div key={meeting.meeting_key}>
                <button
                  onClick={() => fetchSessions(meeting.meeting_key)}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                    isActive
                      ? "bg-f1-red/10 text-white font-semibold border-l-2 border-f1-red"
                      : isSelected
                        ? "bg-f1-gray text-white"
                        : "hover:bg-f1-gray text-gray-300"
                  }`}
                >
                  {meeting.meeting_name}
                  {isActive && <span className="ml-1 text-f1-red text-[10px]">(active)</span>}
                </button>
                {isSelected && (sessions ?? []).length > 0 && (
                  <div className="ml-2 mt-0.5 space-y-0.5 border-l border-gray-700 pl-2">
                    {sessions.map(session => {
                      const isSessionActive = state.sessionKey === session.session_key;
                      const isReplaying = isSessionActive && !!state.replay?.active;
                      return (
                        <div key={session.session_key} className={`flex items-center rounded text-xs transition-colors ${
                          isSessionActive
                            ? "bg-f1-red text-white font-bold"
                            : "hover:bg-f1-gray text-gray-400"
                        } ${loading ? "opacity-50" : ""}`}>
                          <button
                            onClick={() => handleSelectSession(session)}
                            disabled={loading}
                            className="flex-1 text-left px-2 py-1.5"
                          >
                            {isReplaying ? "▶ " : isSessionActive ? "▸ " : ""}{session.session_name}
                          </button>
                          <button
                            onClick={() => handleReplaySession(session)}
                            disabled={loading}
                            title="Replay session"
                            className={`px-1.5 py-1.5 text-[10px] transition-colors ${
                              isReplaying
                                ? "text-white/90"
                                : "text-gray-600 hover:text-white"
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
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-2">
          <div className="px-2 py-1.5 rounded bg-red-900/30 text-red-400 text-xs">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
