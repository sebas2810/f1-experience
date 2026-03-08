"use client";

import { useRaceData } from "@/hooks/use-race-data";
import { DriverRow } from "@/components/DriverRow";
import { formatLapTime } from "@/lib/utils";

export default function LeaderboardScreen() {
  const { state } = useRaceData();

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight">
          <span className="text-f1-red">LIVE</span> LEADERBOARD
        </h1>
        <div className="flex items-center gap-4 text-sm">
          {state.fastestLap && (
            <span className="text-f1-purple font-mono">
              FL: {state.drivers[state.fastestLap.driverNumber]?.name_acronym}{" "}
              {formatLapTime(state.fastestLap.time)}
            </span>
          )}
        </div>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500 uppercase tracking-wider">
        <div className="w-8 text-center">Pos</div>
        <div className="w-6" />
        <div className="w-1" />
        <div className="w-8 text-center">No</div>
        <div className="w-16">Driver</div>
        <div className="w-24 text-right">Gap</div>
        <div className="w-24 text-right">Last</div>
        <div className="w-24 text-right">Best</div>
        <div className="w-20">Tire</div>
        <div className="w-8 text-center">Pit</div>
      </div>

      {/* Driver rows */}
      <div className="flex flex-col gap-1">
        {state.positions.length === 0 && (
          <div className="text-center text-gray-500 py-20 text-lg">
            No session data. Select a session from the Dashboard or Settings.
          </div>
        )}
        {state.positions.map((pos) => {
          const driver = state.drivers[pos.driver_number];
          if (!driver) return null;
          return (
            <DriverRow
              key={pos.driver_number}
              position={pos.position}
              driver={driver}
              interval={state.intervals[pos.driver_number]}
              lastLap={state.laps[pos.driver_number]}
              bestLap={state.bestLaps[pos.driver_number]}
              stints={state.stints[pos.driver_number]}
              pitStops={state.pitStops[pos.driver_number]}
              isFastestLap={state.fastestLap?.driverNumber === pos.driver_number}
            />
          );
        })}
      </div>
    </div>
  );
}
