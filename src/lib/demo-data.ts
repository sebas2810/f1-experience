import type { RaceState, Driver, Position, Interval, Lap, Stint, PitStop, RaceControlMessage, Weather, CarData, Location } from "@/lib/openf1/types";

// Sample data based on a typical F1 race (inspired by 2024 Monaco GP)
const drivers: Driver[] = [
  { driver_number: 1, broadcast_name: "M VERSTAPPEN", full_name: "Max VERSTAPPEN", name_acronym: "VER", team_name: "Red Bull Racing", team_colour: "3671C6", first_name: "Max", last_name: "Verstappen", headshot_url: null, country_code: "NED", session_key: 9999, meeting_key: 1999 },
  { driver_number: 16, broadcast_name: "C LECLERC", full_name: "Charles LECLERC", name_acronym: "LEC", team_name: "Ferrari", team_colour: "E8002D", first_name: "Charles", last_name: "Leclerc", headshot_url: null, country_code: "MON", session_key: 9999, meeting_key: 1999 },
  { driver_number: 55, broadcast_name: "C SAINZ", full_name: "Carlos SAINZ", name_acronym: "SAI", team_name: "Ferrari", team_colour: "E8002D", first_name: "Carlos", last_name: "Sainz", headshot_url: null, country_code: "ESP", session_key: 9999, meeting_key: 1999 },
  { driver_number: 4, broadcast_name: "L NORRIS", full_name: "Lando NORRIS", name_acronym: "NOR", team_name: "McLaren", team_colour: "FF8000", first_name: "Lando", last_name: "Norris", headshot_url: null, country_code: "GBR", session_key: 9999, meeting_key: 1999 },
  { driver_number: 81, broadcast_name: "O PIASTRI", full_name: "Oscar PIASTRI", name_acronym: "PIA", team_name: "McLaren", team_colour: "FF8000", first_name: "Oscar", last_name: "Piastri", headshot_url: null, country_code: "AUS", session_key: 9999, meeting_key: 1999 },
  { driver_number: 44, broadcast_name: "L HAMILTON", full_name: "Lewis HAMILTON", name_acronym: "HAM", team_name: "Ferrari", team_colour: "E8002D", first_name: "Lewis", last_name: "Hamilton", headshot_url: null, country_code: "GBR", session_key: 9999, meeting_key: 1999 },
  { driver_number: 63, broadcast_name: "G RUSSELL", full_name: "George RUSSELL", name_acronym: "RUS", team_name: "Mercedes", team_colour: "27F4D2", first_name: "George", last_name: "Russell", headshot_url: null, country_code: "GBR", session_key: 9999, meeting_key: 1999 },
  { driver_number: 14, broadcast_name: "F ALONSO", full_name: "Fernando ALONSO", name_acronym: "ALO", team_name: "Aston Martin", team_colour: "229971", first_name: "Fernando", last_name: "Alonso", headshot_url: null, country_code: "ESP", session_key: 9999, meeting_key: 1999 },
  { driver_number: 18, broadcast_name: "L STROLL", full_name: "Lance STROLL", name_acronym: "STR", team_name: "Aston Martin", team_colour: "229971", first_name: "Lance", last_name: "Stroll", headshot_url: null, country_code: "CAN", session_key: 9999, meeting_key: 1999 },
  { driver_number: 10, broadcast_name: "P GASLY", full_name: "Pierre GASLY", name_acronym: "GAS", team_name: "Alpine", team_colour: "FF87BC", first_name: "Pierre", last_name: "Gasly", headshot_url: null, country_code: "FRA", session_key: 9999, meeting_key: 1999 },
  { driver_number: 31, broadcast_name: "E OCON", full_name: "Esteban OCON", name_acronym: "OCO", team_name: "Alpine", team_colour: "FF87BC", first_name: "Esteban", last_name: "Ocon", headshot_url: null, country_code: "FRA", session_key: 9999, meeting_key: 1999 },
  { driver_number: 23, broadcast_name: "A ALBON", full_name: "Alexander ALBON", name_acronym: "ALB", team_name: "Williams", team_colour: "64C4FF", first_name: "Alexander", last_name: "Albon", headshot_url: null, country_code: "THA", session_key: 9999, meeting_key: 1999 },
  { driver_number: 2, broadcast_name: "L SARGEANT", full_name: "Logan SARGEANT", name_acronym: "SAR", team_name: "Williams", team_colour: "64C4FF", first_name: "Logan", last_name: "Sargeant", headshot_url: null, country_code: "USA", session_key: 9999, meeting_key: 1999 },
  { driver_number: 22, broadcast_name: "Y TSUNODA", full_name: "Yuki TSUNODA", name_acronym: "TSU", team_name: "RB", team_colour: "6692FF", first_name: "Yuki", last_name: "Tsunoda", headshot_url: null, country_code: "JPN", session_key: 9999, meeting_key: 1999 },
  { driver_number: 3, broadcast_name: "D RICCIARDO", full_name: "Daniel RICCIARDO", name_acronym: "RIC", team_name: "RB", team_colour: "6692FF", first_name: "Daniel", last_name: "Ricciardo", headshot_url: null, country_code: "AUS", session_key: 9999, meeting_key: 1999 },
  { driver_number: 77, broadcast_name: "V BOTTAS", full_name: "Valtteri BOTTAS", name_acronym: "BOT", team_name: "Kick Sauber", team_colour: "52E252", first_name: "Valtteri", last_name: "Bottas", headshot_url: null, country_code: "FIN", session_key: 9999, meeting_key: 1999 },
  { driver_number: 24, broadcast_name: "G ZHOU", full_name: "Guanyu ZHOU", name_acronym: "ZHO", team_name: "Kick Sauber", team_colour: "52E252", first_name: "Guanyu", last_name: "Zhou", headshot_url: null, country_code: "CHN", session_key: 9999, meeting_key: 1999 },
  { driver_number: 27, broadcast_name: "N HULKENBERG", full_name: "Nico HULKENBERG", name_acronym: "HUL", team_name: "Haas F1 Team", team_colour: "B6BABD", first_name: "Nico", last_name: "Hulkenberg", headshot_url: null, country_code: "GER", session_key: 9999, meeting_key: 1999 },
  { driver_number: 20, broadcast_name: "K MAGNUSSEN", full_name: "Kevin MAGNUSSEN", name_acronym: "MAG", team_name: "Haas F1 Team", team_colour: "B6BABD", first_name: "Kevin", last_name: "Magnussen", headshot_url: null, country_code: "DEN", session_key: 9999, meeting_key: 1999 },
  { driver_number: 11, broadcast_name: "S PEREZ", full_name: "Sergio PEREZ", name_acronym: "PER", team_name: "Red Bull Racing", team_colour: "3671C6", first_name: "Sergio", last_name: "Perez", headshot_url: null, country_code: "MEX", session_key: 9999, meeting_key: 1999 },
];

