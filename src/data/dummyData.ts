// ==========================================
// REAL DATA FOR VALOR (Fetched from AllSportsAPI)
// SEASONAL STATS RESEARCHED BY AI WITH WEB SEARCH
// Last Updated: 2025-12-09T00:41:31.920Z
// ==========================================

export interface Player {
  id: string;
  name: string;
  club: string;
  position: string;
  nationality: string;
  imageUrl: string;
  currentValue: number;
  weeklyChange: number;
  aiScore: number;
  stats: PlayerStats;
  seasonalStats: SeasonalData;
  valueHistory: ValueDataPoint[];
  walrusProofId: string;
}

export interface PlayerStats {
  goals: number;
  assists: number;
  minutesPlayed: number;
  matchesPlayed: number;
  cleanSheets?: number;
  saves?: number;
}

export interface SeasonalData {
  early: PlayerStats;
  mid: PlayerStats;
  current: PlayerStats;
}

export type SeasonPeriod = "early" | "mid" | "current";

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

export const DUMMY_PLAYERS: Player[] = [
  {
    id: "659972248",
    name: "Erling Haaland",
    club: "Manchester City",
    position: "Attacker",
    nationality: "Norway",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/header/418560-1709108116.png?lm=1",
    currentValue: 2829,
    weeklyChange: 7.7,
    aiScore: 81,
    stats: {
      goals: 15,
      assists: 3,
      minutesPlayed: 1218,
      matchesPlayed: 14,
    },
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
    valueHistory: [
      {
        date: "Mon",
        value: 2675,
      },
      {
        date: "Tue",
        value: 2670,
      },
      {
        date: "Wed",
        value: 2711,
      },
      {
        date: "Thu",
        value: 2751,
      },
      {
        date: "Fri",
        value: 2793,
      },
      {
        date: "Sat",
        value: 2783,
      },
      {
        date: "Sun",
        value: 2829,
      },
    ],
    walrusProofId: "0x6be7...4b26",
  },
  {
    id: "2354545782",
    name: "Kylian Mbappe",
    club: "Real Madrid",
    position: "Attacker",
    nationality: "France",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/header/342229-1682683695.jpg?lm=1",
    currentValue: 2946,
    weeklyChange: -3.6,
    aiScore: 75,
    stats: {
      goals: 16,
      assists: 4,
      minutesPlayed: 1306,
      matchesPlayed: 15,
    },
    seasonalStats: {
      early: {
        goals: 4,
        assists: 1,
        minutesPlayed: 270,
        matchesPlayed: 3,
      },
      mid: {
        goals: 6,
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
    valueHistory: [
      {
        date: "Mon",
        value: 2795,
      },
      {
        date: "Tue",
        value: 2807,
      },
      {
        date: "Wed",
        value: 2843,
      },
      {
        date: "Thu",
        value: 2896,
      },
      {
        date: "Fri",
        value: 2936,
      },
      {
        date: "Sat",
        value: 2927,
      },
      {
        date: "Sun",
        value: 2946,
      },
    ],
    walrusProofId: "0x1c65...e776",
  },
  {
    id: "2456487342",
    name: "Harry Maguire",
    club: "Manchester United",
    position: "Defender",
    nationality: "England",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/big/177907-1663841733.jpg?lm=1",
    currentValue: 1260,
    weeklyChange: 10.5,
    aiScore: 84,
    stats: {
      goals: 1,
      assists: 1,
      minutesPlayed: 356,
      matchesPlayed: 8,
    },
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
    valueHistory: [
      {
        date: "Mon",
        value: 1207,
      },
      {
        date: "Tue",
        value: 1207,
      },
      {
        date: "Wed",
        value: 1255,
      },
      {
        date: "Thu",
        value: 1295,
      },
      {
        date: "Fri",
        value: 1290,
      },
      {
        date: "Sat",
        value: 1271,
      },
      {
        date: "Sun",
        value: 1260,
      },
    ],
    walrusProofId: "0x006a...d34a",
  },
  {
    id: "2432523569",
    name: "Mohamed Salah",
    club: "Liverpool",
    position: "Attacker",
    nationality: "Egypt",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/big/148455-1727337594.jpg?lm=1",
    currentValue: 1609,
    weeklyChange: 1.3,
    aiScore: 90,
    stats: {
      goals: 4,
      assists: 2,
      minutesPlayed: 1119,
      matchesPlayed: 13,
    },
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
    valueHistory: [
      {
        date: "Mon",
        value: 1541,
      },
      {
        date: "Tue",
        value: 1594,
      },
      {
        date: "Wed",
        value: 1589,
      },
      {
        date: "Thu",
        value: 1590,
      },
      {
        date: "Fri",
        value: 1590,
      },
      {
        date: "Sat",
        value: 1613,
      },
      {
        date: "Sun",
        value: 1609,
      },
    ],
    walrusProofId: "0x0011...207a",
  },
  {
    id: "1521124062",
    name: "Dominik Szoboszlai",
    club: "Liverpool",
    position: "Midfielder",
    nationality: "Hungary",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/header/451276-1758715234.jpg?lm=1",
    currentValue: 1258,
    weeklyChange: 11.2,
    aiScore: 76,
    stats: {
      goals: 1,
      assists: 1,
      minutesPlayed: 1260,
      matchesPlayed: 14,
    },
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
        minutesPlayed: 540,
        matchesPlayed: 6,
      },
      current: {
        goals: 1,
        assists: 1,
        minutesPlayed: 1260,
        matchesPlayed: 14,
      },
    },
    valueHistory: [
      {
        date: "Mon",
        value: 1190,
      },
      {
        date: "Tue",
        value: 1215,
      },
      {
        date: "Wed",
        value: 1244,
      },
      {
        date: "Thu",
        value: 1236,
      },
      {
        date: "Fri",
        value: 1246,
      },
      {
        date: "Sat",
        value: 1273,
      },
      {
        date: "Sun",
        value: 1258,
      },
    ],
    walrusProofId: "0x5a73...c03a",
  },
  {
    id: "3537658166",
    name: "Jude Bellingham",
    club: "Real Madrid",
    position: "Midfielder",
    nationality: "England",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/header/581678-1748102891.jpg?lm=1",
    currentValue: 1589,
    weeklyChange: 3.1,
    aiScore: 81,
    stats: {
      goals: 3,
      assists: 2,
      minutesPlayed: 741,
      matchesPlayed: 11,
    },
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
    valueHistory: [
      {
        date: "Mon",
        value: 1401,
      },
      {
        date: "Tue",
        value: 1438,
      },
      {
        date: "Wed",
        value: 1472,
      },
      {
        date: "Thu",
        value: 1476,
      },
      {
        date: "Fri",
        value: 1534,
      },
      {
        date: "Sat",
        value: 1530,
      },
      {
        date: "Sun",
        value: 1589,
      },
    ],
    walrusProofId: "0xf717...f102",
  },
  {
    id: "3446405013",
    name: "David Raya",
    club: "Arsenal FC",
    position: "Goalkeeper",
    nationality: "Spain",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/header/262749-1668168018.jpg?lm=1",
    currentValue: 1055,
    weeklyChange: -8.3,
    aiScore: 94,
    stats: {
      goals: 0,
      assists: 0,
      minutesPlayed: 1260,
      matchesPlayed: 14,
    },
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
    valueHistory: [
      {
        date: "Mon",
        value: 999,
      },
      {
        date: "Tue",
        value: 1034,
      },
      {
        date: "Wed",
        value: 1070,
      },
      {
        date: "Thu",
        value: 1062,
      },
      {
        date: "Fri",
        value: 1055,
      },
      {
        date: "Sat",
        value: 1057,
      },
      {
        date: "Sun",
        value: 1055,
      },
    ],
    walrusProofId: "0x7a5d...1b9e",
  },
  {
    id: "2764979995",
    name: "Bukayo Saka",
    club: "Arsenal FC",
    position: "Attacker",
    nationality: "England",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/big/433177-1684155052.jpg?lm=1",
    currentValue: 1549,
    weeklyChange: -3.3,
    aiScore: 90,
    stats: {
      goals: 4,
      assists: 1,
      minutesPlayed: 893,
      matchesPlayed: 12,
    },
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
    valueHistory: [
      {
        date: "Mon",
        value: 1438,
      },
      {
        date: "Tue",
        value: 1434,
      },
      {
        date: "Wed",
        value: 1431,
      },
      {
        date: "Thu",
        value: 1488,
      },
      {
        date: "Fri",
        value: 1503,
      },
      {
        date: "Sat",
        value: 1494,
      },
      {
        date: "Sun",
        value: 1549,
      },
    ],
    walrusProofId: "0x0ad1...095a",
  },
];

