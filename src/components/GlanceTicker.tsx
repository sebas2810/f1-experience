"use client";

import type { RaceState } from "@/lib/openf1/types";
import { formatLapTime, formatGap } from "@/lib/utils";

export function GlanceTicker({ state }: { state: RaceState }) {
  const leader = state.positions[0];
  const leaderDriver = leader ? state.drivers[leader.driver_number] : null;
  const second = state.positions[1];
  const secondDriver = second ? state.drivers[second.driver_number] : null;
  const gap = second ? state.intervals[second.driver_number] : null;

  const items: string[] = [];

  // Flag status
  if (state.currentFlag && state.currentFlag !== "NONE" && state.currentFlag !== "GREEN") {
    items.push(`FLAG: ${state.currentFlag}`);
  }

  // Lap count
  if (state.currentLap > 0) {
    items.push(`LAP ${state.currentLap}${state.totalLaps ? `/${state.totalLaps}` : ""}`);
  }

  // Leader
  if (leaderDriver) {
    items.push(`P1 ${leaderDriver.name_acronym} #${leaderDriver.driver_number}`);
  }

  // Gap P1-P2
  if (secondDriver && gap) {
    items.push(`P2 ${secondDriver.name_acronym} ${formatGap(gap.gap_to_leader)}`);
  }

  // Fastest lap
  if (state.fastestLap) {
    const flDriver = state.drivers[state.fastestLap.driverNumber];
    if (flDriver) {
      items.push(`FASTEST LAP: ${flDriver.name_acronym} ${formatLapTime(state.fastestLap.time)}`);
    }
  }

  // Weather
  if (state.weather) {
    items.push(`TRACK ${state.weather.track_temperature.toFixed(0)}°C`);
    if (state.weather.rainfall > 0) items.push("RAIN");
  }

  const tickerText = items.join("  ///  ");

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      <div className="ticker-scroll whitespace-nowrap text-4xl font-bold tracking-wider text-green-400 leading-[100%] flex items-center h-full">
        {tickerText}
        <span className="mx-16">{"  ///  "}</span>
        {tickerText}
      </div>
    </div>
  );
}
