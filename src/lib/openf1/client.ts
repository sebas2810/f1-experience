import type {
  Driver, Position, Interval, Lap, Stint, PitStop,
  RaceControlMessage, Weather, CarData, Location,
  Session, Meeting, TeamRadio,
} from "./types";

const BASE_URL = "https://api.openf1.org/v1";

type QueryParams = Record<string, string | number | boolean | undefined>;

async function fetchAPI<T>(endpoint: string, params: QueryParams = {}): Promise<T[]> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 0 },
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`OpenF1 API error: ${res.status} ${res.statusText} for ${endpoint}`);
  }

  return res.json();
}

export const openf1 = {
  drivers: (params: QueryParams = {}) =>
    fetchAPI<Driver>("/drivers", params),

  positions: (params: QueryParams = {}) =>
    fetchAPI<Position>("/position", params),

  intervals: (params: QueryParams = {}) =>
    fetchAPI<Interval>("/intervals", params),

  laps: (params: QueryParams = {}) =>
    fetchAPI<Lap>("/laps", params),

  stints: (params: QueryParams = {}) =>
    fetchAPI<Stint>("/stints", params),

  pit: (params: QueryParams = {}) =>
    fetchAPI<PitStop>("/pit", params),

  raceControl: (params: QueryParams = {}) =>
    fetchAPI<RaceControlMessage>("/race_control", params),

  weather: (params: QueryParams = {}) =>
    fetchAPI<Weather>("/weather", params),

  carData: (params: QueryParams = {}) =>
    fetchAPI<CarData>("/car_data", params),

  location: (params: QueryParams = {}) =>
    fetchAPI<Location>("/location", params),

  sessions: (params: QueryParams = {}) =>
    fetchAPI<Session>("/sessions", params),

  meetings: (params: QueryParams = {}) =>
    fetchAPI<Meeting>("/meetings", params),

  teamRadio: (params: QueryParams = {}) =>
    fetchAPI<TeamRadio>("/team_radio", params),
};
