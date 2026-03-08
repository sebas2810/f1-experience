"use client";

import { useRaceData } from "@/hooks/use-race-data";
import { WeatherWidget } from "@/components/WeatherWidget";
import { RaceControlFeed } from "@/components/RaceControlFeed";
import { TireIcon } from "@/components/TireIcon";
import { formatLapTime, formatGap } from "@/lib/utils";

export default function DashboardScreen() {
  const { state } = useRaceData();

  const top5 = (state.positions ?? []).slice(0, 5);

  return (
    <div className="p-4 mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column - Race status & Weather */}
        <div className="space-y-4">
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
        </div>

        {/* Right column - Race Control Feed */}
        <div>
          <h2 className="mb-2 font-bold text-sm uppercase tracking-wider text-gray-400">Race Control</h2>
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
            <RaceControlFeed messages={state.raceControl} />
          </div>
        </div>
      </div>
    </div>
  );
}
