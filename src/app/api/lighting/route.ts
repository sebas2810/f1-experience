import { NextRequest, NextResponse } from "next/server";
import { setLightForFlag, discoverBridge, registerUser } from "@/lib/hue/client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, bridgeIp, username, lightGroup, flag } = body;

  if (action === "discover") {
    const ip = await discoverBridge();
    return NextResponse.json({ bridgeIp: ip });
  }

  if (action === "register") {
    if (!bridgeIp) return NextResponse.json({ error: "bridgeIp required" }, { status: 400 });
    const user = await registerUser(bridgeIp);
    return NextResponse.json({ username: user });
  }

  if (action === "setFlag") {
    if (!bridgeIp || !username) {
      return NextResponse.json({ error: "bridgeIp and username required" }, { status: 400 });
    }
    const success = await setLightForFlag(
      { bridgeIp, username, lightGroup: lightGroup || "0" },
      flag || "NONE"
    );
    return NextResponse.json({ success });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
