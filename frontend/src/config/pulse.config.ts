// Helper function to get env vars that works in both Vite and Node.js
function getEnv(key: string, fallback: string = ""): string {
  // In browser/Vite, use import.meta.env
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key] ?? fallback;
  }
  // In Node.js, use process.env
  return process.env[key] ?? fallback;
}

export const PULSE_CONFIG = {
  packageId:
    getEnv("VITE_PULSE_PACKAGE_ID") ||
    "0xefa176c71da674b46125add13701be72e5550a9c54f9164f830c0cd2bcdfc743",
  moduleName: "pulse",
  platformObjectId:
    getEnv("VITE_PULSE_PLATFORM_ID") ||
    "0x280e1417bff0c58fc02a10ab5d573b2dd96bb74ee28655b084e3df20cf9f84ed",
  registryObjectId:
    getEnv("VITE_PULSE_REGISTRY_ID") ||
    "0xd276f7aded8c989d50f186f74dabfbc5c463690775270a36be4a7d9c800a7982",

  ui: {
    refreshIntervalSeconds: 30,
    votingDurationDays: 7,
  },

  weekDurationMs: 7 * 24 * 60 * 60 * 1000,
};

export const PLAYER_SENTIMENT_IDS: Record<string, string> = {};

export function getPlayerQuestion(playerName: string): string {
  const questions: Record<string, string> = {
    "Kylian Mbappé": "Will Mbappé score or assist this week?",
    "Erling Haaland": "Will Haaland score in his next match?",
    "Dominik Szoboszlai": "Will Szoboszlai create chances this week?",
    "Jude Bellingham": "Will Bellingham dominate the midfield?",
    "Harry Maguire": "Will Maguire keep a clean sheet?",
    "Mohamed Salah": "Will Salah be among the goals?",
    "Bukayo Saka": "Will Saka deliver attacking threat?",
    "David Raya": "Will Raya keep a clean sheet?",
  };

  return questions[playerName] || `Will ${playerName} perform well this week?`;
}

export function formatTimeRemaining(endTimeMs: number): string {
  const now = Date.now();
  const remaining = endTimeMs - now;

  if (remaining <= 0) return "Ended";

  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor(
    (remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000),
  );
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export function getVotingProgress(startTime: number, endTime: number): number {
  const now = Date.now();
  const total = endTime - startTime;
  const elapsed = now - startTime;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}
