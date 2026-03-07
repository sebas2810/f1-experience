export interface TeamInfo {
  name: string;
  color: string;
  secondaryColor: string;
}

// 2024-2025 team colors (will auto-update from API driver data when available)
export const TEAM_COLORS: Record<string, TeamInfo> = {
  "Red Bull Racing": { name: "Red Bull Racing", color: "#3671C6", secondaryColor: "#FFD700" },
  "Ferrari": { name: "Ferrari", color: "#E8002D", secondaryColor: "#FFF200" },
  "McLaren": { name: "McLaren", color: "#FF8000", secondaryColor: "#FFFFFF" },
  "Mercedes": { name: "Mercedes", color: "#27F4D2", secondaryColor: "#000000" },
  "Aston Martin": { name: "Aston Martin", color: "#229971", secondaryColor: "#FFFFFF" },
  "Alpine": { name: "Alpine", color: "#FF87BC", secondaryColor: "#0093CC" },
  "Williams": { name: "Williams", color: "#64C4FF", secondaryColor: "#FFFFFF" },
  "RB": { name: "RB", color: "#6692FF", secondaryColor: "#FFFFFF" },
  "Kick Sauber": { name: "Kick Sauber", color: "#52E252", secondaryColor: "#000000" },
  "Haas F1 Team": { name: "Haas F1 Team", color: "#B6BABD", secondaryColor: "#FFFFFF" },
};

export function getTeamColor(teamName: string): string {
  // Try exact match first, then partial match
  if (TEAM_COLORS[teamName]) return TEAM_COLORS[teamName].color;
  const key = Object.keys(TEAM_COLORS).find(k =>
    teamName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(teamName.toLowerCase())
  );
  return key ? TEAM_COLORS[key].color : "#FFFFFF";
}

export const TIRE_COLORS: Record<string, string> = {
  SOFT: "#ff3333",
  MEDIUM: "#f5c542",
  HARD: "#e0e0e0",
  INTERMEDIATE: "#39b54a",
  WET: "#2196f3",
  UNKNOWN: "#888888",
};
