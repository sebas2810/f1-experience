"use client";

import { useState, useMemo } from "react";
import { useRaceData } from "@/hooks/use-race-data";
import { TireIcon } from "@/components/TireIcon";
import { FlagIndicator } from "@/components/FlagIndicator";
import SessionBanner from "@/components/SessionBanner";
import { formatLapTime, formatGap, formatSpeed } from "@/lib/utils";

export default function CompareScreen() {
  const { state, connected } = useRaceData();
  const [driver1, setDriver1] = useState<number | null>(null);
  const [driver2, setDriver2] = useState<number | null>(null);

  const driverList = useMemo(
    () => state.positions.map(p => ({ number: p.driver_number, driver: state.drivers[p.driver_number] })).filter(d => d.driver),
    [state.positions, state.drivers]
  );

  // Auto-select top 2 if nothing selected
  if (!driver1 && driverList.length >= 2) {
    setDriver1(driverList[0].number);
    setDriver2(driverList[1].number);
  }

  function ComparisonColumn({ driverNumber }: { driverNumber: number | null }) {
    if (!driverNumber) return <div className="flex-1 text-gray-500 text-center py-10">Select a driver</div>;

    const driver = state.drivers[driverNumber];
    if (!driver) return null;

    const teamColor = driver.team_colour ? `#${driver.team_colour}` : "#fff";
    const pos = state.positions.find(p => p.driver_number === driverNumber);
    const interval = state.intervals[driverNumber];
    const lastLap = state.laps[driverNumber];
    const bestLap = state.bestLaps[driverNumber];
    const stints = state.stints[driverNumber] || [];
    const pitStops = state.pitStops[driverNumber] || [];
    const carData = state.carData[driverNumber];
    const allLaps = state.allLaps[driverNumber] || [];

    return (
      <div className="flex-1">
        {/* Driver header */}
        <div className="rounded-lg bg-f1-carbon p-4 mb-3" style={{ borderTop: `3px solid ${teamColor}` }}>
          <div className="text-3xl font-black" style={{ color: teamColor }}>
            {driver.name_acronym}
          </div>
          <div className="text-sm text-gray-400">{driver.full_name}</div>
          <div className="text-xs text-gray-500">{driver.team_name} / #{driver.driver_number}</div>
          <div className="mt-2 text-2xl font-bold">P{pos?.position || "—"}</div>
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <StatRow label="Gap to Leader" value={pos?.position === 1 ? "LEADER" : formatGap(interval?.gap_to_leader)} />
          <StatRow label="Last Lap" value={formatLapTime(lastLap?.lap_duration)} highlight={state.fastestLap?.driverNumber === driverNumber} />
          <StatRow label="Best Lap" value={formatLapTime(bestLap?.lap_duration)} />
          <StatRow label="Sector 1" value={formatLapTime(lastLap?.duration_sector_1)} />
          <StatRow label="Sector 2" value={formatLapTime(lastLap?.duration_sector_2)} />
          <StatRow label="Sector 3" value={formatLapTime(lastLap?.duration_sector_3)} />
          <StatRow label="Speed" value={formatSpeed(carData?.speed)} />
          <StatRow label="Pit Stops" value={String(pitStops.length)} />

          {/* Tire strategy */}
          <div className="rounded bg-f1-carbon p-3">
            <div className="text-xs text-gray-400 mb-2">Tire Strategy</div>
            <div className="flex flex-wrap gap-2">
              {stints.map(stint => (
                <div key={stint.stint_number} className="flex items-center gap-1">
                  <TireIcon compound={stint.compound} size="sm" />
                  <span className="text-xs text-gray-400">
                    L{stint.lap_start}-{stint.lap_end || "now"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lap time progression */}
          <div className="rounded bg-f1-carbon p-3">
            <div className="text-xs text-gray-400 mb-2">Lap Times (last 10)</div>
            <div className="space-y-0.5">
              {allLaps.slice(-10).map(lap => (
                <div key={lap.lap_number} className="flex justify-between text-xs font-mono">
                  <span className="text-gray-500">L{lap.lap_number}</span>
                  <span className={lap.is_pit_out_lap ? "text-gray-600" : ""}>
                    {formatLapTime(lap.lap_duration)}
                    {lap.is_pit_out_lap && " (PIT)"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-f1-dark">
      <SessionBanner session={state.session} meeting={state.meeting} />
      <div className="p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black tracking-tight">
            <span className="text-f1-red">DRIVER</span> COMPARISON
          </h1>
          <FlagIndicator flag={state.currentFlag} size="sm" />
        </div>
        <div className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
      </div>

      {/* Driver selectors */}
      <div className="mb-4 flex gap-4">
        <select
          value={driver1 || ""}
          onChange={(e) => setDriver1(Number(e.target.value))}
          className="flex-1 rounded bg-f1-carbon px-3 py-2 text-sm text-white border border-gray-700"
        >
          <option value="">Select Driver 1</option>
          {driverList.map(d => (
            <option key={d.number} value={d.number}>
              P{state.positions.find(p => p.driver_number === d.number)?.position} — {d.driver?.name_acronym} ({d.driver?.team_name})
            </option>
          ))}
        </select>
        <button
          onClick={() => { const t = driver1; setDriver1(driver2); setDriver2(t); }}
          className="px-3 py-2 rounded bg-f1-gray hover:bg-gray-600 text-sm"
        >
          Swap
        </button>
        <select
          value={driver2 || ""}
          onChange={(e) => setDriver2(Number(e.target.value))}
          className="flex-1 rounded bg-f1-carbon px-3 py-2 text-sm text-white border border-gray-700"
        >
          <option value="">Select Driver 2</option>
          {driverList.map(d => (
            <option key={d.number} value={d.number}>
              P{state.positions.find(p => p.driver_number === d.number)?.position} — {d.driver?.name_acronym} ({d.driver?.team_name})
            </option>
          ))}
        </select>
      </div>

      {/* Comparison columns */}
      <div className="flex gap-4">
        <ComparisonColumn driverNumber={driver1} />
        <div className="w-px bg-gray-700" />
        <ComparisonColumn driverNumber={driver2} />
      </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between rounded bg-f1-carbon px-3 py-2">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`font-mono text-sm ${highlight ? "text-f1-purple font-bold" : ""}`}>{value}</span>
    </div>
  );
}
