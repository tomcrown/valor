// // ============================================================================
// // FILE: config/pulse.config.ts
// // Configuration for Valor Pulse voting system
// // ============================================================================

// export const PULSE_CONFIG = {
//   // Contract addresses (set after deployment)
//   platformObjectId:
//     process.env.VITE_PULSE_PLATFORM_ID ||
//     "0x82448e088a6f648fac7ec48b7de0512df7d7b4b60d2108eab5633018f794cfc4",
//   registryObjectId:
//     process.env.VITE_PULSE_REGISTRY_ID ||
//     "0x4f2d0a475e48e8ca2f84d66f45b68e2b55a464f8601f19467158d2839e8bed52",

//   // Package ID (set after deployment)
//   packageId:
//     process.env.VITE_PULSE_PACKAGE_ID ||
//     "0x993a2cd3486801714c21a2f03bbe602e1ceed66dc482d8a63654b75a32ebaaab",

//   // Module name
//   moduleName: "pulse",

//   // Voting configuration
//   voting: {
//     weekDurationDays: 7,
//     cooldownHours: 0, // No cooldown between weeks
//     minVotesToShow: 1, // Minimum votes to show percentages
//   },

//   // UI Configuration
//   ui: {
//     showVoterAddresses: false, // Privacy: don't show who voted
//     showLiveUpdates: true,
//     refreshIntervalSeconds: 10,
//     animationDuration: 300,
//   },

//   // Questions
//   questions: {
//     default: "Will {playerName} perform well next week?",
//     yesLabel: "YES - Will Perform Well",
//     noLabel: "NO - Will Underperform",
//   },
// };

// // Helper function to generate player question
// export function getPlayerQuestion(playerName: string): string {
//   return PULSE_CONFIG.questions.default.replace("{playerName}", playerName);
// }

// // Helper to check if voting is active based on timestamps
// export function isVotingActive(weekEndTime: number): boolean {
//   return Date.now() < weekEndTime;
// }

// // Helper to calculate time remaining
// export function getTimeRemaining(weekEndTime: number): {
//   days: number;
//   hours: number;
//   minutes: number;
//   seconds: number;
//   isActive: boolean;
// } {
//   const now = Date.now();
//   const diff = weekEndTime - now;

//   if (diff <= 0) {
//     return { days: 0, hours: 0, minutes: 0, seconds: 0, isActive: false };
//   }

//   const seconds = Math.floor((diff / 1000) % 60);
//   const minutes = Math.floor((diff / (1000 * 60)) % 60);
//   const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
//   const days = Math.floor(diff / (1000 * 60 * 60 * 24));

//   return { days, hours, minutes, seconds, isActive: true };
// }

// // Format time remaining as string
// export function formatTimeRemaining(weekEndTime: number): string {
//   const { days, hours, minutes, isActive } = getTimeRemaining(weekEndTime);

//   if (!isActive) return "Voting closed";

//   if (days > 0) {
//     return `${days}d ${hours}h remaining`;
//   }

//   if (hours > 0) {
//     return `${hours}h ${minutes}m remaining`;
//   }

//   return `${minutes}m remaining`;
// }

// ============================================================================
// FILE: config/pulse.config.ts
// Configuration for Valor Pulse voting system
// ============================================================================

// export const PULSE_CONFIG = {
//   // Contract addresses (set after deployment)
//   platformObjectId:
//     import.meta.env.VITE_PULSE_PLATFORM_ID ||
//     "0xdb05382208e4624bc6c34e40cfa89b73991479fbf1aa8d180ebcecd2ce51214d",

//   registryObjectId:
//     import.meta.env.VITE_PULSE_REGISTRY_ID ||
//     "0xb787e48145ea7be2fef359024dd7f2450d0cb940867796b07ace23b90dc1b8f4",

//   packageId:
//     import.meta.env.VITE_PULSE_PACKAGE_ID ||
//     "0x6b34e8fa52c3605dc617bcf9a31e0d2d6cf3193f34684e6438e719817ab60be6",

//   // Module name
//   moduleName: "pulse",

//   // Voting configuration
//   voting: {
//     weekDurationDays: 7,
//     cooldownHours: 0, // No cooldown between weeks
//     minVotesToShow: 1, // Minimum votes to show percentages
//   },

//   // UI Configuration
//   ui: {
//     showVoterAddresses: false, // Privacy: don't show who voted
//     showLiveUpdates: true,
//     refreshIntervalSeconds: 10,
//     animationDuration: 300,
//   },

//   // Questions
//   questions: {
//     default: "Will {playerName} perform well next week?",
//     yesLabel: "YES - Will Perform Well",
//     noLabel: "NO - Will Underperform",
//   },
// };

// // Helper function to generate player question
// export function getPlayerQuestion(playerName: string): string {
//   return PULSE_CONFIG.questions.default.replace("{playerName}", playerName);
// }

// // Helper to check if voting is active based on timestamps
// export function isVotingActive(weekEndTime: number): boolean {
//   return Date.now() < weekEndTime;
// }

// // Helper to calculate time remaining
// export function getTimeRemaining(weekEndTime: number): {
//   days: number;
//   hours: number;
//   minutes: number;
//   seconds: number;
//   isActive: boolean;
// } {
//   const now = Date.now();
//   const diff = weekEndTime - now;

//   if (diff <= 0) {
//     return { days: 0, hours: 0, minutes: 0, seconds: 0, isActive: false };
//   }

//   const seconds = Math.floor((diff / 1000) % 60);
//   const minutes = Math.floor((diff / (1000 * 60)) % 60);
//   const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
//   const days = Math.floor(diff / (1000 * 60 * 60 * 24));

//   return { days, hours, minutes, seconds, isActive: true };
// }

// // Format time remaining as string
// export function formatTimeRemaining(weekEndTime: number): string {
//   const { days, hours, minutes, isActive } = getTimeRemaining(weekEndTime);

//   if (!isActive) return "Voting closed";

//   if (days > 0) {
//     return `${days}d ${hours}h remaining`;
//   }

//   if (hours > 0) {
//     return `${hours}h ${minutes}m remaining`;
//   }

//   return `${minutes}m remaining`;
// }

// ============================================================================

// config/pulse.config.ts
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
