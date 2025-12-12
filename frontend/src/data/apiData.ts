// Stats from AllSportsAPI - Updated: 2025-12-10

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

export interface FootballPlayerData {
  id: string;
  name: string;
  club: string;
  position: string;
  nationality: string;
  imageUrl: string;
  nftImageUrl: string;
  seasonalStats: SeasonalFootballStats;
  aiScore: number;
}

export interface ContractPlayerData {
  earlySeasonPrice: number;
  midSeasonPrice: number;
  currentSeasonPrice: number;
  earlyWalrusBlobId: string;
  midWalrusBlobId: string;
  currentWalrusBlobId: string;
  weeklyChange: number;
  valueHistory: ValueDataPoint[];
}

export interface Player extends FootballPlayerData {
  currentValue: number;
  weeklyChange: number;
  valueHistory: ValueDataPoint[];
  walrusProofId: string;
  seasonalStats: SeasonalFootballStats;
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

export const FOOTBALL_PLAYERS: FootballPlayerData[] = [
  {
    id: "659972248",
    name: "Erling Haaland",
    club: "Manchester City",
    position: "Attacker",
    nationality: "Norway",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/big/418560-1709108116.png?lm=1",
    nftImageUrl:
      "https://raw.githubusercontent.com/tomcrown/valor_images/main/haaland.png",
    aiScore: 85,
    seasonalStats: {
      early: {
        goals: 3,
        assists: 1,
        minutesPlayed: 270,
        matchesPlayed: 3,
      },
      mid: {
        goals: 8,
        assists: 1,
        minutesPlayed: 540,
        matchesPlayed: 6,
      },
      current: {
        goals: 15,
        assists: 3,
        minutesPlayed: 1218,
        matchesPlayed: 15,
      },
    },
  },
  {
    id: "2354545782",
    name: "Kylian Mbappe",
    club: "Real Madrid",
    position: "Attacker",
    nationality: "France",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/big/342229-1682683695.jpg?lm=1",
    nftImageUrl:
      "https://raw.githubusercontent.com/tomcrown/valor_images/main/mbappe.png",
    aiScore: 87,
    seasonalStats: {
      early: {
        goals: 3,
        assists: 0,
        minutesPlayed: 270,
        matchesPlayed: 3,
      },
      mid: {
        goals: 7,
        assists: 1,
        minutesPlayed: 540,
        matchesPlayed: 6,
      },
      current: {
        goals: 16,
        assists: 4,
        minutesPlayed: 1398,
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
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/big/177907-1663841733.jpg?lm=1",
    nftImageUrl:
      "https://raw.githubusercontent.com/tomcrown/valor_images/main/maguire.png",
    aiScore: 78,
    seasonalStats: {
      early: {
        goals: 0,
        assists: 0,
        minutesPlayed: 270,
        matchesPlayed: 3,
      },
      mid: {
        goals: 0,
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
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/big/148455-1727337594.jpg?lm=1",
    nftImageUrl:
      "https://raw.githubusercontent.com/tomcrown/valor_images/main/salah.png",
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
        assists: 2,
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
      "https://img.a.transfermarkt.technology/portrait/big/451276-1758715234.jpg?lm=1",
    nftImageUrl:
      "https://raw.githubusercontent.com/tomcrown/valor_images/main/dominik.png",
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
        assists: 0,
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
      "https://img.a.transfermarkt.technology/portrait/big/581678-1748102891.jpg?lm=1",
    nftImageUrl:
      "https://raw.githubusercontent.com/tomcrown/valor_images/main/valor-bellingham.png",
    aiScore: 90,
    seasonalStats: {
      early: {
        goals: 0,
        assists: 0,
        minutesPlayed: 0,
        matchesPlayed: 0,
      },
      mid: {
        goals: 0,
        assists: 0,
        minutesPlayed: 0,
        matchesPlayed: 0,
      },
      current: {
        goals: 3,
        assists: 2,
        minutesPlayed: 741,
        matchesPlayed: 12,
      },
    },
  },
  {
    id: "3446405013",
    name: "David Raya",
    club: "Arsenal FC",
    position: "Goalkeeper",
    nationality: "Spain",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/big/262749-1668168018.jpg?lm=1",
    nftImageUrl:
      "https://raw.githubusercontent.com/tomcrown/valor_images/main/raya.png",
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
        minutesPlayed: 1350,
        matchesPlayed: 15,
      },
    },
  },
  {
    id: "2764979995",
    name: "Bukayo Saka",
    club: "Arsenal FC",
    position: "Attacker",
    nationality: "England",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/big/433177-1684155052.jpg?lm=1",
    nftImageUrl:
      "https://raw.githubusercontent.com/tomcrown/valor_images/main/saka.png",
    aiScore: 76,
    seasonalStats: {
      early: {
        goals: 1,
        assists: 0,
        minutesPlayed: 180,
        matchesPlayed: 2,
      },
      mid: {
        goals: 1,
        assists: 0,
        minutesPlayed: 360,
        matchesPlayed: 4,
      },
      current: {
        goals: 4,
        assists: 1,
        minutesPlayed: 893,
        matchesPlayed: 13,
      },
    },
  },
];

export const API_PORTFOLIO: PortfolioPosition[] = [];
export const API_LEADERBOARD: LeaderboardEntry[] = [];

export const PLATFORM_STATS = {
  totalVolume: 24500,
  totalPlayers: 8,
  activeTraders: 1250,
  avgDailyTrades: 342,
};

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
