import { NextResponse } from "next/server";
import { raceStore } from "@/lib/state/race-store";
import { DEMO_STATE } from "@/lib/demo-data";

export async function POST() {
  // Load demo data into the race store
  raceStore.setSession(9999, 1999);
  raceStore.updateDrivers(Object.values(DEMO_STATE.drivers));
  raceStore.updatePositions(DEMO_STATE.positions);
  raceStore.updateIntervals(Object.values(DEMO_STATE.intervals));
  raceStore.updateLaps(Object.values(DEMO_STATE.laps));
  // Load all laps
  for (const laps of Object.values(DEMO_STATE.allLaps)) {
    raceStore.updateLaps(laps);
  }
  raceStore.updateStints(
    Object.values(DEMO_STATE.stints).flat()
  );
  raceStore.updatePitStops(
    Object.values(DEMO_STATE.pitStops).flat()
  );
  raceStore.updateRaceControl(DEMO_STATE.raceControl);
  raceStore.updateWeather([DEMO_STATE.weather!]);
  raceStore.updateCarData(Object.values(DEMO_STATE.carData));
  raceStore.updateLocations(Object.values(DEMO_STATE.locations));

  return NextResponse.json({ ok: true, message: "Demo data loaded - Leclerc leading at Monaco, Lap 42/53" });
}
