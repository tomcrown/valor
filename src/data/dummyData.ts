// ==========================================
// PURE FOOTBALL STATS (No Prices, No Blockchain Data)
// Stats from AllSportsAPI - Updated: 2025-12-10
// ==========================================

export interface PurePlayerStats {
  goals: number;
  assists: number;
  minutesPlayed: number;
  matchesPlayed: number;
  cleanSheets?: number;
  saves?: number;
}

export interface SeasonalFootballStats {
  early: PurePlayerStats;
  mid: PurePlayerStats;
  current: PurePlayerStats;
}

export type SeasonPeriod = "early" | "mid" | "current";

// Pure football player data - NO PRICES, NO BLOCKCHAIN DATA
export interface FootballPlayerData {
  id: string;
  name: string;
  club: string;
  position: string;
  nationality: string;
  imageUrl: string;
  seasonalStats: SeasonalFootballStats;
  // AI score from GPT-4o analysis (0-100)
  aiScore: number;
}

// Contract data structure (fetched separately)
export interface ContractPlayerData {
  earlySeasonPrice: number; // in SUI
  midSeasonPrice: number; // in SUI
  currentSeasonPrice: number; // in SUI
  earlyWalrusBlobId: string;
  midWalrusBlobId: string;
  currentWalrusBlobId: string;
  weeklyChange: number; // Market change %
  valueHistory: ValueDataPoint[];
}

// Merged player data for UI
export interface Player extends FootballPlayerData {
  // Contract data merged in
  currentValue: number;
  weeklyChange: number;
  valueHistory: ValueDataPoint[];
  walrusProofId: string;
  seasonalStats: SeasonalFootballStats;
  // Contract seasonal data
  onChainSeasonData?: {
    early: {
      baseValueSui: number;
      performanceScore: number;
      walrusBlobId: string;
    };
    mid: {
      baseValueSui: number;
      performanceScore: number;
      walrusBlobId: string;
    };
    current: {
      baseValueSui: number;
      performanceScore: number;
      walrusBlobId: string;
    };
  };
  onChainError?: string;
}

export interface ValueDataPoint {
  date: string;
  value: number;
}

export interface PortfolioPosition {
  playerId: string;
  playerName: string;
  club: string;
  quantity: number;
  averageEntryPrice: number;
  currentValue: number;
  imageUrl: string;
}

export interface TradeHistoryEntry {
  id: string;
  playerName: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  timestamp: string;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName: string;
  avatarUrl: string;
  portfolioValue: number;
  weeklyGrowth: number;
  totalTrades: number;
}

// ==========================================
// PURE FOOTBALL DATA - NO PRICES
// ==========================================

export const FOOTBALL_PLAYERS: FootballPlayerData[] = [
  {
    id: "659972248",
    name: "Erling Haaland",
    club: "Manchester City",
    position: "Attacker",
    nationality: "Norway",
    imageUrl: "https://apiv2.allsportsapi.com/logo/players/68451_e-haaland.jpg",
    aiScore: 85,
    seasonalStats: {
      early: {
        goals: 4,
        assists: 1,
        minutesPlayed: 270,
        matchesPlayed: 3,
      },
      mid: {
        goals: 6,
        assists: 1,
        minutesPlayed: 540,
        matchesPlayed: 6,
      },
      current: {
        goals: 15,
        assists: 3,
        minutesPlayed: 1218,
        matchesPlayed: 14,
      },
    },
  },
  {
    id: "2354545782",
    name: "Kylian Mbappe",
    club: "Real Madrid",
    position: "Attacker",
    nationality: "France",
    imageUrl: "https://apiv2.allsportsapi.com/logo/players/51921_k-mbappe.jpg",
    aiScore: 87,
    seasonalStats: {
      early: {
        goals: 4,
        assists: 1,
        minutesPlayed: 270,
        matchesPlayed: 3,
      },
      mid: {
        goals: 7,
        assists: 2,
        minutesPlayed: 540,
        matchesPlayed: 6,
      },
      current: {
        goals: 16,
        assists: 4,
        minutesPlayed: 1306,
        matchesPlayed: 15,
      },
    },
  },
  {
    id: "2456487342",
    name: "Harry Maguire",
    club: "Manchester United",
    position: "Defender",
    nationality: "England",
    imageUrl: "https://apiv2.allsportsapi.com/logo/players/14381_h-maguire.jpg",
    aiScore: 78,
    seasonalStats: {
      early: {
        goals: 0,
        assists: 0,
        minutesPlayed: 270,
        matchesPlayed: 3,
      },
      mid: {
        goals: 1,
        assists: 1,
        minutesPlayed: 450,
        matchesPlayed: 5,
      },
      current: {
        goals: 1,
        assists: 1,
        minutesPlayed: 356,
        matchesPlayed: 8,
      },
    },
  },
  {
    id: "2432523569",
    name: "Mohamed Salah",
    club: "Liverpool",
    position: "Attacker",
    nationality: "Egypt",
    imageUrl: "https://apiv2.allsportsapi.com/logo/players/5705_m-salah.jpg",
    aiScore: 88,
    seasonalStats: {
      early: {
        goals: 1,
        assists: 1,
        minutesPlayed: 270,
        matchesPlayed: 3,
      },
      mid: {
        goals: 2,
        assists: 0,
        minutesPlayed: 540,
        matchesPlayed: 6,
      },
      current: {
        goals: 4,
        assists: 2,
        minutesPlayed: 1119,
        matchesPlayed: 13,
      },
    },
  },
  {
    id: "1521124062",
    name: "Dominik Szoboszlai",
    club: "Liverpool",
    position: "Midfielder",
    nationality: "Hungary",
    imageUrl:
      "https://apiv2.allsportsapi.com/logo/players/75735_d-szoboszlai.jpg",
    aiScore: 79,
    seasonalStats: {
      early: {
        goals: 1,
        assists: 0,
        minutesPlayed: 270,
        matchesPlayed: 3,
      },
      mid: {
        goals: 1,
        assists: 1,
        minutesPlayed: 540,
        matchesPlayed: 6,
      },
      current: {
        goals: 2,
        assists: 1,
        minutesPlayed: 1350,
        matchesPlayed: 15,
      },
    },
  },
  {
    id: "3537658166",
    name: "Jude Bellingham",
    club: "Real Madrid",
    position: "Midfielder",
    nationality: "England",
    imageUrl:
      "https://apiv2.allsportsapi.com/logo/players/110036_j-bellingham.jpg",
    aiScore: 90,
    seasonalStats: {
      early: {
        goals: 1,
        assists: 1,
        minutesPlayed: 270,
        matchesPlayed: 3,
      },
      mid: {
        goals: 2,
        assists: 1,
        minutesPlayed: 540,
        matchesPlayed: 6,
      },
      current: {
        goals: 3,
        assists: 2,
        minutesPlayed: 741,
        matchesPlayed: 11,
      },
    },
  },
  {
    id: "3446405013",
    name: "David Raya",
    club: "Arsenal FC",
    position: "Goalkeeper",
    nationality: "Spain",
    imageUrl: "https://apiv2.allsportsapi.com/logo/players/44666_d-raya.jpg",
    aiScore: 76,
    seasonalStats: {
      early: {
        goals: 0,
        assists: 0,
        minutesPlayed: 270,
        matchesPlayed: 3,
      },
      mid: {
        goals: 0,
        assists: 0,
        minutesPlayed: 540,
        matchesPlayed: 6,
      },
      current: {
        goals: 0,
        assists: 0,
        minutesPlayed: 1260,
        matchesPlayed: 14,
      },
    },
  },
  {
    id: "2764979995",
    name: "Bukayo Saka",
    club: "Arsenal FC",
    position: "Attacker",
    nationality: "England",
    imageUrl: "https://apiv2.allsportsapi.com/logo/players/86333_b-saka.jpg",
    aiScore: 76,
    seasonalStats: {
      early: {
        goals: 1,
        assists: 0,
        minutesPlayed: 270,
        matchesPlayed: 3,
      },
      mid: {
        goals: 2,
        assists: 1,
        minutesPlayed: 540,
        matchesPlayed: 6,
      },
      current: {
        goals: 4,
        assists: 1,
        minutesPlayed: 893,
        matchesPlayed: 12,
      },
    },
  },
];

