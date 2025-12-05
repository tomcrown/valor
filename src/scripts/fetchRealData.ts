// ============================================================================
// FILE: scripts/fetchRealData.ts
// Fetches real player data from Football API and generates updated dummyData.ts
// ============================================================================

import axios from "axios";
import * as fs from "fs";

const API_KEY = "f4c0fe874a23732f7e8b5e1cdc4dbcdf";
const BASE_URL = "https://v3.football.api-sports.io";
const SEASON = 2023;

interface PlayerMapping {
  name: string;
  apiId: number;
}

const PLAYERS_TO_FETCH: PlayerMapping[] = [
  { name: "Erling Haaland", apiId: 1100 },
  { name: "Jude Bellingham", apiId: 2932 },
  { name: "Mohamed Salah", apiId: 306 },
  { name: "Dominik Szoboszlai", apiId: 2926 },
  { name: "Kylian Mbappé", apiId: 278 },
  { name: "Bruno Fernandes", apiId: 882 },
  { name: "Bukayo Saka", apiId: 18827 },
  { name: "Lamine Yamal", apiId: 55609 },
];

async function fetchPlayerData(playerId: number) {
  try {
    console.log(`🔍 Fetching player ${playerId}...`);

    const response = await axios.get(`${BASE_URL}/players`, {
      headers: { "x-apisports-key": API_KEY },
      params: { id: playerId, season: SEASON },
    });

    if (!response.data.response || response.data.response.length === 0) {
      console.log(`❌ No data found for player ${playerId}`);
      return null;
    }

    const playerData = response.data.response[0];
    const player = playerData.player;
    const stats = playerData.statistics[0]; // Primary team/league

    // Generate realistic mock values based on player quality
    const baseValue = 1000 + Math.floor(Math.random() * 2000);
    const weeklyChange = Math.random() * 30 - 10; // -10 to +20
    const aiScore = Math.floor(75 + Math.random() * 20); // 75-95

    // Generate value history (7 days)
    const valueHistory = [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let currentVal = baseValue - 200;

    for (const day of days) {
      currentVal += Math.floor(Math.random() * 80 - 20);
      valueHistory.push({ date: day, value: currentVal });
    }

    const transformedPlayer = {
      id: playerId.toString(),
      name: player.name,
      club: stats.team.name,
      position: stats.games.position || "Unknown",
      nationality: player.nationality,
      imageUrl: `https://media.api-sports.io/football/players/${playerId}.png`,
      currentValue: valueHistory[6].value, // Sunday value
      weeklyChange: parseFloat(weeklyChange.toFixed(1)),
      aiScore: aiScore,
      stats: {
        goals: stats.goals.total || 0,
        assists: stats.goals.assists || 0,
        minutesPlayed: stats.games.minutes || 0,
        matchesPlayed: stats.games.appearences || 0,
      },
      valueHistory: valueHistory,
      walrusProofId: `0x${Math.random()
        .toString(16)
        .substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`,
    };

    console.log(`✅ Fetched: ${player.name} - ${stats.team.name}`);
    return transformedPlayer;
  } catch (error: any) {
    console.error(`❌ Error fetching player ${playerId}:`, error.message);
    return null;
  }
}

async function generateDummyData() {
  console.log("🚀 Starting Real Data Fetch...\n");
  console.log("=".repeat(60));

  const players = [];

  for (const playerMapping of PLAYERS_TO_FETCH) {
    const playerData = await fetchPlayerData(playerMapping.apiId);
    if (playerData) {
      players.push(playerData);
    }
    // Respect API rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\n" + "=".repeat(60));
  console.log(
    `✅ Successfully fetched ${players.length}/${PLAYERS_TO_FETCH.length} players\n`
  );

  // Generate the updated file content
  const fileContent = generateFileContent(players);

  // Write to file
  fs.writeFileSync(
    "/Users/MAC/Documents/valor/src/data/dummyData.ts",
    fileContent
  );
  console.log("📝 Updated dummyData.ts file created!");

  return players;
}

function generateFileContent(players: any[]) {
  return `// ==========================================
// REAL DATA FOR VALOR (Fetched from Football API)
// Last Updated: ${new Date().toISOString()}
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
// PLAYERS DATA (FROM REAL API)
// ==========================================

export const DUMMY_PLAYERS: Player[] = ${JSON.stringify(players, null, 2)};

// ==========================================
// PORTFOLIO DATA (UPDATED WITH REAL DATA)
// ==========================================

export const DUMMY_PORTFOLIO: PortfolioPosition[] = [
  {
    playerId: "${players[0]?.id}",
    playerName: "${players[0]?.name}",
    club: "${players[0]?.club}",
    quantity: 15,
    averageEntryPrice: ${players[0] ? players[0].currentValue - 350 : 2100},
    currentValue: ${players[0]?.currentValue || 2450},
    imageUrl: "${players[0]?.imageUrl}",
  },
  {
    playerId: "${players[1]?.id}",
    playerName: "${players[1]?.name}",
    club: "${players[1]?.club}",
    quantity: 10,
    averageEntryPrice: ${players[1] ? players[1].currentValue - 230 : 1950},
    currentValue: ${players[1]?.currentValue || 2180},
    imageUrl: "${players[1]?.imageUrl}",
  },
  {
    playerId: "${players[6]?.id}",
    playerName: "${players[6]?.name}",
    club: "${players[6]?.club}",
    quantity: 20,
    averageEntryPrice: ${players[6] ? players[6].currentValue - 280 : 1200},
    currentValue: ${players[6]?.currentValue || 1480},
    imageUrl: "${players[6]?.imageUrl}",
  },
  {
    playerId: "${players[3]?.id}",
    playerName: "${players[3]?.name}",
    club: "${players[3]?.club}",
    quantity: 8,
    averageEntryPrice: ${players[3] ? players[3].currentValue - 70 : 1850},
    currentValue: ${players[3]?.currentValue || 1920},
    imageUrl: "${players[3]?.imageUrl}",
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
`;
}

// Run the script
generateDummyData().catch(console.error);
