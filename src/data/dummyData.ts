// ==========================================
// DUMMY DATA FOR VALOR
// Replace these with real API calls later
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

export interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName: string;
  avatarUrl: string;
  portfolioValue: number;
  weeklyGrowth: number;
  totalTrades: number;
}

export interface TradeHistoryEntry {
  id: string;
  playerName: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: string;
}

// ==========================================
// PLAYERS DATA
// ==========================================

export const DUMMY_PLAYERS: Player[] = [
  {
    id: "1",
    name: "Erling Haaland",
    club: "Manchester City",
    position: "ST",
    nationality: "Norway",
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=400&fit=crop",
    currentValue: 2450,
    weeklyChange: 12.5,
    aiScore: 94,
    stats: { goals: 27, assists: 5, minutesPlayed: 2340, matchesPlayed: 28 },
    valueHistory: [
      { date: "Mon", value: 2180 },
      { date: "Tue", value: 2220 },
      { date: "Wed", value: 2280 },
      { date: "Thu", value: 2350 },
      { date: "Fri", value: 2380 },
      { date: "Sat", value: 2420 },
      { date: "Sun", value: 2450 },
    ],
    walrusProofId: "0x7f3a...8c2d",
  },
  {
    id: "2",
    name: "Jude Bellingham",
    club: "Real Madrid",
    position: "CM",
    nationality: "England",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=400&fit=crop",
    currentValue: 2180,
    weeklyChange: 18.3,
    aiScore: 92,
    stats: { goals: 19, assists: 8, minutesPlayed: 2520, matchesPlayed: 30 },
    valueHistory: [
      { date: "Mon", value: 1840 },
      { date: "Tue", value: 1920 },
      { date: "Wed", value: 1980 },
      { date: "Thu", value: 2050 },
      { date: "Fri", value: 2100 },
      { date: "Sat", value: 2140 },
      { date: "Sun", value: 2180 },
    ],
    walrusProofId: "0x9a2b...4e1f",
  },
  {
    id: "3",
    name: "Kylian Mbappé",
    club: "Real Madrid",
    position: "LW",
    nationality: "France",
    imageUrl: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=400&fit=crop",
    currentValue: 2890,
    weeklyChange: -3.2,
    aiScore: 91,
    stats: { goals: 24, assists: 11, minutesPlayed: 2680, matchesPlayed: 32 },
    valueHistory: [
      { date: "Mon", value: 2980 },
      { date: "Tue", value: 2950 },
      { date: "Wed", value: 2920 },
      { date: "Thu", value: 2900 },
      { date: "Fri", value: 2880 },
      { date: "Sat", value: 2870 },
      { date: "Sun", value: 2890 },
    ],
    walrusProofId: "0x3c4d...7a8b",
  },
  {
    id: "4",
    name: "Vinicius Jr",
    club: "Real Madrid",
    position: "LW",
    nationality: "Brazil",
    imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=400&fit=crop",
    currentValue: 1920,
    weeklyChange: 8.7,
    aiScore: 89,
    stats: { goals: 15, assists: 12, minutesPlayed: 2450, matchesPlayed: 29 },
    valueHistory: [
      { date: "Mon", value: 1760 },
      { date: "Tue", value: 1800 },
      { date: "Wed", value: 1840 },
      { date: "Thu", value: 1870 },
      { date: "Fri", value: 1890 },
      { date: "Sat", value: 1905 },
      { date: "Sun", value: 1920 },
    ],
    walrusProofId: "0x5e6f...2c3d",
  },
  {
    id: "5",
    name: "Rodri",
    club: "Manchester City",
    position: "CDM",
    nationality: "Spain",
    imageUrl: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=400&fit=crop",
    currentValue: 1650,
    weeklyChange: 5.2,
    aiScore: 88,
    stats: { goals: 4, assists: 9, minutesPlayed: 2780, matchesPlayed: 31 },
    valueHistory: [
      { date: "Mon", value: 1570 },
      { date: "Tue", value: 1590 },
      { date: "Wed", value: 1600 },
      { date: "Thu", value: 1620 },
      { date: "Fri", value: 1635 },
      { date: "Sat", value: 1645 },
      { date: "Sun", value: 1650 },
    ],
    walrusProofId: "0x8g9h...1i2j",
  },
  {
    id: "6",
    name: "Bukayo Saka",
    club: "Arsenal",
    position: "RW",
    nationality: "England",
    imageUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=400&fit=crop",
    currentValue: 1480,
    weeklyChange: 15.4,
    aiScore: 87,
    stats: { goals: 14, assists: 13, minutesPlayed: 2620, matchesPlayed: 30 },
    valueHistory: [
      { date: "Mon", value: 1280 },
      { date: "Tue", value: 1320 },
      { date: "Wed", value: 1360 },
      { date: "Thu", value: 1400 },
      { date: "Fri", value: 1430 },
      { date: "Sat", value: 1460 },
      { date: "Sun", value: 1480 },
    ],
    walrusProofId: "0x4k5l...6m7n",
  },
  {
    id: "7",
    name: "Phil Foden",
    club: "Manchester City",
    position: "CAM",
    nationality: "England",
    imageUrl: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=400&h=400&fit=crop",
    currentValue: 1340,
    weeklyChange: -1.8,
    aiScore: 85,
    stats: { goals: 12, assists: 10, minutesPlayed: 2180, matchesPlayed: 27 },
    valueHistory: [
      { date: "Mon", value: 1365 },
      { date: "Tue", value: 1355 },
      { date: "Wed", value: 1350 },
      { date: "Thu", value: 1345 },
      { date: "Fri", value: 1342 },
      { date: "Sat", value: 1338 },
      { date: "Sun", value: 1340 },
    ],
    walrusProofId: "0x9o0p...1q2r",
  },
  {
    id: "8",
    name: "Bruno Fernandes",
    club: "Manchester United",
    position: "CAM",
    nationality: "Portugal",
    imageUrl: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&h=400&fit=crop",
    currentValue: 1120,
    weeklyChange: 22.1,
    aiScore: 84,
    stats: { goals: 10, assists: 14, minutesPlayed: 2890, matchesPlayed: 33 },
    valueHistory: [
      { date: "Mon", value: 920 },
      { date: "Tue", value: 970 },
      { date: "Wed", value: 1010 },
      { date: "Thu", value: 1050 },
      { date: "Fri", value: 1080 },
      { date: "Sat", value: 1100 },
      { date: "Sun", value: 1120 },
    ],
    walrusProofId: "0x3s4t...5u6v",
  },
];

