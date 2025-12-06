// ==========================================
// REAL DATA FOR VALOR (Fetched from Football API)
// Last Updated: 2025-12-05T19:27:48.812Z
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

// ==========================================
// PLAYERS DATA (FROM REAL API)
// ==========================================

export const DUMMY_PLAYERS: Player[] = [
  {
    id: "1100",
    name: "E. Haaland",
    club: "Manchester City",
    position: "Attacker",
    nationality: "Norway",
    imageUrl: "https://media.api-sports.io/football/players/1100.png",
    currentValue: 2691,
    weeklyChange: 19.6,
    aiScore: 81,
    stats: {
      goals: 27,
      assists: 5,
      minutesPlayed: 2556,
      matchesPlayed: 32,
    },
    valueHistory: [
      {
        date: "Mon",
        value: 2505,
      },
      {
        date: "Tue",
        value: 2541,
      },
      {
        date: "Wed",
        value: 2557,
      },
      {
        date: "Thu",
        value: 2590,
      },
      {
        date: "Fri",
        value: 2592,
      },
      {
        date: "Sat",
        value: 2640,
      },
      {
        date: "Sun",
        value: 2691,
      },
    ],
    walrusProofId: "0xe5e1...68dd",
  },
  {
    id: "2932",
    name: "J. Pickford",
    club: "Everton",
    position: "Goalkeeper",
    nationality: "England",
    imageUrl: "https://media.api-sports.io/football/players/2932.png",
    currentValue: 1920,
    weeklyChange: -8.5,
    aiScore: 78,
    stats: {
      goals: 0,
      assists: 0,
      minutesPlayed: 3420,
      matchesPlayed: 38,
    },
    valueHistory: [
      {
        date: "Mon",
        value: 1843,
      },
      {
        date: "Tue",
        value: 1835,
      },
      {
        date: "Wed",
        value: 1826,
      },
      {
        date: "Thu",
        value: 1883,
      },
      {
        date: "Fri",
        value: 1889,
      },
      {
        date: "Sat",
        value: 1919,
      },
      {
        date: "Sun",
        value: 1920,
      },
    ],
    walrusProofId: "0x0a0c...44c9",
  },
  {
    id: "306",
    name: "Mohamed Salah",
    club: "Liverpool",
    position: "Attacker",
    nationality: "Egypt",
    imageUrl: "https://media.api-sports.io/football/players/306.png",
    currentValue: 2671,
    weeklyChange: -7,
    aiScore: 78,
    stats: {
      goals: 18,
      assists: 10,
      minutesPlayed: 2535,
      matchesPlayed: 32,
    },
    valueHistory: [
      {
        date: "Mon",
        value: 2487,
      },
      {
        date: "Tue",
        value: 2540,
      },
      {
        date: "Wed",
        value: 2547,
      },
      {
        date: "Thu",
        value: 2603,
      },
      {
        date: "Fri",
        value: 2616,
      },
      {
        date: "Sat",
        value: 2636,
      },
      {
        date: "Sun",
        value: 2671,
      },
    ],
    walrusProofId: "0xf6b7...c281",
  },
  {
    id: "2926",
    name: "Y. Tielemans",
    club: "Aston Villa",
    position: "Midfielder",
    nationality: "Belgium",
    imageUrl: "https://media.api-sports.io/football/players/2926.png",
    currentValue: 2134,
    weeklyChange: -8.5,
    aiScore: 87,
    stats: {
      goals: 2,
      assists: 6,
      minutesPlayed: 1641,
      matchesPlayed: 32,
    },
    valueHistory: [
      {
        date: "Mon",
        value: 1975,
      },
      {
        date: "Tue",
        value: 2021,
      },
      {
        date: "Wed",
        value: 2060,
      },
      {
        date: "Thu",
        value: 2112,
      },
      {
        date: "Fri",
        value: 2098,
      },
      {
        date: "Sat",
        value: 2140,
      },
      {
        date: "Sun",
        value: 2134,
      },
    ],
    walrusProofId: "0x5654...26f9",
  },
  {
    id: "278",
    name: "Kylian Mbappé",
    club: "Paris Saint Germain",
    position: "Attacker",
    nationality: "France",
    imageUrl: "https://media.api-sports.io/football/players/278.png",
    currentValue: 1466,
    weeklyChange: 8.2,
    aiScore: 92,
    stats: {
      goals: 27,
      assists: 7,
      minutesPlayed: 2159,
      matchesPlayed: 29,
    },
    valueHistory: [
      {
        date: "Mon",
        value: 1308,
      },
      {
        date: "Tue",
        value: 1313,
      },
      {
        date: "Wed",
        value: 1362,
      },
      {
        date: "Thu",
        value: 1415,
      },
      {
        date: "Fri",
        value: 1465,
      },
      {
        date: "Sat",
        value: 1449,
      },
      {
        date: "Sun",
        value: 1466,
      },
    ],
    walrusProofId: "0x2431...d2ed",
  },
  {
    id: "882",
    name: "David de Gea",
    club: "Manchester United",
    position: "Goalkeeper",
    nationality: "Spain",
    imageUrl: "https://media.api-sports.io/football/players/882.png",
    currentValue: 1612,
    weeklyChange: -5.8,
    aiScore: 92,
    stats: {
      goals: 0,
      assists: 0,
      minutesPlayed: 0,
      matchesPlayed: 0,
    },
    valueHistory: [
      {
        date: "Mon",
        value: 1473,
      },
      {
        date: "Tue",
        value: 1468,
      },
      {
        date: "Wed",
        value: 1506,
      },
      {
        date: "Thu",
        value: 1517,
      },
      {
        date: "Fri",
        value: 1554,
      },
      {
        date: "Sat",
        value: 1553,
      },
      {
        date: "Sun",
        value: 1612,
      },
    ],
    walrusProofId: "0xa1ed...c6c3",
  },
  {
    id: "18827",
    name: "C. Sánchez",
    club: "San Lorenzo",
    position: "Midfielder",
    nationality: "Colombia",
    imageUrl: "https://media.api-sports.io/football/players/18827.png",
    currentValue: 2262,
    weeklyChange: 1.2,
    aiScore: 90,
    stats: {
      goals: 0,
      assists: 0,
      minutesPlayed: 2390,
      matchesPlayed: 36,
    },
    valueHistory: [
      {
        date: "Mon",
        value: 2230,
      },
      {
        date: "Tue",
        value: 2241,
      },
      {
        date: "Wed",
        value: 2265,
      },
      {
        date: "Thu",
        value: 2302,
      },
      {
        date: "Fri",
        value: 2282,
      },
      {
        date: "Sat",
        value: 2279,
      },
      {
        date: "Sun",
        value: 2262,
      },
    ],
    walrusProofId: "0xa9e9...0ea0",
  },
];