const now = new Date().toISOString();

const positions: Position[] = [
  { driver_number: 16, position: 1, date: now, session_key: 9999, meeting_key: 1999 },
  { driver_number: 55, position: 2, date: now, session_key: 9999, meeting_key: 1999 },
  { driver_number: 4, position: 3, date: now, session_key: 9999, meeting_key: 1999 },
  { driver_number: 1, position: 4, date: now, session_key: 9999, meeting_key: 1999 },
  { driver_number: 81, position: 5, date: now, session_key: 9999, meeting_key: 1999 },
  { driver_number: 63, position: 6, date: now, session_key: 9999, meeting_key: 1999 },
  { driver_number: 44, position: 7, date: now, session_key: 9999, meeting_key: 1999 },
  { driver_number: 14, position: 8, date: now, session_key: 9999, meeting_key: 1999 },
  { driver_number: 10, position: 9, date: now, session_key: 9999, meeting_key: 1999 },
  { driver_number: 22, position: 10, date: now, session_key: 9999, meeting_key: 1999 },
  { driver_number: 27, position: 11, date: now, session_key: 9999, meeting_key: 1999 },
  { driver_number: 23, position: 12, date: now, session_key: 9999, meeting_key: 1999 },
  { driver_number: 18, position: 13, date: now, session_key: 9999, meeting_key: 1999 },
  { driver_number: 31, position: 14, date: now, session_key: 9999, meeting_key: 1999 },
  { driver_number: 3, position: 15, date: now, session_key: 9999, meeting_key: 1999 },
  { driver_number: 77, position: 16, date: now, session_key: 9999, meeting_key: 1999 },
  { driver_number: 20, position: 17, date: now, session_key: 9999, meeting_key: 1999 },
  { driver_number: 11, position: 18, date: now, session_key: 9999, meeting_key: 1999 },
  { driver_number: 24, position: 19, date: now, session_key: 9999, meeting_key: 1999 },
  { driver_number: 2, position: 20, date: now, session_key: 9999, meeting_key: 1999 },
];

