"use client";

import { useRaceData } from "@/hooks/use-race-data";
import { SectorTime } from "@/components/SectorTime";
import { TireIcon } from "@/components/TireIcon";
import { formatLapTime, getSectorColor } from "@/lib/utils";
import { useMemo } from "react";

export default function TimingTowerScreen() {
  const { state } = useRaceData();

  // Calculate overall best sectors
  const overallBestSectors = useMemo(() => {
    let s1 = Infinity, s2 = Infinity, s3 = Infinity;
    for (const laps of Object.values(state.allLaps)) {
      for (const lap of laps) {
        if (lap.duration_sector_1 && lap.duration_sector_1 < s1) s1 = lap.duration_sector_1;
        if (lap.duration_sector_2 && lap.duration_sector_2 < s2) s2 = lap.duration_sector_2;
        if (lap.duration_sector_3 && lap.duration_sector_3 < s3) s3 = lap.duration_sector_3;
      }
    }
    return {
      s1: s1 === Infinity ? null : s1,
      s2: s2 === Infinity ? null : s2,
      s3: s3 === Infinity ? null : s3,
    };
  }, [state.allLaps]);

  // Personal best sectors per driver
  const personalBests = useMemo(() => {
    const bests: Record<number, { s1: number | null; s2: number | null; s3: number | null }> = {};
    for (const [dn, laps] of Object.entries(state.allLaps)) {
      let s1 = Infinity, s2 = Infinity, s3 = Infinity;
      for (const lap of laps) {
        if (lap.duration_sector_1 && lap.duration_sector_1 < s1) s1 = lap.duration_sector_1;
        if (lap.duration_sector_2 && lap.duration_sector_2 < s2) s2 = lap.duration_sector_2;
        if (lap.duration_sector_3 && lap.duration_sector_3 < s3) s3 = lap.duration_sector_3;
      }
      bests[Number(dn)] = {
        s1: s1 === Infinity ? null : s1,
        s2: s2 === Infinity ? null : s2,
        s3: s3 === Infinity ? null : s3,
      };
    }
    return bests;
  }, [state.allLaps]);

  return (
    <div className="p-3">
      {/* Header - compact for portrait */}
      <div className="mb-3">
        <h1 className="text-lg font-black">TIMING TOWER</h1>
      </div>

      {/* Timing tower */}
      <div className="flex flex-col gap-0.5">
        {state.positions.length === 0 && (
          <div className="text-center text-gray-500 py-10">No session data</div>
        )}
        {state.positions.map((pos) => {
          const driver = state.drivers[pos.driver_number];
          if (!driver) return null;
          const teamColor = driver.team_colour ? `#${driver.team_colour}` : "#ffffff";
          const lastLap = state.laps[pos.driver_number];
          const currentStint = state.stints[pos.driver_number]?.slice(-1)[0];
          const pb = personalBests[pos.driver_number] || { s1: null, s2: null, s3: null };
          const isFastest = state.fastestLap?.driverNumber === pos.driver_number;

          return (
            <div
              key={pos.driver_number}
              className="driver-row flex items-center gap-1 rounded bg-f1-carbon px-2 py-1.5"
            >
              {/* Position */}
              <div className="w-6 text-center text-sm font-bold">{pos.position}</div>

              {/* Team color */}
              <div className="h-6 w-0.5 rounded-full" style={{ backgroundColor: teamColor }} />

              {/* Driver */}
              <div className="w-12 text-xs font-bold" style={{ color: teamColor }}>
                {driver.name_acronym}
              </div>

              {/* Tire */}
              <div className="w-6">
                {currentStint && <TireIcon compound={currentStint.compound} size="sm" />}
              </div>

              {/* Sectors */}
              <div className="flex gap-0.5">
                <SectorTime
                  time={lastLap?.duration_sector_1 ?? null}
                  color={getSectorColor(lastLap?.duration_sector_1 ?? null, pb.s1, overallBestSectors.s1)}
                />
                <SectorTime
                  time={lastLap?.duration_sector_2 ?? null}
                  color={getSectorColor(lastLap?.duration_sector_2 ?? null, pb.s2, overallBestSectors.s2)}
                />
                <SectorTime
                  time={lastLap?.duration_sector_3 ?? null}
                  color={getSectorColor(lastLap?.duration_sector_3 ?? null, pb.s3, overallBestSectors.s3)}
                />
              </div>

              {/* Last lap */}
              <div className={`ml-auto w-20 text-right font-mono text-xs ${isFastest ? "text-f1-purple font-bold" : ""}`}>
                {formatLapTime(lastLap?.lap_duration)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
