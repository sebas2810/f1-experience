import Link from "next/link";

const screens = [
  {
    href: "/screen/dashboard",
    title: "Control Dashboard",
    description: "Session selector, race status, weather, race control feed. Best on a tablet or laptop near the TV.",
    icon: "🎛️",
  },
  {
    href: "/screen/leaderboard",
    title: "Live Leaderboard",
    description: "Full 20-driver board with gaps, tire info, and pit counts. Best on a secondary TV/monitor.",
    icon: "🏆",
  },
  {
    href: "/screen/tower",
    title: "Timing Tower",
    description: "F1-style vertical timing tower with sector colors. Best in portrait orientation.",
    icon: "⏱️",
  },
  {
    href: "/screen/top10",
    title: "Top 10 Details",
    description: "Side-by-side cards for top 10 drivers with tire strategy, telemetry, and sectors.",
    icon: "📊",
  },
  {
    href: "/screen/trackmap",
    title: "Track Map",
    description: "Live car positions on the circuit. Color-coded by team.",
    icon: "🗺️",
  },
  {
    href: "/screen/compare",
    title: "Driver Comparison",
    description: "Head-to-head driver comparison with lap times and sector analysis.",
    icon: "⚔️",
  },
  {
    href: "/screen/glance",
    title: "LED Ticker",
    description: "Scrolling LED-style ticker for Glance displays or small screens.",
    icon: "📺",
  },
  {
    href: "/settings",
    title: "Settings",
    description: "Configure Philips Hue lights, select sessions, and manage integrations.",
    icon: "⚙️",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black tracking-tight">
            <span className="text-f1-red">F1</span> Experience
          </h1>
          <p className="mt-3 text-lg text-gray-400">
            Multi-screen immersive Formula 1 dashboard
          </p>
        </div>

        {/* Screen Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {screens.map((screen) => (
            <Link
              key={screen.href}
              href={screen.href}
              className="group flex flex-col rounded-xl bg-f1-carbon p-6 transition-all hover:bg-f1-gray hover:ring-1 hover:ring-f1-red/50"
            >
              <div className="text-3xl mb-3">{screen.icon}</div>
              <h2 className="text-lg font-bold text-white group-hover:text-f1-red transition-colors">
                {screen.title}
              </h2>
              <p className="mt-2 text-sm text-gray-400 flex-1">
                {screen.description}
              </p>
              <div className="mt-4 text-xs text-gray-500 font-mono">
                {screen.href}
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Start */}
        <div className="mt-12 rounded-xl bg-f1-carbon p-6">
          <h2 className="text-lg font-bold mb-3">Quick Start</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-400">
            <li>Go to <Link href="/screen/dashboard" className="text-f1-red hover:underline">Dashboard</Link> and select a year, race weekend, and session</li>
            <li>Open each screen view on a different browser window or device</li>
            <li>All screens sync automatically via real-time data stream</li>
            <li>Configure your Philips Hue lights in <Link href="/settings" className="text-f1-red hover:underline">Settings</Link> for ambient flag colors</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