function makeLap(dn: number, lapNum: number, base: number, s1: number, s2: number, s3: number): Lap {
  return {
    driver_number: dn, lap_number: lapNum, lap_duration: base,
    duration_sector_1: s1, duration_sector_2: s2, duration_sector_3: s3,
    i1_speed: 280 + Math.random() * 30, i2_speed: 260 + Math.random() * 20, st_speed: 290 + Math.random() * 25,
    is_pit_out_lap: false, date_start: now, session_key: 9999, meeting_key: 1999,
    segments_sector_1: null, segments_sector_2: null, segments_sector_3: null,
  };
}

const laps: Record<number, Lap> = {
  16: makeLap(16, 42, 73.740, 22.180, 33.250, 18.310),
  55: makeLap(55, 42, 74.012, 22.340, 33.410, 18.262),
  4:  makeLap(4,  42, 74.230, 22.410, 33.380, 18.440),
  1:  makeLap(1,  42, 74.445, 22.550, 33.295, 18.600),
  81: makeLap(81, 42, 74.618, 22.490, 33.528, 18.600),
  63: makeLap(63, 42, 74.880, 22.610, 33.540, 18.730),
  44: makeLap(44, 42, 75.120, 22.690, 33.580, 18.850),
  14: makeLap(14, 42, 75.340, 22.780, 33.710, 18.850),
  10: makeLap(10, 42, 75.560, 22.850, 33.800, 18.910),
  22: makeLap(22, 42, 75.780, 22.920, 33.890, 18.970),
  27: makeLap(27, 42, 75.990, 23.010, 33.940, 19.040),
  23: makeLap(23, 42, 76.200, 23.100, 34.020, 19.080),
  18: makeLap(18, 42, 76.420, 23.190, 34.100, 19.130),
  31: makeLap(31, 42, 76.640, 23.280, 34.180, 19.180),
  3:  makeLap(3,  42, 76.860, 23.370, 34.260, 19.230),
  77: makeLap(77, 42, 77.080, 23.460, 34.340, 19.280),
  20: makeLap(20, 42, 77.300, 23.550, 34.420, 19.330),
  11: makeLap(11, 42, 77.520, 23.640, 34.500, 19.380),
  24: makeLap(24, 42, 77.740, 23.730, 34.580, 19.430),
  2:  makeLap(2,  42, 77.960, 23.820, 34.660, 19.480),
};

const bestLaps: Record<number, Lap> = {
  16: makeLap(16, 35, 72.909, 21.980, 32.829, 18.100),
  55: makeLap(55, 37, 73.250, 22.110, 33.040, 18.100),
  4:  makeLap(4,  33, 73.410, 22.200, 33.010, 18.200),
  1:  makeLap(1,  36, 73.580, 22.280, 33.100, 18.200),
  81: makeLap(81, 34, 73.790, 22.310, 33.180, 18.300),
  63: makeLap(63, 38, 74.020, 22.400, 33.220, 18.400),
  44: makeLap(44, 32, 74.280, 22.490, 33.290, 18.500),
  14: makeLap(14, 39, 74.500, 22.580, 33.320, 18.600),
  10: makeLap(10, 31, 74.720, 22.670, 33.450, 18.600),
  22: makeLap(22, 40, 74.940, 22.760, 33.480, 18.700),
  27: makeLap(27, 35, 75.160, 22.850, 33.510, 18.800),
  23: makeLap(23, 36, 75.380, 22.940, 33.540, 18.900),
  18: makeLap(18, 33, 75.600, 23.030, 33.570, 19.000),
  31: makeLap(31, 34, 75.820, 23.120, 33.600, 19.100),
  3:  makeLap(3,  37, 76.040, 23.210, 33.630, 19.200),
  77: makeLap(77, 38, 76.260, 23.300, 33.660, 19.300),
  20: makeLap(20, 39, 76.480, 23.390, 33.690, 19.400),
  11: makeLap(11, 40, 76.700, 23.480, 33.720, 19.500),
  24: makeLap(24, 35, 76.920, 23.570, 33.750, 19.600),
  2:  makeLap(2,  36, 77.140, 23.660, 33.780, 19.700),
};