// ==========================================
// PORTFOLIO DATA
// ==========================================

export const DUMMY_PORTFOLIO: PortfolioPosition[] = [
  {
    playerId: "1",
    playerName: "Erling Haaland",
    club: "Manchester City",
    quantity: 15,
    averageEntryPrice: 2100,
    currentValue: 2450,
    imageUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=400&fit=crop",
  },
  {
    playerId: "2",
    playerName: "Jude Bellingham",
    club: "Real Madrid",
    quantity: 10,
    averageEntryPrice: 1950,
    currentValue: 2180,
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=400&fit=crop",
  },
  {
    playerId: "6",
    playerName: "Bukayo Saka",
    club: "Arsenal",
    quantity: 20,
    averageEntryPrice: 1200,
    currentValue: 1480,
    imageUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=400&fit=crop",
  },
  {
    playerId: "4",
    playerName: "Vinicius Jr",
    club: "Real Madrid",
    quantity: 8,
    averageEntryPrice: 1850,
    currentValue: 1920,
    imageUrl: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=400&fit=crop",
  },
];

// ==========================================
// LEADERBOARD DATA
// ==========================================

export const DUMMY_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    address: "0x7f3a...8c2d",
    displayName: "CryptoWhale",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    portfolioValue: 125400,
    weeklyGrowth: 34.5,
    totalTrades: 156,
  },
  {
    rank: 2,
    address: "0x9a2b...4e1f",
    displayName: "SuiTrader",
    avatarUrl: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop",
    portfolioValue: 98700,
    weeklyGrowth: 28.3,
    totalTrades: 142,
  },
  {
    rank: 3,
    address: "0x3c4d...7a8b",
    displayName: "FootballMogul",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    portfolioValue: 87200,
    weeklyGrowth: 22.1,
    totalTrades: 98,
  },
  {
    rank: 4,
    address: "0x5e6f...2c3d",
    displayName: "DiamondHands",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    portfolioValue: 76500,
    weeklyGrowth: 19.8,
    totalTrades: 87,
  },
  {
    rank: 5,
    address: "0x8g9h...1i2j",
    displayName: "BlockchainBaller",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    portfolioValue: 65300,
    weeklyGrowth: 15.2,
    totalTrades: 76,
  },
  {
    rank: 6,
    address: "0x4k5l...6m7n",
    displayName: "TokenKing",
    avatarUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop",
    portfolioValue: 54200,
    weeklyGrowth: 12.4,
    totalTrades: 65,
  },
  {
    rank: 7,
    address: "0x9o0p...1q2r",
    displayName: "NFTCollector",
    avatarUrl: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop",
    portfolioValue: 48900,
    weeklyGrowth: 10.1,
    totalTrades: 54,
  },
  {
    rank: 8,
    address: "0x3s4t...5u6v",
    displayName: "Web3Wizard",
    avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=100&h=100&fit=crop",
    portfolioValue: 42100,
    weeklyGrowth: 8.7,
    totalTrades: 43,
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
  return [...DUMMY_PLAYERS].sort((a, b) => b.weeklyChange - a.weeklyChange).slice(0, 4);
};

export const getRisingPlayers = (): Player[] => {
  return DUMMY_PLAYERS.filter((p) => p.weeklyChange > 10);
};

export const getUndervaluedPlayers = (): Player[] => {
  return DUMMY_PLAYERS.filter((p) => p.aiScore > 85 && p.currentValue < 1500);
};

export const calculatePortfolioValue = (positions: PortfolioPosition[]): number => {
  return positions.reduce((total, pos) => total + pos.quantity * pos.currentValue, 0);
};

export const calculatePortfolioPnL = (positions: PortfolioPosition[]): number => {
  const totalCurrent = positions.reduce((total, pos) => total + pos.quantity * pos.currentValue, 0);
  const totalEntry = positions.reduce((total, pos) => total + pos.quantity * pos.averageEntryPrice, 0);
  return ((totalCurrent - totalEntry) / totalEntry) * 100;
};
