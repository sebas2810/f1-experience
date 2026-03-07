export function formatLapTime(seconds: number | null | undefined): string {
  if (seconds == null || seconds <= 0) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}:${secs.toFixed(3).padStart(6, "0")}`;
  }
  return secs.toFixed(3);
}

export function formatGap(gap: number | null | undefined): string {
  if (gap == null) return "—";
  if (gap === 0) return "LEADER";
  return `+${gap.toFixed(3)}`;
}

export function formatInterval(interval: number | null | undefined): string {
  if (interval == null) return "—";
  if (interval === 0) return "—";
  return `+${interval.toFixed(3)}`;
}

export function formatSpeed(speed: number | null | undefined): string {
  if (speed == null) return "—";
  return `${Math.round(speed)} km/h`;
}

export function classNames(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getSectorColor(
  sectorTime: number | null,
  personalBest: number | null,
  overallBest: number | null
): "purple" | "green" | "yellow" | "default" {
  if (sectorTime == null) return "default";
  if (overallBest != null && sectorTime <= overallBest) return "purple";
  if (personalBest != null && sectorTime <= personalBest) return "green";
  return "yellow";
}

export function flagToColor(flag: string | null): string {
  switch (flag) {
    case "GREEN": return "#22c55e";
    case "YELLOW": case "DOUBLE_YELLOW": return "#eab308";
    case "RED": return "#e10600";
    case "BLUE": return "#3b82f6";
    case "CHEQUERED": return "#ffffff";
    default: return "#22c55e";
  }
}

export function parseFlagFromRaceControl(message: string, flag: string | null): string {
  if (flag === "RED") return "RED";
  if (flag === "YELLOW") return "YELLOW";
  if (flag === "GREEN") return "GREEN";
  if (flag === "CHEQUERED") return "CHEQUERED";
  if (message.includes("SAFETY CAR")) return "SAFETY_CAR";
  if (message.includes("VIRTUAL SAFETY CAR")) return "VSC";
  if (flag === "CLEAR") return "GREEN";
  return "NONE";
}
