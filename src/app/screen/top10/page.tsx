"use client";

import { useMemo } from "react";
import { useRaceData } from "@/hooks/use-race-data";
import { DriverCard } from "@/components/DriverCard";
import { FlagIndicator } from "@/components/FlagIndicator";
import { formatLapTime } from "@/lib/utils";

export default function Top10Screen() {
  const { state, connected } = useRaceData();

  const top10 = state.positions.slice(0, 10);

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
    <div className="min-h-screen bg-f1-dark p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black tracking-tight">
            <span className="text-f1-red">TOP 10</span> DRIVERS
          </h1>
          <FlagIndicator flag={state.currentFlag} size="sm" />
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="font-mono">
            LAP {state.currentLap || "—"}{state.totalLaps ? `/${state.totalLaps}` : ""}
          </span>
          {state.fastestLap && (
            <span className="text-f1-purple font-mono">
              FL: {state.drivers[state.fastestLap.driverNumber]?.name_acronym}{" "}
              {formatLapTime(state.fastestLap.time)}
            </span>
          )}
          <div className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
        </div>
      </div>

      {/* 2x5 Grid of driver cards */}
      {top10.length === 0 ? (
        <div className="text-center text-gray-500 py-20 text-lg">
          No session data. Select a session from the Dashboard.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {top10.map((pos) => {
            const driver = state.drivers[pos.driver_number];
            if (!driver) return null;
            const pb = personalBests[pos.driver_number] || { s1: null, s2: null, s3: null };
            return (
              <DriverCard
                key={pos.driver_number}
                position={pos.position}
                driver={driver}
                interval={state.intervals[pos.driver_number]}
                lastLap={state.laps[pos.driver_number]}
                bestLap={state.bestLaps[pos.driver_number]}
                stints={state.stints[pos.driver_number]}
                pitStops={state.pitStops[pos.driver_number]}
                carData={state.carData[pos.driver_number]}
                isFastestLap={state.fastestLap?.driverNumber === pos.driver_number}
                overallBestSectors={overallBestSectors}
                personalBestSectors={pb}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
