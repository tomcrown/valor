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
    "0xf5b1034c40ab3b1f778e0f44b917ea2f27e2352fc76960203e26b2e31c8c8e18",
  moduleName: "pulse",
  platformObjectId:
    getEnv("VITE_PULSE_PLATFORM_ID") ||
    "0x114794c3eafd36af0da2326c308c17d13592316c1acfd2429abed984051cf48d",
  registryObjectId:
    getEnv("VITE_PULSE_REGISTRY_ID") ||
    "0x19ac0a4d06858ebd9002507a38bb3e59c73c877d64539a8568b7564b5ff47d5d",

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
