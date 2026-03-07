"use client";

import type { Driver, Interval, Lap, Stint, PitStop } from "@/lib/openf1/types";
import { TireIcon } from "./TireIcon";
import { formatLapTime, formatGap } from "@/lib/utils";

interface DriverRowProps {
  position: number;
  driver: Driver;
  interval: Interval | undefined;
  lastLap: Lap | undefined;
  bestLap: Lap | undefined;
  stints: Stint[] | undefined;
  pitStops: PitStop[] | undefined;
  isFastestLap: boolean;
  previousPosition?: number;
}

export function DriverRow({
  position,
  driver,
  interval,
  lastLap,
  bestLap,
  stints,
  pitStops,
  isFastestLap,
  previousPosition,
}: DriverRowProps) {
  const teamColor = driver.team_colour ? `#${driver.team_colour}` : "#ffffff";
  const currentStint = stints?.[stints.length - 1];
  const tireAge = currentStint
    ? (lastLap?.lap_number || 0) - currentStint.lap_start + (currentStint.tyre_age_at_start || 0)
    : undefined;

  const posChange = previousPosition != null ? previousPosition - position : 0;

  return (
    <div className="driver-row flex items-center gap-2 rounded-lg bg-f1-carbon px-3 py-2 hover:bg-f1-gray transition-colors">
      {/* Position */}
      <div className="w-8 text-center text-lg font-bold">{position}</div>

      {/* Position change indicator */}
      <div className="w-6 text-center text-xs">
        {posChange > 0 && <span className="text-green-400">+{posChange}</span>}
        {posChange < 0 && <span className="text-red-400">{posChange}</span>}
      </div>

      {/* Team color bar */}
      <div className="h-8 w-1 rounded-full" style={{ backgroundColor: teamColor }} />

      {/* Driver number */}
      <div
        className="w-8 text-center font-bold text-sm"
        style={{ color: teamColor }}
      >
        {driver.driver_number}
      </div>

      {/* Driver name */}
      <div className="w-16 font-bold text-sm tracking-wide">
        {driver.name_acronym || driver.last_name?.slice(0, 3).toUpperCase()}
      </div>

      {/* Interval / Gap */}
      <div className="w-24 text-right font-mono text-sm">
        {position === 1
          ? <span className="text-gray-400">LEADER</span>
          : formatGap(interval?.gap_to_leader)}
      </div>

      {/* Last lap */}
      <div className={`w-24 text-right font-mono text-sm ${isFastestLap ? "text-f1-purple font-bold" : ""}`}>
        {formatLapTime(lastLap?.lap_duration)}
      </div>

      {/* Best lap */}
      <div className="w-24 text-right font-mono text-sm text-gray-400">
        {formatLapTime(bestLap?.lap_duration)}
      </div>

      {/* Tire */}
      <div className="w-20">
        {currentStint && (
          <TireIcon compound={currentStint.compound} age={tireAge} size="sm" />
        )}
      </div>

      {/* Pit stops */}
      <div className="w-8 text-center text-sm text-gray-400">
        {pitStops?.length || 0}
      </div>
    </div>
  );
}
