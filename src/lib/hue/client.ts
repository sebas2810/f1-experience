export interface HueConfig {
  bridgeIp: string;
  username: string;
  lightGroup: string;
}

interface HueStatePayload {
  on: boolean;
  hue?: number;
  sat?: number;
  bri?: number;
  alert?: "none" | "select" | "lselect";
  transitiontime?: number;
}

// Hue color values (0-65535 hue, 0-254 sat/bri)
const FLAG_COLORS: Record<string, HueStatePayload> = {
  GREEN: { on: true, hue: 25500, sat: 254, bri: 200, alert: "none", transitiontime: 10 },
  YELLOW: { on: true, hue: 10000, sat: 254, bri: 254, alert: "none", transitiontime: 5 },
  RED: { on: true, hue: 0, sat: 254, bri: 254, alert: "lselect", transitiontime: 2 },
  SAFETY_CAR: { on: true, hue: 10000, sat: 254, bri: 254, alert: "lselect", transitiontime: 5 },
  VSC: { on: true, hue: 10000, sat: 200, bri: 200, alert: "select", transitiontime: 5 },
  CHEQUERED: { on: true, hue: 0, sat: 0, bri: 254, alert: "lselect", transitiontime: 2 },
  NONE: { on: true, hue: 25500, sat: 254, bri: 100, alert: "none", transitiontime: 20 },
};

export async function setLightForFlag(config: HueConfig, flag: string): Promise<boolean> {
  if (!config.bridgeIp || !config.username) return false;

  const state = FLAG_COLORS[flag] || FLAG_COLORS.NONE;
  const url = `http://${config.bridgeIp}/api/${config.username}/groups/${config.lightGroup || "0"}/action`;

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    return res.ok;
  } catch (err) {
    console.error("[Hue] Failed to set light:", err);
    return false;
  }
}

export async function discoverBridge(): Promise<string | null> {
  try {
    const res = await fetch("https://discovery.meethue.com/");
    const bridges = await res.json();
    if (Array.isArray(bridges) && bridges.length > 0) {
      return bridges[0].internalipaddress;
    }
  } catch {
    // Discovery failed
  }
  return null;
}

export async function registerUser(bridgeIp: string): Promise<string | null> {
  try {
    const res = await fetch(`http://${bridgeIp}/api`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ devicetype: "f1_experience#app" }),
    });
    const data = await res.json();
    if (Array.isArray(data) && data[0]?.success?.username) {
      return data[0].success.username;
    }
  } catch {
    // Registration failed
  }
  return null;
}
