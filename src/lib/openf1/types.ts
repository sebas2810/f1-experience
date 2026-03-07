export interface Driver {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  first_name: string;
  last_name: string;
  headshot_url: string | null;
  country_code: string;
  session_key: number;
  meeting_key: number;
}

export interface Position {
  driver_number: number;
  position: number;
  date: string;
  session_key: number;
  meeting_key: number;
}

export interface Interval {
  driver_number: number;
  gap_to_leader: number | null;
  interval: number | null;
  date: string;
  session_key: number;
  meeting_key: number;
}

export interface Lap {
  driver_number: number;
  lap_number: number;
  lap_duration: number | null;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  i1_speed: number | null;
  i2_speed: number | null;
  st_speed: number | null;
  is_pit_out_lap: boolean;
  date_start: string | null;
  session_key: number;
  meeting_key: number;
  segments_sector_1: number[] | null;
  segments_sector_2: number[] | null;
  segments_sector_3: number[] | null;
}

export interface Stint {
  driver_number: number;
  stint_number: number;
  compound: TireCompound;
  tyre_age_at_start: number;
  lap_start: number;
  lap_end: number | null;
  session_key: number;
  meeting_key: number;
}

export type TireCompound = "SOFT" | "MEDIUM" | "HARD" | "INTERMEDIATE" | "WET" | "UNKNOWN";

export interface PitStop {
  driver_number: number;
  lap_number: number;
  pit_duration: number | null;
  date: string;
  session_key: number;
  meeting_key: number;
}

export interface RaceControlMessage {
  date: string;
  category: string;
  message: string;
  flag: string | null;
  scope: string | null;
  sector: number | null;
  driver_number: number | null;
  lap_number: number | null;
  session_key: number;
  meeting_key: number;
}

export interface Weather {
  air_temperature: number;
  humidity: number;
  pressure: number;
  rainfall: number;
  track_temperature: number;
  wind_direction: number;
  wind_speed: number;
  date: string;
  session_key: number;
  meeting_key: number;
}

export interface CarData {
  driver_number: number;
  speed: number;
  rpm: number;
  gear: number;
  throttle: number;
  brake: number;
  drs: number;
  date: string;
  session_key: number;
  meeting_key: number;
}

export interface Location {
  driver_number: number;
  x: number;
  y: number;
  z: number;
  date: string;
  session_key: number;
  meeting_key: number;
}

export interface Session {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  meeting_key: number;
  location: string;
  country_key: number;
  country_name: string;
  country_code: string;
  circuit_key: number;
  circuit_short_name: string;
  year: number;
}

export interface Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  location: string;
  country_key: number;
  country_name: string;
  country_code: string;
  circuit_key: number;
  circuit_short_name: string;
  date_start: string;
  gmt_offset: string;
  year: number;
}

export interface TeamRadio {
  driver_number: number;
  recording_url: string;
  date: string;
  session_key: number;
  meeting_key: number;
}

export type FlagStatus = "GREEN" | "YELLOW" | "DOUBLE_YELLOW" | "RED" | "CHEQUERED" | "CLEAR" | "BLUE" | "BLACK" | "BLACK_AND_WHITE" | "NONE";

export interface RaceState {
  sessionKey: number | null;
  meetingKey: number | null;
  session: Session | null;
  meeting: Meeting | null;
  drivers: Record<number, Driver>;
  positions: Position[];
  intervals: Record<number, Interval>;
  laps: Record<number, Lap>;
  bestLaps: Record<number, Lap>;
  allLaps: Record<number, Lap[]>;
  stints: Record<number, Stint[]>;
  pitStops: Record<number, PitStop[]>;
  raceControl: RaceControlMessage[];
  weather: Weather | null;
  carData: Record<number, CarData>;
  locations: Record<number, Location>;
  currentFlag: FlagStatus;
  currentLap: number;
  totalLaps: number | null;
  fastestLap: { driverNumber: number; time: number } | null;
  lastUpdated: string;
}
