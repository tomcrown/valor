// Helper function to get env vars
function getEnv(key: string, fallback: string = ""): string {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key] ?? fallback;
  }
  return process.env[key] ?? fallback;
}

export const PULSE_POINTS_CONFIG = {
  packageId:
    getEnv("VITE_PULSE_POINTS_PACKAGE_ID") ||
    "0x91c1cb8f6079b95e161948024351d98f64f04b89612262edea22f82fefa8eef3",

  platformObjectId: getEnv("VITE_PULSE_POINTS_PLATFORM_ID") || "",

  adminCapId: getEnv("VITE_PULSE_POINTS_ADMIN_CAP_ID") || "",

  // Point rewards
  votePoints: 1,
  correctPredictionPoints: 5,
  nftSharePoints: 3,
  aiUnlockThreshold: 10,

  // Achievement milestones
  achievements: {
    firstVote: { votes: 1, bonus: 2 },
    activeVoter: { votes: 10, bonus: 5 },
    pulseChampion: { votes: 100, bonus: 20 },
    oracleAwakened: { predictions: 1, bonus: 3 },
    predictionMaster: { predictions: 10, bonus: 10 },
    firstInvestment: { nfts: 1, bonus: 5 },
    collector: { nfts: 10, bonus: 15 },
  },

  // UI configuration
  ui: {
    refreshIntervalSeconds: 30,
    leaderboardLimit: 50,
    showAchievements: true,
  },
} as const;

export const POINT_REASONS = {
  VOTE: "Vote Submission",
  CORRECT_PREDICTION: "Correct Prediction",
  NFT_PURCHASE: "NFT Share Purchase",
  ACHIEVEMENT: "Achievement Bonus",
} as const;

export const ACHIEVEMENT_NAMES = {
  FIRST_VOTE: "First Vote!",
  ACTIVE_VOTER: "Active Voter",
  PULSE_CHAMPION: "Pulse Champion",
  ORACLE_AWAKENED: "Oracle Awakened",
  PREDICTION_MASTER: "Prediction Master",
  FIRST_INVESTMENT: "First Investment",
  COLLECTOR: "Collector",
} as const;
