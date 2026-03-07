import { openf1 } from "./client";
import { raceStore } from "@/lib/state/race-store";

let pollingInterval: ReturnType<typeof setInterval> | null = null;
let currentSessionKey: number | null = null;

async function pollFast(sessionKey: number) {
  try {
    // Only fetch latest data, not the entire session history
    const [positions, intervals, raceControl] = await Promise.allSettled([
      openf1.positions({ session_key: sessionKey }),
      openf1.intervals({ session_key: sessionKey }),
      openf1.raceControl({ session_key: sessionKey }),
    ]);

    if (positions.status === "fulfilled") raceStore.updatePositions(positions.value);
    if (intervals.status === "fulfilled") raceStore.updateIntervals(intervals.value);
    if (raceControl.status === "fulfilled") raceStore.updateRaceControl(raceControl.value);
  } catch (err) {
    console.error("[Poller] Fast poll error:", err);
  }
}

async function pollMedium(sessionKey: number) {
  try {
    const [laps, stints, pit] = await Promise.allSettled([
      openf1.laps({ session_key: sessionKey }),
      openf1.stints({ session_key: sessionKey }),
      openf1.pit({ session_key: sessionKey }),
    ]);

    if (laps.status === "fulfilled") raceStore.updateLaps(laps.value);
    if (stints.status === "fulfilled") raceStore.updateStints(stints.value);
    if (pit.status === "fulfilled") raceStore.updatePitStops(pit.value);
  } catch (err) {
    console.error("[Poller] Medium poll error:", err);
  }
}

async function pollSlow(sessionKey: number) {
  try {
    const [weather] = await Promise.allSettled([
      openf1.weather({ session_key: sessionKey }),
    ]);

    if (weather.status === "fulfilled") raceStore.updateWeather(weather.value);
  } catch (err) {
    console.error("[Poller] Slow poll error:", err);
  }
}

async function loadSessionData(sessionKey: number, meetingKey: number) {
  console.log(`[Poller] Loading session ${sessionKey} for meeting ${meetingKey}`);

  try {
    // Step 1: Load metadata (fast, small responses)
    const [drivers, sessions, meetings] = await Promise.allSettled([
      openf1.drivers({ session_key: sessionKey }),
      openf1.sessions({ session_key: sessionKey }),
      openf1.meetings({ meeting_key: meetingKey }),
    ]);

    if (drivers.status === "fulfilled") {
      console.log(`[Poller] Loaded ${drivers.value.length} drivers`);
      raceStore.updateDrivers(drivers.value);
    }
    if (sessions.status === "fulfilled" && sessions.value.length > 0) {
      raceStore.updateSession(sessions.value[0]);
    }
    if (meetings.status === "fulfilled" && meetings.value.length > 0) {
      raceStore.updateMeeting(meetings.value[0]);
    }

    // Step 2: Load core race data
    const [positions, intervals, raceControl] = await Promise.allSettled([
      openf1.positions({ session_key: sessionKey }),
      openf1.intervals({ session_key: sessionKey }),
      openf1.raceControl({ session_key: sessionKey }),
    ]);

    if (positions.status === "fulfilled") {
      console.log(`[Poller] Loaded ${positions.value.length} position records`);
      raceStore.updatePositions(positions.value);
    }
    if (intervals.status === "fulfilled") raceStore.updateIntervals(intervals.value);
    if (raceControl.status === "fulfilled") raceStore.updateRaceControl(raceControl.value);

    // Step 3: Load timing data
    const [laps, stints, pit, weather] = await Promise.allSettled([
      openf1.laps({ session_key: sessionKey }),
      openf1.stints({ session_key: sessionKey }),
      openf1.pit({ session_key: sessionKey }),
      openf1.weather({ session_key: sessionKey }),
    ]);

    if (laps.status === "fulfilled") {
      console.log(`[Poller] Loaded ${laps.value.length} laps`);
      raceStore.updateLaps(laps.value);
    }
    if (stints.status === "fulfilled") raceStore.updateStints(stints.value);
    if (pit.status === "fulfilled") raceStore.updatePitStops(pit.value);
    if (weather.status === "fulfilled") raceStore.updateWeather(weather.value);

    console.log("[Poller] Session data loaded successfully");
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
  let tick = 0;
  pollingInterval = setInterval(async () => {
    if (currentSessionKey !== sessionKey) return;

    await pollFast(sessionKey);

    // Medium poll every 3rd tick (15 seconds)
    tick++;
    if (tick % 3 === 0) {
      await pollMedium(sessionKey);
    }
    // Slow poll every 6th tick (30 seconds)
    if (tick % 6 === 0) {
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
