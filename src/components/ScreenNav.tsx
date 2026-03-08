"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const screens = [
  { href: "/screen/dashboard", label: "Dashboard" },
  { href: "/screen/leaderboard", label: "Leaderboard" },
  { href: "/screen/tower", label: "Tower" },
  { href: "/screen/top10", label: "Top 10" },
  { href: "/screen/trackmap", label: "Track Map" },
  { href: "/screen/compare", label: "Compare" },
  { href: "/screen/glance", label: "Ticker" },
];

interface ScreenNavProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function ScreenNav({ onToggleSidebar, sidebarOpen }: ScreenNavProps) {
  const pathname = usePathname();

  return (
    <nav className="bg-f1-carbon border-b border-gray-800 px-2 flex items-center justify-between">
      <div className="flex items-center gap-1 overflow-x-auto">
        <Link
          href="/"
          className="px-3 py-2 text-sm font-bold text-f1-red hover:text-white transition-colors shrink-0"
        >
          F1
        </Link>
        <div className="h-4 w-px bg-gray-700" />
        {screens.map((screen) => {
          const isActive = pathname === screen.href;
          return (
            <Link
              key={screen.href}
              href={screen.href}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                isActive
                  ? "text-white border-b-2 border-f1-red"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {screen.label}
            </Link>
          );
        })}
      </div>
      <button
        onClick={onToggleSidebar}
        className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors shrink-0 ${
          sidebarOpen ? "text-f1-red" : "text-gray-400 hover:text-white"
        }`}
        title="Toggle session panel"
      >
        Session
      </button>
    </nav>
  );
}
