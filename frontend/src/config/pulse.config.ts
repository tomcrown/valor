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
    "0x91c1cb8f6079b95e161948024351d98f64f04b89612262edea22f82fefa8eef3",
  moduleName: "pulse",
  platformObjectId:
    getEnv("VITE_PULSE_PLATFORM_ID") ||
    "0x73552c99e4ba90ce23efb114cce1a8d84d13056acb5a17681a072b58cf0f29ce",
  registryObjectId:
    getEnv("VITE_PULSE_REGISTRY_ID") ||
    "0xb44b9db07a1aca9e91b64d3cfc46cbd7b7f99257fbecdb4a55bff4bd26f79c48",

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
