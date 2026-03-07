"use client";

import { useMemo } from "react";
import type { Driver, Location } from "@/lib/openf1/types";

interface TrackMapProps {
  locations: Record<number, Location>;
  drivers: Record<number, Driver>;
  allLocations?: Location[]; // For track outline generation
}

export function TrackMap({ locations, drivers }: TrackMapProps) {
  const driverLocations = useMemo(() => {
    return Object.entries(locations).map(([dn, loc]) => ({
      driverNumber: Number(dn),
      driver: drivers[Number(dn)],
      x: loc.x,
      y: loc.y,
    }));
  }, [locations, drivers]);

  // Calculate bounds
  const bounds = useMemo(() => {
    if (driverLocations.length === 0) return { minX: 0, maxX: 1000, minY: 0, maxY: 1000 };
    const xs = driverLocations.map(d => d.x);
    const ys = driverLocations.map(d => d.y);
    const padding = 500;
    return {
      minX: Math.min(...xs) - padding,
      maxX: Math.max(...xs) + padding,
      minY: Math.min(...ys) - padding,
      maxY: Math.max(...ys) + padding,
    };
  }, [driverLocations]);

  const width = bounds.maxX - bounds.minX || 1;
  const height = bounds.maxY - bounds.minY || 1;

  return (
    <svg
      viewBox={`${bounds.minX} ${bounds.minY} ${width} ${height}`}
      className="h-full w-full"
      style={{ transform: "scaleY(-1)" }} // Flip Y axis for map coordinates
    >
      {/* Track outline would go here if we had location history */}

      {/* Car positions */}
      {driverLocations.map(({ driverNumber, driver, x, y }) => {
        const color = driver?.team_colour ? `#${driver.team_colour}` : "#ffffff";
        return (
          <g key={driverNumber}>
            <circle
              cx={x}
              cy={y}
              r={Math.max(width, height) * 0.012}
              fill={color}
              stroke="#000"
              strokeWidth={Math.max(width, height) * 0.003}
            />
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#000"
              fontSize={Math.max(width, height) * 0.015}
              fontWeight="bold"
              style={{ transform: "scaleY(-1)", transformOrigin: `${x}px ${y}px` }}
            >
              {driver?.name_acronym?.slice(0, 3) || driverNumber}
            </text>
          </g>
        );
      })}

      {driverLocations.length === 0 && (
        <text
          x={bounds.minX + width / 2}
          y={bounds.minY + height / 2}
          textAnchor="middle"
          fill="#666"
          fontSize={width * 0.05}
          style={{ transform: "scaleY(-1)", transformOrigin: `${bounds.minX + width / 2}px ${bounds.minY + height / 2}px` }}
        >
          Waiting for location data...
        </text>
      )}
    </svg>
  );
}
