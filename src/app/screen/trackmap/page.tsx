"use client";

import { useRaceData } from "@/hooks/use-race-data";
import { TrackMap } from "@/components/TrackMap";

export default function TrackMapScreen() {
  const { state } = useRaceData();

  return (
    <div className="flex-1 flex flex-col p-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-black tracking-tight">
          <span className="text-f1-red">TRACK</span> MAP
        </h1>
      </div>

      {/* Track visualization */}
      <div className="flex-1 rounded-lg bg-f1-carbon p-4">
        <TrackMap
          locations={state.locations}
          drivers={state.drivers}
        />
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-3">
        {state.positions.slice(0, 10).map(pos => {
          const driver = state.drivers[pos.driver_number];
          if (!driver) return null;
          const color = driver.team_colour ? `#${driver.team_colour}` : "#fff";
          return (
            <div key={pos.driver_number} className="flex items-center gap-1 text-xs">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              <span style={{ color }}>{driver.name_acronym}</span>
              <span className="text-gray-500">P{pos.position}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
