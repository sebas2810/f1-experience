import { openf1 } from "./client";
import { stopPolling } from "./poller";
import { raceStore } from "@/lib/state/race-store";
import type {
  Position, Interval, Lap, PitStop,
  RaceControlMessage, Weather, Stint,
} from "./types";

interface TimelineEvent {
  time: number; // unix ms
  type: "position" | "interval" | "lap" | "pit" | "raceControl" | "weather" | "stint";
  data: Position | Interval | Lap | PitStop | RaceControlMessage | Weather | Stint;
}

let replayTimer: ReturnType<typeof setInterval> | null = null;
let timeline: TimelineEvent[] = [];
let timelineIndex = 0;
let replaySpeed = 1;
let replayPlaying = false;
let replayStartTime = "";
let replayEndTime = "";
let currentReplayTime = "";

function getEventTime(type: TimelineEvent["type"], data: TimelineEvent["data"]): string | null {
  if (type === "lap") return (data as Lap).date_start ?? null;
  if (type === "stint") return null; // stints have no timestamp, added at lap boundaries
  return (data as { date: string }).date;
}

export async function startReplay(sessionKey: number, meetingKey: number) {
  // Stop any live polling
  stopPolling();
  stopReplay();

  console.log(`[Replay] Loading session ${sessionKey} data...`);

  // Reset state for this session
  raceStore.setSession(sessionKey, meetingKey);

  // Load metadata first
  const [drivers, sessions, meetings] = await Promise.allSettled([
    openf1.drivers({ session_key: sessionKey }),
    openf1.sessions({ session_key: sessionKey }),
    openf1.meetings({ meeting_key: meetingKey }),
  ]);

  if (drivers.status === "fulfilled") raceStore.updateDrivers(drivers.value);
  if (sessions.status === "fulfilled" && sessions.value.length > 0) {
    raceStore.updateSession(sessions.value[0]);
  }
  if (meetings.status === "fulfilled" && meetings.value.length > 0) {
    raceStore.updateMeeting(meetings.value[0]);
  }

  // Fetch all time-series data (skip carData/location - too much data)
  const [positions, intervals, laps, pits, raceControl, weather, stints] = await Promise.allSettled([
    openf1.positions({ session_key: sessionKey }),
    openf1.intervals({ session_key: sessionKey }),
    openf1.laps({ session_key: sessionKey }),
    openf1.pit({ session_key: sessionKey }),
    openf1.raceControl({ session_key: sessionKey }),
    openf1.weather({ session_key: sessionKey }),
    openf1.stints({ session_key: sessionKey }),
  ]);

  // Build timeline from all events
  timeline = [];

  const addEvents = <T>(type: TimelineEvent["type"], result: PromiseSettledResult<T[]>) => {
    if (result.status !== "fulfilled") return;
    for (const item of result.value) {
      const ts = getEventTime(type, item as TimelineEvent["data"]);
      if (ts) {
        timeline.push({ time: new Date(ts).getTime(), type, data: item as TimelineEvent["data"] });
      }
    }
  };

  addEvents("position", positions);
  addEvents("interval", intervals);
  addEvents("lap", laps);
  addEvents("pit", pits);
  addEvents("raceControl", raceControl);
  addEvents("weather", weather);

  // Sort chronologically
  timeline.sort((a, b) => a.time - b.time);

  if (timeline.length === 0) {
    console.log("[Replay] No timeline events found");
    return;
  }

  // Also load stints - we'll apply them based on lap numbers during replay
  if (stints.status === "fulfilled") {
    // Store stints to apply during replay based on lap progress
    raceStore.updateStints(stints.value);
  }

  replayStartTime = new Date(timeline[0].time).toISOString();
  replayEndTime = new Date(timeline[timeline.length - 1].time).toISOString();
  currentReplayTime = replayStartTime;
  timelineIndex = 0;
  replaySpeed = 1;
  replayPlaying = false;

  console.log(`[Replay] Timeline built: ${timeline.length} events from ${replayStartTime} to ${replayEndTime}`);

  raceStore.setReplay({
    active: true,
    playing: false,
    speed: replaySpeed,
    currentTime: currentReplayTime,
    startTime: replayStartTime,
    endTime: replayEndTime,
  });
}

