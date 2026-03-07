import type {
  RaceState, Driver, Position, Interval, Lap, Stint,
  PitStop, RaceControlMessage, Weather, CarData, Location,
  FlagStatus,
} from "@/lib/openf1/types";

type Listener = (state: RaceState) => void;

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
  lastUpdated: new Date().toISOString(),
};

class RaceStore {
  private state: RaceState = { ...defaultState };
  private listeners: Set<Listener> = new Set();

  getState(): RaceState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.state.lastUpdated = new Date().toISOString();
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  setSession(sessionKey: number, meetingKey: number) {
    this.state = {
      ...defaultState,
      sessionKey,
      meetingKey,
      lastUpdated: new Date().toISOString(),
    };
    this.notify();
  }

  updateDrivers(drivers: Driver[]) {
    const map: Record<number, Driver> = {};
    for (const d of drivers) map[d.driver_number] = d;
    this.state.drivers = map;
    this.notify();
  }

  updatePositions(positions: Position[]) {
    // Keep only the latest position per driver
    const latest: Record<number, Position> = {};
    for (const p of positions) {
      if (!latest[p.driver_number] || p.date > latest[p.driver_number].date) {
        latest[p.driver_number] = p;
      }
    }
    this.state.positions = Object.values(latest).sort((a, b) => a.position - b.position);
    this.notify();
  }

  updateIntervals(intervals: Interval[]) {
    for (const i of intervals) {
      if (!this.state.intervals[i.driver_number] ||
          i.date > this.state.intervals[i.driver_number].date) {
        this.state.intervals[i.driver_number] = i;
      }
    }
    this.notify();
  }

  updateLaps(laps: Lap[]) {
    for (const lap of laps) {
      const dn = lap.driver_number;
      // Track latest lap
      if (!this.state.laps[dn] || lap.lap_number > this.state.laps[dn].lap_number) {
        this.state.laps[dn] = lap;
        if (lap.lap_number > this.state.currentLap) {
          this.state.currentLap = lap.lap_number;
        }
      }
      // Track best lap
      if (lap.lap_duration && lap.lap_duration > 0) {
        if (!this.state.bestLaps[dn] ||
            (this.state.bestLaps[dn].lap_duration &&
             lap.lap_duration < this.state.bestLaps[dn].lap_duration!)) {
          this.state.bestLaps[dn] = lap;
        }
        // Track fastest lap overall
        if (!this.state.fastestLap || lap.lap_duration < this.state.fastestLap.time) {
          this.state.fastestLap = { driverNumber: dn, time: lap.lap_duration };
        }
      }
      // Track all laps per driver
      if (!this.state.allLaps[dn]) this.state.allLaps[dn] = [];
      const existing = this.state.allLaps[dn].find(l => l.lap_number === lap.lap_number);
      if (!existing) this.state.allLaps[dn].push(lap);
    }
    this.notify();
  }

  updateStints(stints: Stint[]) {
    const byDriver: Record<number, Stint[]> = {};
    for (const s of stints) {
      if (!byDriver[s.driver_number]) byDriver[s.driver_number] = [];
      byDriver[s.driver_number].push(s);
    }
    for (const [dn, driverStints] of Object.entries(byDriver)) {
      this.state.stints[Number(dn)] = driverStints.sort((a, b) => a.stint_number - b.stint_number);
    }
    this.notify();
  }

  updatePitStops(pits: PitStop[]) {
    const byDriver: Record<number, PitStop[]> = {};
    for (const p of pits) {
      if (!byDriver[p.driver_number]) byDriver[p.driver_number] = [];
      byDriver[p.driver_number].push(p);
    }
    for (const [dn, stops] of Object.entries(byDriver)) {
      this.state.pitStops[Number(dn)] = stops;
    }
    this.notify();
  }

  updateRaceControl(messages: RaceControlMessage[]) {
    this.state.raceControl = messages.slice(-50); // Keep last 50 messages
    // Update flag status from latest flag message
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.flag) {
        this.state.currentFlag = msg.flag as FlagStatus;
        break;
      }
      if (msg.message.includes("SAFETY CAR IN THIS LAP")) {
        this.state.currentFlag = "YELLOW";
        break;
      }
    }
    this.notify();
  }

  updateWeather(weather: Weather[]) {
    if (weather.length > 0) {
      this.state.weather = weather[weather.length - 1];
      this.notify();
    }
  }

  updateCarData(carData: CarData[]) {
    for (const c of carData) {
      this.state.carData[c.driver_number] = c;
    }
    this.notify();
  }

  updateLocations(locations: Location[]) {
    for (const l of locations) {
      this.state.locations[l.driver_number] = l;
    }
    this.notify();
  }
}

// Singleton instance
export const raceStore = new RaceStore();
