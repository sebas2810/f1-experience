"use client";

import type { RaceControlMessage } from "@/lib/openf1/types";

function flagColor(flag: string | null): string {
  switch (flag) {
    case "GREEN": return "border-green-500";
    case "YELLOW": return "border-yellow-500";
    case "DOUBLE YELLOW": return "border-yellow-600";
    case "RED": return "border-red-500";
    case "BLUE": return "border-blue-500";
    case "CHEQUERED": return "border-white";
    default: return "border-gray-600";
  }
}

export function RaceControlFeed({ messages }: { messages: RaceControlMessage[] }) {
  const sorted = [...messages].reverse();

  return (
    <div className="flex flex-col gap-1 overflow-y-auto">
      {sorted.length === 0 && (
        <div className="text-gray-500 text-sm">No race control messages</div>
      )}
      {sorted.map((msg, i) => (
        <div
          key={`${msg.date}-${i}`}
          className={`rounded border-l-4 bg-f1-carbon px-3 py-2 text-sm ${flagColor(msg.flag)}`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-gray-400 text-xs font-mono">
              {new Date(msg.date).toLocaleTimeString()}
            </span>
            {msg.flag && (
              <span className="text-xs uppercase font-bold" style={{ color: msg.flag === "RED" ? "#e10600" : msg.flag === "YELLOW" ? "#eab308" : "#22c55e" }}>
                {msg.flag}
              </span>
            )}
          </div>
          <div className="mt-1">{msg.message}</div>
        </div>
      ))}
    </div>
  );
}