// Dummy portfolio and leaderboard (unchanged)
export const DUMMY_PORTFOLIO: PortfolioPosition[] = [];
export const DUMMY_LEADERBOARD: LeaderboardEntry[] = [];

export const PLATFORM_STATS = {
  totalVolume: 2450000,
  totalPlayers: 8,
  activeTraders: 12500,
  avgDailyTrades: 3420,
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export const getFootballPlayerById = (
  id: string
): FootballPlayerData | undefined => {
  return FOOTBALL_PLAYERS.find((player) => player.id === id);
};

export const getPlayerStatsBySeason = (
  player: FootballPlayerData | Player,
  season: SeasonPeriod
): PurePlayerStats => {
  return player.seasonalStats[season];
};

export const getTopPerformers = (): FootballPlayerData[] => {
  return [...FOOTBALL_PLAYERS]
    .sort((a, b) => b.aiScore - a.aiScore)
    .slice(0, 4);
};

export const getRisingPlayers = (): FootballPlayerData[] => {
  return FOOTBALL_PLAYERS.filter((p) => p.aiScore >= 75).sort(
    (a, b) => b.aiScore - a.aiScore
  );
};

export const getUndervaluedPlayers = (): FootballPlayerData[] => {
  return FOOTBALL_PLAYERS.filter((p) => p.aiScore > 85).sort(
    (a, b) => b.aiScore - a.aiScore
  );
};

export const getFallingPlayers = (): FootballPlayerData[] => {
  return FOOTBALL_PLAYERS.filter((p) => p.aiScore < 70).sort(
    (a, b) => a.aiScore - b.aiScore
  );
};

export const getHighPerformers = (): FootballPlayerData[] => {
  return FOOTBALL_PLAYERS.filter((p) => p.aiScore >= 85).sort(
    (a, b) => b.aiScore - a.aiScore
  );
};

export const calculatePortfolioValue = (
  positions: PortfolioPosition[]
): number => {
  return positions.reduce(
    (total, pos) => total + pos.quantity * pos.currentValue,
    0
  );
};

export const calculatePortfolioPnL = (
  positions: PortfolioPosition[]
): number => {
  const totalCurrent = positions.reduce(
    (total, pos) => total + pos.quantity * pos.currentValue,
    0
  );
  const totalEntry = positions.reduce(
    (total, pos) => total + pos.quantity * pos.averageEntryPrice,
    0
  );
  return totalEntry > 0 ? ((totalCurrent - totalEntry) / totalEntry) * 100 : 0;
};

export const calculateTrend = (
  weeklyChange: number
): "up" | "stable" | "down" => {
  if (weeklyChange > 5) return "up";
  if (weeklyChange < -5) return "down";
  return "stable";
};
