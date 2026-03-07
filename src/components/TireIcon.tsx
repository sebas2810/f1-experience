"use client";

import { TIRE_COLORS } from "@/lib/constants/teams";
import type { TireCompound } from "@/lib/openf1/types";

const TIRE_LABELS: Record<string, string> = {
  SOFT: "S",
  MEDIUM: "M",
  HARD: "H",
  INTERMEDIATE: "I",
  WET: "W",
  UNKNOWN: "?",
};

export function TireIcon({
  compound,
  age,
  size = "md",
}: {
  compound: TireCompound;
  age?: number;
  size?: "sm" | "md" | "lg";
}) {
  const color = TIRE_COLORS[compound] || TIRE_COLORS.UNKNOWN;
  const label = TIRE_LABELS[compound] || "?";

  const sizeClasses = {
    sm: "h-5 w-5 text-[10px]",
    md: "h-7 w-7 text-xs",
    lg: "h-9 w-9 text-sm",
  };

  return (
    <div className="flex items-center gap-1">
      <div
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full border-2 font-bold`}
        style={{ borderColor: color, color }}
      >
        {label}
      </div>
      {age != null && (
        <span className="text-xs text-gray-400">L{age}</span>
      )}
    </div>
  );
}
