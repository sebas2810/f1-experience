"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { RaceState } from "@/lib/openf1/types";

const defaultState: RaceState = {
  sessionKey: null,
  meetingKey: null,
  session: null,
  meeting: null,
  drivers: {},
  positions: [],
  intervals: {},
  laps: {},
  bestLaps: {},
  allLaps: {},
  stints: {},
  pitStops: {},
  raceControl: [],
  weather: null,
  carData: {},
  locations: {},
  currentFlag: "NONE",
  currentLap: 0,
  totalLaps: null,
  fastestLap: null,
  lastUpdated: "",
};

export function useRaceData() {
  const [state, setState] = useState<RaceState>(defaultState);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource("/api/sse");
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as RaceState;
        setState(data);
      } catch {
        // Ignore parse errors (e.g., keepalive)
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      // Reconnect after 3 seconds
      setTimeout(connect, 3000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  const selectSession = useCallback(async (sessionKey: number, meetingKey: number): Promise<boolean> => {
    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionKey, meetingKey }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }, []);

  return { state, connected, selectSession };
}
