"use client";

import type { Weather } from "@/lib/openf1/types";

export function WeatherWidget({ weather }: { weather: Weather | null }) {
  if (!weather) return <div className="text-gray-500">No weather data</div>;

  return (
    <div className="grid grid-cols-2 gap-3 rounded-lg bg-f1-carbon p-4">
      <div>
        <div className="text-xs text-gray-400">Track</div>
        <div className="text-lg font-bold">{weather.track_temperature.toFixed(1)}°C</div>
      </div>
      <div>
        <div className="text-xs text-gray-400">Air</div>
        <div className="text-lg font-bold">{weather.air_temperature.toFixed(1)}°C</div>
      </div>
      <div>
        <div className="text-xs text-gray-400">Humidity</div>
        <div className="text-lg font-bold">{weather.humidity.toFixed(0)}%</div>
      </div>
      <div>
        <div className="text-xs text-gray-400">Wind</div>
        <div className="text-lg font-bold">{weather.wind_speed.toFixed(1)} km/h</div>
      </div>
      <div>
        <div className="text-xs text-gray-400">Rain</div>
        <div className={`text-lg font-bold ${weather.rainfall > 0 ? "text-blue-400" : ""}`}>
          {weather.rainfall > 0 ? "Yes" : "No"}
        </div>
      </div>
      <div>
        <div className="text-xs text-gray-400">Pressure</div>
        <div className="text-lg font-bold">{weather.pressure.toFixed(0)} hPa</div>
      </div>
    </div>
  );
}