// ==========================================
// PORTFOLIO DATA (UPDATED WITH REAL DATA)
// ==========================================

export const DUMMY_PORTFOLIO: PortfolioPosition[] = [
  {
    playerId: "1100",
    playerName: "E. Haaland",
    club: "Manchester City",
    quantity: 15,
    averageEntryPrice: 2341,
    currentValue: 2691,
    imageUrl: "https://media.api-sports.io/football/players/1100.png",
  },
  {
    playerId: "2932",
    playerName: "J. Pickford",
    club: "Everton",
    quantity: 10,
    averageEntryPrice: 1690,
    currentValue: 1920,
    imageUrl: "https://media.api-sports.io/football/players/2932.png",
  },
  {
    playerId: "18827",
    playerName: "C. Sánchez",
    club: "San Lorenzo",
    quantity: 20,
    averageEntryPrice: 1982,
    currentValue: 2262,
    imageUrl: "https://media.api-sports.io/football/players/18827.png",
  },
  {
    playerId: "2926",
    playerName: "Y. Tielemans",
    club: "Aston Villa",
    quantity: 8,
    averageEntryPrice: 2064,
    currentValue: 2134,
    imageUrl: "https://media.api-sports.io/football/players/2926.png",
  },
];

// ==========================================
// STATS DATA
// ==========================================

export const PLATFORM_STATS = {
  totalVolume: 2450000,
  totalPlayers: 847,
  activeTraders: 12500,
  avgDailyTrades: 3420,
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

export const getPlayerById = (id: string): Player | undefined => {
  return DUMMY_PLAYERS.find((player) => player.id === id);
};

export const getTopPerformers = (): Player[] => {
  return [...DUMMY_PLAYERS]
    .sort((a, b) => {
      // Sort by AI score first (quality), then by weekly change (momentum)
      const scoreA = a.aiScore;
      const scoreB = b.aiScore;

      if (Math.abs(scoreA - scoreB) > 5) {
        return scoreB - scoreA; // Higher AI score = better
      }

      // If AI scores are similar, sort by weekly change
      return b.weeklyChange - a.weeklyChange;
    })
    .slice(0, 4);
};

export const getRisingPlayers = (): Player[] => {
  // Rising = positive weekly change AND good AI score
  return DUMMY_PLAYERS.filter(
    (p) => p.weeklyChange > 5 && p.aiScore >= 75
  ).sort((a, b) => b.weeklyChange - a.weeklyChange);
};

export const getUndervaluedPlayers = (): Player[] => {
  // Undervalued = high AI score but low/negative weekly change
  // These are players the AI thinks are good but the market hasn't caught on yet
  return DUMMY_PLAYERS.filter((p) => p.aiScore > 85 && p.weeklyChange < 5).sort(
    (a, b) => b.aiScore - a.aiScore
  );
};

export const getFallingPlayers = (): Player[] => {
  // Players with negative weekly change
  return DUMMY_PLAYERS.filter((p) => p.weeklyChange < -5).sort(
    (a, b) => a.weeklyChange - b.weeklyChange
  ); // Most negative first
};

export const getHighPerformers = (): Player[] => {
  // Players with high AI scores regardless of price movement
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
