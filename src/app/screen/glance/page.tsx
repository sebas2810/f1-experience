"use client";

import { useRaceData } from "@/hooks/use-race-data";
import { GlanceTicker } from "@/components/GlanceTicker";

export default function GlanceScreen() {
  const { state } = useRaceData();

  return (
    <div className="h-screen w-screen bg-black flex items-center overflow-hidden">
      <GlanceTicker state={state} />
    </div>
  );
}
