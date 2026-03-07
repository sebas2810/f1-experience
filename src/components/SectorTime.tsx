"use client";

const SECTOR_COLORS = {
  purple: "text-f1-purple bg-f1-purple/10",
  green: "text-f1-green bg-f1-green/10",
  yellow: "text-f1-yellow bg-f1-yellow/10",
  default: "text-gray-400 bg-gray-800",
};

export function SectorTime({
  time,
  color = "default",
}: {
  time: number | null;
  color?: "purple" | "green" | "yellow" | "default";
}) {
  return (
    <span
      className={`inline-block min-w-[60px] rounded px-1.5 py-0.5 text-center font-mono text-xs ${SECTOR_COLORS[color]}`}
    >
      {time != null ? time.toFixed(3) : "—"}
    </span>
  );
}
