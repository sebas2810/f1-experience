import { NextRequest, NextResponse } from "next/server";
import {
  startReplay,
  playReplay,
  pauseReplay,
  setReplaySpeed,
  stopReplay,
  getReplayStatus,
} from "@/lib/openf1/replay";

export async function GET() {
  return NextResponse.json(getReplayStatus());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, sessionKey, meetingKey, speed } = body;

  switch (action) {
    case "start": {
      if (!sessionKey || !meetingKey) {
        return NextResponse.json({ error: "sessionKey and meetingKey required" }, { status: 400 });
      }
      await startReplay(sessionKey, meetingKey);
      return NextResponse.json({ ok: true, status: getReplayStatus() });
    }
    case "play":
      playReplay();
      return NextResponse.json({ ok: true, status: getReplayStatus() });
    case "pause":
      pauseReplay();
      return NextResponse.json({ ok: true, status: getReplayStatus() });
    case "speed":
      if (typeof speed !== "number" || speed < 1) {
        return NextResponse.json({ error: "speed must be a positive number" }, { status: 400 });
      }
      setReplaySpeed(speed);
      return NextResponse.json({ ok: true, status: getReplayStatus() });
    case "stop":
      stopReplay();
      return NextResponse.json({ ok: true });
    default:
      return NextResponse.json({ error: "Unknown action. Use: start, play, pause, speed, stop" }, { status: 400 });
  }
}