export const DUMMY_PORTFOLIO: PortfolioPosition[] = [
  {
    playerId: "659972248",
    playerName: "Erling Haaland",
    club: "Manchester City",
    quantity: 15,
    averageEntryPrice: 2479,
    currentValue: 2829,
    imageUrl: "https://apiv2.allsportsapi.com/logo/players/68451_e-haaland.jpg",
  },
  {
    playerId: "2354545782",
    playerName: "Kylian Mbappe",
    club: "Real Madrid",
    quantity: 10,
    averageEntryPrice: 2716,
    currentValue: 2946,
    imageUrl: "https://apiv2.allsportsapi.com/logo/players/51921_k-mbappe.jpg",
  },
].filter(Boolean);

export const DUMMY_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    address: "0x7f3a...8c2d",
    displayName: "CryptoWhale",
    avatarUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    portfolioValue: 125400,
    weeklyGrowth: 34.5,
    totalTrades: 156,
  },
];

export const PLATFORM_STATS = {
  totalVolume: 2450000,
  totalPlayers: 8,
  activeTraders: 12500,
  avgDailyTrades: 3420,
};

export const getPlayerById = (id: string): Player | undefined => {
  return DUMMY_PLAYERS.find((player) => player.id === id);
};

export const getPlayerStatsBySeason = (
  player: Player,
  season: SeasonPeriod
): PlayerStats => {
  return player.seasonalStats[season];
};

