"use client";

import { useState } from "react";
import type { Driver, Interval, Lap, Stint, PitStop, CarData } from "@/lib/openf1/types";
import { TireIcon } from "./TireIcon";
import { SectorTime } from "./SectorTime";
import { formatLapTime, formatGap, formatSpeed, getSectorColor } from "@/lib/utils";

interface DriverCardProps {
  position: number;
  driver: Driver;
  interval: Interval | undefined;
  lastLap: Lap | undefined;
  bestLap: Lap | undefined;
  stints: Stint[] | undefined;
  pitStops: PitStop[] | undefined;
  carData: CarData | undefined;
  isFastestLap: boolean;
  gridPosition?: number;
  overallBestSectors: { s1: number | null; s2: number | null; s3: number | null };
  personalBestSectors: { s1: number | null; s2: number | null; s3: number | null };
}

export function DriverCard({
  position,
  driver,
  interval,
  lastLap,
  bestLap,
  stints,
  pitStops,
  carData,
  isFastestLap,
  gridPosition,
  overallBestSectors,
  personalBestSectors,
}: DriverCardProps) {
  const [expanded, setExpanded] = useState(false);
  const teamColor = driver.team_colour ? `#${driver.team_colour}` : "#ffffff";
  const currentStint = stints?.[stints.length - 1];
  const tireAge = currentStint
    ? (lastLap?.lap_number || 0) - currentStint.lap_start + (currentStint.tyre_age_at_start || 0)
    : undefined;

  const posChange = gridPosition != null ? gridPosition - position : 0;

  const totalPitTime = pitStops?.reduce((sum, p) => sum + (p.pit_duration || 0), 0) || 0;

  return (
    <div
      className="flex flex-col rounded-lg bg-f1-carbon overflow-hidden cursor-pointer transition-all hover:ring-1 hover:ring-gray-600"
      style={{ borderTop: `3px solid ${teamColor}` }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="text-2xl font-black w-8">{position}</div>
        <div className="h-8 w-1 rounded-full" style={{ backgroundColor: teamColor }} />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm" style={{ color: teamColor }}>
            {driver.driver_number} {driver.name_acronym}
          </div>
          <div className="text-xs text-gray-400 truncate">{driver.team_name}</div>
        </div>
        {posChange !== 0 && (
          <div className={`text-xs font-bold ${posChange > 0 ? "text-green-400" : "text-red-400"}`}>
            {posChange > 0 ? `+${posChange}` : posChange}
          </div>
        )}
      </div>

      {/* Gap */}
      <div className="px-3 pb-1">
        <span className="text-xs text-gray-400">Gap: </span>
        <span className="font-mono text-sm">
          {position === 1 ? "LEADER" : formatGap(interval?.gap_to_leader)}
        </span>
      </div>

      {/* Lap times */}
      <div className="grid grid-cols-2 gap-x-3 px-3 pb-2 text-xs">
        <div>
          <span className="text-gray-400">Last: </span>
          <span className={`font-mono ${isFastestLap ? "text-f1-purple font-bold" : ""}`}>
            {formatLapTime(lastLap?.lap_duration)}
          </span>
        </div>
        <div>
          <span className="text-gray-400">Best: </span>
          <span className="font-mono">{formatLapTime(bestLap?.lap_duration)}</span>
        </div>
      </div>

      {/* Sectors */}
      <div className="flex gap-1 px-3 pb-2">
        <SectorTime
          time={lastLap?.duration_sector_1 ?? null}
          color={getSectorColor(lastLap?.duration_sector_1 ?? null, personalBestSectors.s1, overallBestSectors.s1)}
        />
        <SectorTime
          time={lastLap?.duration_sector_2 ?? null}
          color={getSectorColor(lastLap?.duration_sector_2 ?? null, personalBestSectors.s2, overallBestSectors.s2)}
        />
        <SectorTime
          time={lastLap?.duration_sector_3 ?? null}
          color={getSectorColor(lastLap?.duration_sector_3 ?? null, personalBestSectors.s3, overallBestSectors.s3)}
        />
      </div>

      {/* Tire strategy timeline */}
      <div className="flex items-center gap-1 px-3 pb-2">
        {stints?.map((stint) => (
          <TireIcon
            key={stint.stint_number}
            compound={stint.compound}
            age={stint.lap_end ? stint.lap_end - stint.lap_start : tireAge}
            size="sm"
          />
        ))}
        {(!stints || stints.length === 0) && (
          <span className="text-xs text-gray-500">No tire data</span>
        )}
      </div>

      {/* Pit + Speed */}
      <div className="grid grid-cols-2 gap-x-3 px-3 pb-2 text-xs">
        <div>
          <span className="text-gray-400">Pits: </span>
          <span className="font-mono">{pitStops?.length || 0}</span>
          {totalPitTime > 0 && (
            <span className="text-gray-500 ml-1">({totalPitTime.toFixed(1)}s)</span>
          )}
        </div>
        <div>
          <span className="text-gray-400">Speed: </span>
          <span className="font-mono">{formatSpeed(carData?.speed)}</span>
        </div>
      </div>

      {/* DRS indicator */}
      {carData && (
        <div className="px-3 pb-2">
          <span className={`text-xs px-2 py-0.5 rounded ${carData.drs >= 10 ? "bg-green-900/50 text-green-400" : "bg-gray-800 text-gray-500"}`}>
            DRS {carData.drs >= 10 ? "OPEN" : "OFF"}
          </span>
        </div>
      )}

      {/* Expanded telemetry */}
      {expanded && carData && (
        <div className="border-t border-gray-700 px-3 py-2 grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-gray-400">Throttle</span>
            <div className="mt-1 h-2 rounded bg-gray-700">
              <div
                className="h-full rounded bg-green-500"
                style={{ width: `${carData.throttle}%` }}
              />
            </div>
          </div>
          <div>
            <span className="text-gray-400">Brake</span>
            <div className="mt-1 h-2 rounded bg-gray-700">
              <div
                className="h-full rounded bg-red-500"
                style={{ width: `${carData.brake}%` }}
              />
            </div>
          </div>
          <div>
            <span className="text-gray-400">Gear</span>
            <div className="text-lg font-bold mt-0.5">{carData.gear}</div>
          </div>
          <div>
            <span className="text-gray-400">RPM</span>
            <div className="font-mono">{carData.rpm?.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-gray-400">Speed</span>
            <div className="font-mono">{carData.speed} km/h</div>
          </div>
        </div>
      )}
    </div>
  );
}
