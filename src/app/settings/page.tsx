"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface HueConfig {
  bridgeIp: string;
  username: string;
  lightGroup: string;
}

export default function SettingsPage() {
  const [hueConfig, setHueConfig] = useState<HueConfig>({ bridgeIp: "", username: "", lightGroup: "0" });
  const [discovering, setDiscovering] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Load config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("hueConfig");
    if (saved) setHueConfig(JSON.parse(saved));
  }, []);

  function saveConfig(config: HueConfig) {
    setHueConfig(config);
    localStorage.setItem("hueConfig", JSON.stringify(config));
  }

  async function discoverBridge() {
    setDiscovering(true);
    try {
      const res = await fetch("/api/lighting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "discover" }),
      });
      const data = await res.json();
      if (data.bridgeIp) {
        saveConfig({ ...hueConfig, bridgeIp: data.bridgeIp });
      } else {
        setTestResult("No bridge found on network");
      }
    } catch {
      setTestResult("Discovery failed");
    }
    setDiscovering(false);
  }

  async function registerBridge() {
    setRegistering(true);
    setTestResult("Press the button on your Hue Bridge, then wait...");
    try {
      const res = await fetch("/api/lighting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", bridgeIp: hueConfig.bridgeIp }),
      });
      const data = await res.json();
      if (data.username) {
        saveConfig({ ...hueConfig, username: data.username });
        setTestResult("Registered successfully!");
      } else {
        setTestResult("Registration failed. Did you press the bridge button?");
      }
    } catch {
      setTestResult("Registration failed");
    }
    setRegistering(false);
  }

  async function testLight(flag: string) {
    const res = await fetch("/api/lighting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setFlag", flag, ...hueConfig }),
    });
    const data = await res.json();
    setTestResult(data.success ? `${flag} light set!` : "Failed to set light");
  }

  return (
    <div className="min-h-screen bg-f1-dark p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-white">&larr; Back</Link>
          <h1 className="text-2xl font-black tracking-tight">
            <span className="text-f1-red">SETTINGS</span>
          </h1>
        </div>

        {/* Philips Hue Configuration */}
        <section className="rounded-lg bg-f1-carbon p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Philips Hue Lighting</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Bridge IP Address</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hueConfig.bridgeIp}
                  onChange={e => saveConfig({ ...hueConfig, bridgeIp: e.target.value })}
                  placeholder="192.168.1.x"
                  className="flex-1 rounded bg-f1-dark border border-gray-700 px-3 py-2 text-sm"
                />
                <button
                  onClick={discoverBridge}
                  disabled={discovering}
                  className="px-4 py-2 rounded bg-f1-gray hover:bg-gray-600 text-sm disabled:opacity-50"
                >
                  {discovering ? "Searching..." : "Auto-discover"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">API Username</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hueConfig.username}
                  onChange={e => saveConfig({ ...hueConfig, username: e.target.value })}
                  placeholder="Press bridge button then click Register"
                  className="flex-1 rounded bg-f1-dark border border-gray-700 px-3 py-2 text-sm"
                />
                <button
                  onClick={registerBridge}
                  disabled={registering || !hueConfig.bridgeIp}
                  className="px-4 py-2 rounded bg-f1-gray hover:bg-gray-600 text-sm disabled:opacity-50"
                >
                  {registering ? "Registering..." : "Register"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Light Group (0 = all lights)</label>
              <input
                type="text"
                value={hueConfig.lightGroup}
                onChange={e => saveConfig({ ...hueConfig, lightGroup: e.target.value })}
                className="w-24 rounded bg-f1-dark border border-gray-700 px-3 py-2 text-sm"
              />
            </div>

            {/* Test buttons */}
            {hueConfig.bridgeIp && hueConfig.username && (
              <div>
                <div className="text-sm text-gray-400 mb-2">Test Lights</div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { flag: "GREEN", label: "Green Flag", color: "#22c55e" },
                    { flag: "YELLOW", label: "Yellow Flag", color: "#eab308" },
                    { flag: "RED", label: "Red Flag", color: "#e10600" },
                    { flag: "SAFETY_CAR", label: "Safety Car", color: "#eab308" },
                    { flag: "CHEQUERED", label: "Chequered", color: "#ffffff" },
                  ].map(({ flag, label, color }) => (
                    <button
                      key={flag}
                      onClick={() => testLight(flag)}
                      className="px-3 py-2 rounded bg-f1-gray hover:bg-gray-600 text-sm font-bold"
                      style={{ color }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {testResult && (
              <div className="text-sm text-gray-300 bg-f1-dark rounded px-3 py-2">
                {testResult}
              </div>
            )}
          </div>
        </section>

        {/* Info */}
        <section className="rounded-lg bg-f1-carbon p-6">
          <h2 className="text-lg font-bold mb-4">About</h2>
          <div className="text-sm text-gray-400 space-y-2">
            <p>F1 Experience uses the <a href="https://openf1.org" className="text-f1-red hover:underline" target="_blank" rel="noopener">OpenF1 API</a> for real-time and historical Formula 1 data.</p>
            <p>Historical data (2023+) is free. Real-time data during live sessions requires an OpenF1 subscription.</p>
            <p>Rate limits: 3 requests/second, 30 requests/minute (free tier).</p>
          </div>
        </section>
      </div>
    </div>
  );
}