// Generate all laps for each driver (last 10)
const allLaps: Record<number, Lap[]> = {};
for (const dn of Object.keys(laps)) {
  const d = Number(dn);
  allLaps[d] = [];
  for (let i = 33; i <= 42; i++) {
    const base = (laps[d]?.lap_duration || 75) + (Math.random() - 0.5) * 1.5;
    const s1 = (laps[d]?.duration_sector_1 || 22.5) + (Math.random() - 0.5) * 0.5;
    const s2 = (laps[d]?.duration_sector_2 || 33.5) + (Math.random() - 0.5) * 0.5;
    const s3 = base - s1 - s2;
    allLaps[d].push(makeLap(d, i, base, s1, s2, s3));
  }
}

const intervals: Record<number, Interval> = {
  16: { driver_number: 16, gap_to_leader: 0, interval: 0, date: now, session_key: 9999, meeting_key: 1999 },
  55: { driver_number: 55, gap_to_leader: 1.234, interval: 1.234, date: now, session_key: 9999, meeting_key: 1999 },
  4:  { driver_number: 4,  gap_to_leader: 4.567, interval: 3.333, date: now, session_key: 9999, meeting_key: 1999 },
  1:  { driver_number: 1,  gap_to_leader: 7.891, interval: 3.324, date: now, session_key: 9999, meeting_key: 1999 },
  81: { driver_number: 81, gap_to_leader: 12.345, interval: 4.454, date: now, session_key: 9999, meeting_key: 1999 },
  63: { driver_number: 63, gap_to_leader: 18.678, interval: 6.333, date: now, session_key: 9999, meeting_key: 1999 },
  44: { driver_number: 44, gap_to_leader: 22.012, interval: 3.334, date: now, session_key: 9999, meeting_key: 1999 },
  14: { driver_number: 14, gap_to_leader: 28.456, interval: 6.444, date: now, session_key: 9999, meeting_key: 1999 },
  10: { driver_number: 10, gap_to_leader: 35.789, interval: 7.333, date: now, session_key: 9999, meeting_key: 1999 },
  22: { driver_number: 22, gap_to_leader: 42.123, interval: 6.334, date: now, session_key: 9999, meeting_key: 1999 },
  27: { driver_number: 27, gap_to_leader: 48.456, interval: 6.333, date: now, session_key: 9999, meeting_key: 1999 },
  23: { driver_number: 23, gap_to_leader: 52.789, interval: 4.333, date: now, session_key: 9999, meeting_key: 1999 },
  18: { driver_number: 18, gap_to_leader: 58.123, interval: 5.334, date: now, session_key: 9999, meeting_key: 1999 },
  31: { driver_number: 31, gap_to_leader: 63.456, interval: 5.333, date: now, session_key: 9999, meeting_key: 1999 },
  3:  { driver_number: 3,  gap_to_leader: 68.789, interval: 5.333, date: now, session_key: 9999, meeting_key: 1999 },
  77: { driver_number: 77, gap_to_leader: 74.123, interval: 5.334, date: now, session_key: 9999, meeting_key: 1999 },
  20: { driver_number: 20, gap_to_leader: 79.456, interval: 5.333, date: now, session_key: 9999, meeting_key: 1999 },
  11: { driver_number: 11, gap_to_leader: 84.789, interval: 5.333, date: now, session_key: 9999, meeting_key: 1999 },
  24: { driver_number: 24, gap_to_leader: 90.123, interval: 5.334, date: now, session_key: 9999, meeting_key: 1999 },
  2:  { driver_number: 2,  gap_to_leader: 95.456, interval: 5.333, date: now, session_key: 9999, meeting_key: 1999 },
};