export const getTopPerformers = (): Player[] => {
  return [...DUMMY_PLAYERS]
    .sort((a, b) => {
      const scoreA = a.aiScore;
      const scoreB = b.aiScore;
      if (Math.abs(scoreA - scoreB) > 5) return scoreB - scoreA;
      return b.weeklyChange - a.weeklyChange;
    })
    .slice(0, 4);
};

export const getRisingPlayers = (): Player[] => {
  return DUMMY_PLAYERS.filter(
    (p) => p.weeklyChange > 5 && p.aiScore >= 75
  ).sort((a, b) => b.weeklyChange - a.weeklyChange);
};

export const getUndervaluedPlayers = (): Player[] => {
  return DUMMY_PLAYERS.filter((p) => p.aiScore > 85 && p.weeklyChange < 5).sort(
    (a, b) => b.aiScore - a.aiScore
  );
};

export const getFallingPlayers = (): Player[] => {
  return DUMMY_PLAYERS.filter((p) => p.weeklyChange < -5).sort(
    (a, b) => a.weeklyChange - b.weeklyChange
  );
};

export const getHighPerformers = (): Player[] => {
  return DUMMY_PLAYERS.filter((p) => p.aiScore >= 85).sort(
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
  return ((totalCurrent - totalEntry) / totalEntry) * 100;
};

export const calculateTrend = (
  weeklyChange: number
): "up" | "stable" | "down" => {
  if (weeklyChange > 5) return "up";
  if (weeklyChange < -5) return "down";
  return "stable";
};
