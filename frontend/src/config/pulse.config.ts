export const PULSE_CONFIG = {
  packageId:
    import.meta.env.VITE_PULSE_PACKAGE_ID ||
    "0x993a2cd3486801714c21a2f03bbe602e1ceed66dc482d8a63654b75a32ebaaab",
  moduleName: "pulse",
  platformObjectId:
    import.meta.env.VITE_PULSE_PLATFORM_ID ||
    "0x82448e088a6f648fac7ec48b7de0512df7d7b4b60d2108eab5633018f794cfc4",
  registryObjectId:
    import.meta.env.VITE_PULSE_REGISTRY_ID ||
    "0x4f2d0a475e48e8ca2f84d66f45b68e2b55a464f8601f19467158d2839e8bed52",

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
    (remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
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