function processEvents(upToTime: number) {
  // Batch events that fall within this tick window
  const batchedPositions: Position[] = [];
  const batchedIntervals: Interval[] = [];
  const batchedLaps: Lap[] = [];
  const batchedPits: PitStop[] = [];
  const batchedRaceControl: RaceControlMessage[] = [];
  const batchedWeather: Weather[] = [];

  while (timelineIndex < timeline.length && timeline[timelineIndex].time <= upToTime) {
    const event = timeline[timelineIndex];
    switch (event.type) {
      case "position": batchedPositions.push(event.data as Position); break;
      case "interval": batchedIntervals.push(event.data as Interval); break;
      case "lap": batchedLaps.push(event.data as Lap); break;
      case "pit": batchedPits.push(event.data as PitStop); break;
      case "raceControl": batchedRaceControl.push(event.data as RaceControlMessage); break;
      case "weather": batchedWeather.push(event.data as Weather); break;
    }
    timelineIndex++;
  }

  // Apply batched updates
  if (batchedPositions.length > 0) raceStore.updatePositions(batchedPositions);
  if (batchedIntervals.length > 0) raceStore.updateIntervals(batchedIntervals);
  if (batchedLaps.length > 0) raceStore.updateLaps(batchedLaps);
  if (batchedPits.length > 0) raceStore.updatePitStops(batchedPits);
  if (batchedRaceControl.length > 0) raceStore.updateRaceControl(batchedRaceControl);
  if (batchedWeather.length > 0) raceStore.updateWeather(batchedWeather);
}

export function playReplay() {
  if (replayTimer || timeline.length === 0) return;

  replayPlaying = true;
  const TICK_MS = 200; // Process every 200ms for smooth updates
  const SIMULATED_SECONDS_PER_TICK = (TICK_MS / 1000) * replaySpeed;

  let currentTime = timeline[timelineIndex]?.time ?? new Date(currentReplayTime).getTime();

  raceStore.setReplay({
    active: true,
    playing: true,
    speed: replaySpeed,
    currentTime: new Date(currentTime).toISOString(),
    startTime: replayStartTime,
    endTime: replayEndTime,
  });

  replayTimer = setInterval(() => {
    if (timelineIndex >= timeline.length) {
      pauseReplay();
      return;
    }

    // Advance simulated time
    currentTime += SIMULATED_SECONDS_PER_TICK * 1000;
    currentReplayTime = new Date(currentTime).toISOString();

    processEvents(currentTime);

    raceStore.setReplay({
      active: true,
      playing: true,
      speed: replaySpeed,
      currentTime: currentReplayTime,
      startTime: replayStartTime,
      endTime: replayEndTime,
    });
  }, TICK_MS);
}

export function pauseReplay() {
  if (replayTimer) {
    clearInterval(replayTimer);
    replayTimer = null;
  }
  replayPlaying = false;

  raceStore.setReplay({
    active: true,
    playing: false,
    speed: replaySpeed,
    currentTime: currentReplayTime,
    startTime: replayStartTime,
    endTime: replayEndTime,
  });
}

export function setReplaySpeed(speed: number) {
  replaySpeed = speed;
  // If currently playing, restart the timer with new speed
  if (replayPlaying) {
    pauseReplay();
    playReplay();
  } else {
    raceStore.setReplay({
      active: true,
      playing: false,
      speed: replaySpeed,
      currentTime: currentReplayTime,
      startTime: replayStartTime,
      endTime: replayEndTime,
    });
  }
}

export function stopReplay() {
  if (replayTimer) {
    clearInterval(replayTimer);
    replayTimer = null;
  }
  timeline = [];
  timelineIndex = 0;
  replayPlaying = false;
  raceStore.setReplay(null);
}

export function getReplayStatus() {
  return {
    active: timeline.length > 0,
    playing: replayPlaying,
    speed: replaySpeed,
    currentTime: currentReplayTime,
    startTime: replayStartTime,
    endTime: replayEndTime,
    progress: timeline.length > 0 ? timelineIndex / timeline.length : 0,
  };
}
