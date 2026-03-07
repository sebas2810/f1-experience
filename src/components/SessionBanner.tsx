"use client";

import { useEffect, useState } from "react";
import type { Session, Meeting } from "@/lib/openf1/types";

interface SessionBannerProps {
  session: Session | null;
  meeting: Meeting | null;
}

export default function SessionBanner({ session, meeting }: SessionBannerProps) {
  const [elapsed, setElapsed] = useState("00:00:00");

  useEffect(() => {
    if (!session?.date_start) return;

    const start = new Date(session.date_start).getTime();

    function tick() {
      const now = Date.now();
      const diff = Math.max(0, now - start);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsed(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session?.date_start]);

  if (!session && !meeting) return null;

  const meetingName = meeting?.meeting_name ?? "";
  const sessionName = session?.session_name ?? "";
  const year = meeting?.year ?? session?.year ?? "";

  return (
    <div className="w-full bg-f1-carbon border-b border-gray-800 px-4 py-2 flex items-center justify-between text-sm">
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-bold text-f1-red shrink-0">LIVE</span>
        <span className="text-white font-semibold truncate">
          {meetingName} {year}
        </span>
        {sessionName && (
          <>
            <span className="text-gray-600">|</span>
            <span className="text-gray-300 truncate">{sessionName}</span>
          </>
        )}
      </div>
      <div className="font-mono text-white tabular-nums shrink-0 ml-4">
        {elapsed}
      </div>
    </div>
  );
}
