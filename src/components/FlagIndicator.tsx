"use client";

import { flagToColor } from "@/lib/utils";
import type { FlagStatus } from "@/lib/openf1/types";

const FLAG_LABELS: Record<string, string> = {
  GREEN: "GREEN FLAG",
  YELLOW: "YELLOW FLAG",
  DOUBLE_YELLOW: "DOUBLE YELLOW",
  RED: "RED FLAG",
  CHEQUERED: "CHEQUERED FLAG",
  BLUE: "BLUE FLAG",
  CLEAR: "TRACK CLEAR",
  NONE: "NO FLAG",
};

export function FlagIndicator({ flag, size = "md" }: { flag: FlagStatus; size?: "sm" | "md" | "lg" }) {
  const color = flagToColor(flag);
  const isActive = flag !== "NONE" && flag !== "GREEN" && flag !== "CLEAR";

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-lg font-bold",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-md font-mono uppercase tracking-wider ${sizeClasses[size]} ${isActive ? "flag-pulse" : ""}`}
      style={{ backgroundColor: `${color}22`, border: `2px solid ${color}`, color }}
    >
      <div
        className="h-3 w-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      {FLAG_LABELS[flag] || flag}
    </div>
  );
}