function makeStints(dn: number, compounds: [string, number, number, number | null][]): Stint[] {
  return compounds.map(([compound, start, age, end], i) => ({
    driver_number: dn, stint_number: i + 1, compound: compound as Stint["compound"],
    tyre_age_at_start: age, lap_start: start, lap_end: end,
    session_key: 9999, meeting_key: 1999,
  }));
}

const stints: Record<number, Stint[]> = {
  16: makeStints(16, [["SOFT", 1, 0, 18], ["HARD", 19, 0, 35], ["MEDIUM", 36, 0, null]]),
  55: makeStints(55, [["SOFT", 1, 0, 16], ["HARD", 17, 0, 33], ["MEDIUM", 34, 0, null]]),
  4:  makeStints(4,  [["MEDIUM", 1, 0, 22], ["HARD", 23, 0, null]]),
  1:  makeStints(1,  [["SOFT", 1, 0, 15], ["HARD", 16, 0, 34], ["SOFT", 35, 0, null]]),
  81: makeStints(81, [["MEDIUM", 1, 0, 20], ["HARD", 21, 0, 38], ["SOFT", 39, 0, null]]),
  63: makeStints(63, [["SOFT", 1, 0, 14], ["HARD", 15, 0, null]]),
  44: makeStints(44, [["MEDIUM", 1, 0, 24], ["HARD", 25, 0, null]]),
  14: makeStints(14, [["HARD", 1, 0, 28], ["MEDIUM", 29, 0, null]]),
  10: makeStints(10, [["SOFT", 1, 0, 12], ["HARD", 13, 0, 30], ["MEDIUM", 31, 0, null]]),
  22: makeStints(22, [["MEDIUM", 1, 0, 18], ["HARD", 19, 0, null]]),
  27: makeStints(27, [["HARD", 1, 0, 26], ["SOFT", 27, 0, null]]),
  23: makeStints(23, [["MEDIUM", 1, 0, 20], ["HARD", 21, 0, null]]),
  18: makeStints(18, [["SOFT", 1, 0, 14], ["HARD", 15, 0, null]]),
  31: makeStints(31, [["MEDIUM", 1, 0, 22], ["HARD", 23, 0, null]]),
  3:  makeStints(3,  [["HARD", 1, 0, 30], ["SOFT", 31, 0, null]]),
  77: makeStints(77, [["MEDIUM", 1, 0, 24], ["HARD", 25, 0, null]]),
  20: makeStints(20, [["SOFT", 1, 0, 16], ["HARD", 17, 0, null]]),
  11: makeStints(11, [["SOFT", 1, 0, 10], ["HARD", 11, 0, 28], ["MEDIUM", 29, 0, null]]),
  24: makeStints(24, [["MEDIUM", 1, 0, 20], ["HARD", 21, 0, null]]),
  2:  makeStints(2,  [["HARD", 1, 0, 30], ["MEDIUM", 31, 0, null]]),
};

const pitStops: Record<number, PitStop[]> = {};
for (const [dn, driverStints] of Object.entries(stints)) {
  const d = Number(dn);
  pitStops[d] = driverStints.slice(0, -1).map(s => ({
    driver_number: d, lap_number: s.lap_end!, pit_duration: 22 + Math.random() * 4,
    date: now, session_key: 9999, meeting_key: 1999,
  }));
}

