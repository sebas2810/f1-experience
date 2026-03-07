import { NextRequest, NextResponse } from "next/server";
import { startPolling, stopPolling } from "@/lib/openf1/poller";
import { openf1 } from "@/lib/openf1/client";
import { raceStore } from "@/lib/state/race-store";

export async function GET() {
  return NextResponse.json({
    state: raceStore.getState(),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sessionKey, meetingKey } = body;

  if (!sessionKey || !meetingKey) {
    return NextResponse.json({ error: "sessionKey and meetingKey required" }, { status: 400 });
  }

  await startPolling(sessionKey, meetingKey);

  return NextResponse.json({ ok: true, sessionKey, meetingKey });
}

export async function DELETE() {
  stopPolling();
  return NextResponse.json({ ok: true });
}
