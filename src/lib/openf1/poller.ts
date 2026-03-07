import { openf1 } from "./client";
import { raceStore } from "@/lib/state/race-store";

let pollingInterval: ReturnType<typeof setInterval> | null = null;
let currentSessionKey: number | null = null;

async function pollFast(sessionKey: number) {
  try {
    const [positions, intervals, laps, raceControl, carData, locations] = await Promise.allSettled([
      openf1.positions({ session_key: sessionKey }),
      openf1.intervals({ session_key: sessionKey }),
      openf1.laps({ session_key: sessionKey }),
      openf1.raceControl({ session_key: sessionKey }),
      openf1.carData({ session_key: sessionKey, speed: ">0" }),
      openf1.location({ session_key: sessionKey }),
    ]);

    if (positions.status === "fulfilled") raceStore.updatePositions(positions.value);
    if (intervals.status === "fulfilled") raceStore.updateIntervals(intervals.value);
    if (laps.status === "fulfilled") raceStore.updateLaps(laps.value);
    if (raceControl.status === "fulfilled") raceStore.updateRaceControl(raceControl.value);
    if (carData.status === "fulfilled") raceStore.updateCarData(carData.value);
    if (locations.status === "fulfilled") raceStore.updateLocations(locations.value);
  } catch (err) {
    console.error("[Poller] Fast poll error:", err);
  }
}

async function pollSlow(sessionKey: number) {
  try {
    const [stints, pit, weather] = await Promise.allSettled([
      openf1.stints({ session_key: sessionKey }),
      openf1.pit({ session_key: sessionKey }),
      openf1.weather({ session_key: sessionKey }),
    ]);

    if (stints.status === "fulfilled") raceStore.updateStints(stints.value);
    if (pit.status === "fulfilled") raceStore.updatePitStops(pit.value);
    if (weather.status === "fulfilled") raceStore.updateWeather(weather.value);
  } catch (err) {
    console.error("[Poller] Slow poll error:", err);
  }
}

async function loadSessionData(sessionKey: number, meetingKey: number) {
  try {
    const [drivers, sessions, meetings] = await Promise.allSettled([
      openf1.drivers({ session_key: sessionKey }),
      openf1.sessions({ session_key: sessionKey }),
      openf1.meetings({ meeting_key: meetingKey }),
    ]);

    if (drivers.status === "fulfilled") raceStore.updateDrivers(drivers.value);

    // Do initial full data load
    await pollFast(sessionKey);
    await pollSlow(sessionKey);
  } catch (err) {
    console.error("[Poller] Session load error:", err);
  }
}

export async function startPolling(sessionKey: number, meetingKey: number) {
  // Stop existing polling
  stopPolling();

  currentSessionKey = sessionKey;
  raceStore.setSession(sessionKey, meetingKey);

  // Load initial data
  await loadSessionData(sessionKey, meetingKey);

  // Set up polling intervals
  let fastTick = 0;
  pollingInterval = setInterval(async () => {
    if (currentSessionKey !== sessionKey) return;

    await pollFast(sessionKey);

    // Slow poll every 3rd tick (15 seconds)
    fastTick++;
    if (fastTick % 3 === 0) {
      await pollSlow(sessionKey);
    }
  }, 5000);
}

export function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  currentSessionKey = null;
}

export function isPolling(): boolean {
  return pollingInterval !== null;
}
