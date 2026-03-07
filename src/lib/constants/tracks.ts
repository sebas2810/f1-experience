// Track SVG paths for circuit visualization
// These are simplified representations - actual car positions come from the Location API
export interface TrackConfig {
  name: string;
  country: string;
  svgPath: string;
  viewBox: string;
  drsZones: { start: [number, number]; end: [number, number] }[];
}

// Track outlines will be populated from Location API data when a session is loaded.
// The Location API returns x,y coordinates of all cars, which we can use to draw
// the track outline by collecting points over multiple laps.
export const TRACK_CONFIGS: Record<string, TrackConfig> = {
  // Placeholder - tracks are auto-generated from location data
};

// Generate a track outline from location data points
export function generateTrackPath(
  locations: { x: number; y: number }[]
): string {
  if (locations.length < 2) return "";

  // Normalize coordinates to viewBox
  const xs = locations.map(l => l.x);
  const ys = locations.map(l => l.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const normalized = locations.map(l => ({
    x: ((l.x - minX) / rangeX) * 900 + 50,
    y: ((l.y - minY) / rangeY) * 900 + 50,
  }));

  const parts = normalized.map((p, i) =>
    i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`
  );
  return parts.join(" ") + " Z";
}