const raceControl: RaceControlMessage[] = [
  { date: new Date(Date.now() - 3600000).toISOString(), category: "Flag", message: "GREEN LIGHT - PIT EXIT OPEN", flag: "GREEN", scope: "Track", sector: null, driver_number: null, lap_number: 1, session_key: 9999, meeting_key: 1999 },
  { date: new Date(Date.now() - 3000000).toISOString(), category: "Flag", message: "LIGHTS OUT AND AWAY WE GO", flag: "GREEN", scope: "Track", sector: null, driver_number: null, lap_number: 1, session_key: 9999, meeting_key: 1999 },
  { date: new Date(Date.now() - 2400000).toISOString(), category: "Drs", message: "DRS ENABLED", flag: null, scope: "Track", sector: null, driver_number: null, lap_number: 3, session_key: 9999, meeting_key: 1999 },
  { date: new Date(Date.now() - 1800000).toISOString(), category: "Flag", message: "YELLOW FLAG IN SECTOR 2", flag: "YELLOW", scope: "Sector", sector: 2, driver_number: null, lap_number: 12, session_key: 9999, meeting_key: 1999 },
  { date: new Date(Date.now() - 1790000).toISOString(), category: "Flag", message: "TRACK CLEAR", flag: "GREEN", scope: "Track", sector: null, driver_number: null, lap_number: 12, session_key: 9999, meeting_key: 1999 },
  { date: new Date(Date.now() - 1200000).toISOString(), category: "Other", message: "VIRTUAL SAFETY CAR DEPLOYED", flag: "YELLOW", scope: "Track", sector: null, driver_number: null, lap_number: 24, session_key: 9999, meeting_key: 1999 },
  { date: new Date(Date.now() - 1100000).toISOString(), category: "Other", message: "VIRTUAL SAFETY CAR ENDING", flag: "GREEN", scope: "Track", sector: null, driver_number: null, lap_number: 26, session_key: 9999, meeting_key: 1999 },
  { date: new Date(Date.now() - 600000).toISOString(), category: "Flag", message: "BLACK AND WHITE FLAG FOR CAR 20 - TRACK LIMITS", flag: "BLACK_AND_WHITE", scope: "Driver", sector: null, driver_number: 20, lap_number: 35, session_key: 9999, meeting_key: 1999 },
  { date: new Date(Date.now() - 300000).toISOString(), category: "Drs", message: "DRS ENABLED", flag: null, scope: "Track", sector: null, driver_number: null, lap_number: 38, session_key: 9999, meeting_key: 1999 },
  { date: new Date(Date.now() - 60000).toISOString(), category: "Other", message: "FASTEST LAP: CAR 16 (LEC) 1:12.909", flag: null, scope: "Track", sector: null, driver_number: 16, lap_number: 40, session_key: 9999, meeting_key: 1999 },
];

const weather: Weather = {
  air_temperature: 24.3, humidity: 52, pressure: 1013.2, rainfall: 0,
  track_temperature: 42.8, wind_direction: 180, wind_speed: 8.4,
  date: now, session_key: 9999, meeting_key: 1999,
};

// Car telemetry data
const carData: Record<number, CarData> = {};
for (const d of drivers) {
  carData[d.driver_number] = {
    driver_number: d.driver_number,
    speed: 260 + Math.random() * 60,
    rpm: 10000 + Math.random() * 2500,
    gear: Math.floor(5 + Math.random() * 4),
    throttle: 70 + Math.random() * 30,
    brake: Math.random() > 0.7 ? Math.random() * 100 : 0,
    drs: Math.random() > 0.5 ? 14 : 0,
    date: now, session_key: 9999, meeting_key: 1999,
  };
}

// Circular track positions (Monaco-inspired)
const locations: Record<number, Location> = {};
for (let i = 0; i < drivers.length; i++) {
  const angle = (i / drivers.length) * 2 * Math.PI;
  const r = 3000 + Math.random() * 200;
  locations[drivers[i].driver_number] = {
    driver_number: drivers[i].driver_number,
    x: Math.cos(angle) * r + 5000,
    y: Math.sin(angle) * r * 0.6 + 3000,
    z: 0,
    date: now, session_key: 9999, meeting_key: 1999,
  };
}

const driversMap: Record<number, Driver> = {};
for (const d of drivers) driversMap[d.driver_number] = d;

export const DEMO_STATE: RaceState = {
  sessionKey: 9999,
  meetingKey: 1999,
  session: null,
  meeting: null,
  drivers: driversMap,
  positions,
  intervals,
  laps,
  bestLaps,
  allLaps,
  stints,
  pitStops,
  raceControl,
  weather,
  carData,
  locations,
  currentFlag: "GREEN",
  currentLap: 42,
  totalLaps: 53,
  fastestLap: { driverNumber: 16, time: 72.909 },
  lastUpdated: now,
};
