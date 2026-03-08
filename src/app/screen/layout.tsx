"use client";

import { useState, useCallback } from "react";
import { useRaceData } from "@/hooks/use-race-data";
import { ScreenNav } from "@/components/ScreenNav";
import { SessionSidebar } from "@/components/SessionSidebar";
import SessionBanner from "@/components/SessionBanner";
import { FlagIndicator } from "@/components/FlagIndicator";
import type { Session } from "@/lib/openf1/types";

export default function ScreenLayout({ children }: { children: React.ReactNode }) {
  const { state, connected, selectSession } = useRaceData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSelectSession = useCallback(async (session: Session) => {
    const ok = await selectSession(session.session_key, session.meeting_key);
    if (!ok) throw new Error("Failed to load session");
  }, [selectSession]);

  return (
    <div className="min-h-screen flex flex-col bg-f1-dark">
      {/* Top Nav */}
      <ScreenNav
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        sidebarOpen={sidebarOpen}
      />

      {/* Session Banner */}
      <SessionBanner session={state.session} meeting={state.meeting} />

      {/* Replay bar (compact, only when replaying) */}
      {state.replay?.active && (
        <div className="bg-f1-dark border-b border-gray-800 px-4 py-1 flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-f1-red">REPLAY</span>
          <span className="text-xs text-gray-400 font-mono">
            {state.replay?.currentTime
              ? new Date(state.replay.currentTime).toLocaleTimeString()
              : "--:--:--"}
          </span>
          <div className="flex-1 h-1 bg-f1-gray rounded-full overflow-hidden max-w-xs">
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
          <span className={`text-xs font-mono font-bold ${state.replay?.playing ? "text-green-400" : "text-yellow-400"}`}>
            {state.replay?.playing ? "PLAYING" : "PAUSED"} {state.replay?.speed}x
          </span>
        </div>
      )}

      {/* Main content + sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Right sidebar */}
        {sidebarOpen && (
          <aside className="shrink-0 overflow-hidden">
            <SessionSidebar
              state={state}
              onSelectSession={handleSelectSession}
            />
          </aside>
        )}
      </div>

      {/* Status bar */}
      <div className="bg-f1-carbon border-t border-gray-800 px-4 py-1 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-3">
          <FlagIndicator flag={state.currentFlag} size="sm" />
          {state.currentLap > 0 && (
            <span className="text-gray-400 font-mono">
              LAP {state.currentLap}{state.totalLaps ? `/${state.totalLaps}` : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
          <span className="text-gray-500">{connected ? "CONNECTED" : "DISCONNECTED"}</span>
        </div>
      </div>
    </div>
  );
}
