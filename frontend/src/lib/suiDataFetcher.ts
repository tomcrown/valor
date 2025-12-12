// ============================================================================
// FILE: lib/suiDataFetcher.ts
// Fetch contract data with proper season-specific base values
// ============================================================================

import { gqlClient, rpcClient } from "./suiClient";
import { SUI_CONFIG, mistToSui } from "../config/sui.config";
import { graphql } from "@mysten/sui/graphql/schemas/latest";
import type {
  Player,
  SeasonPeriod,
  FootballPlayerData,
} from "@/data/dummyData";
import { FOOTBALL_PLAYERS } from "@/data/dummyData";

interface SeasonContractData {
  baseValueSui: number; // In SUI, not MIST
  performanceScore: number; // 0-100 format
  walrusBlobId: string;
}

// ============================================================================
// GraphQL Queries
// ============================================================================

const getPlayerDataQuery = graphql(`
  query GetPlayerData($platformId: SuiAddress!) {
    object(address: $platformId) {
      asMoveObject {
        contents {
          json
        }
      }
    }
  }
`);

// ============================================================================
// Types for On-Chain Data
// ============================================================================

interface OnChainPlayerData {
  player_id: string;
  name: string;
  team: string;
  position: string;
  image_url: string;
  base_value: string; // Current season value
  early_season_base_value: string; // Early season value
  mid_season_base_value: string; // Mid season value
  current_season_base_value: string; // Current season value
  total_shares: string;
  circulating_shares: string;
  performance_history: OnChainPerformanceRecord[];
  walrus_blob_id: string;
  active: boolean;
  lifetime_volume: string;
  all_time_high: string;
  all_time_low: string;
}

interface OnChainPerformanceRecord {
  timestamp: string;
  score: string;
  goals: string;
  assists: string;
  rating: string;
  minutes_played: string;
  clean_sheets: string;
  walrus_blob_id: string;
  base_value: string;
}

// ============================================================================
// Cache for Platform Data
// ============================================================================

let platformDataCache: any = null;
let platformDataCacheTime: number = 0;
const CACHE_DURATION = 30000; // 30 seconds (reduced for real-time updates)

// ============================================================================
// Fetch Platform Data with Caching
// ============================================================================

async function fetchPlatformData(): Promise<any> {
  if (
    platformDataCache &&
    Date.now() - platformDataCacheTime < CACHE_DURATION
  ) {
    return platformDataCache;
  }

  try {
    const result = await gqlClient.query({
      query: getPlayerDataQuery,
      variables: {
        platformId: SUI_CONFIG.contracts.platformObjectId,
      },
    });

    if (result.data?.object?.asMoveObject?.contents?.json) {
      platformDataCache = result.data.object.asMoveObject.contents.json;
      platformDataCacheTime = Date.now();
      return platformDataCache;
    }

    const rpcResult = await rpcClient.getObject({
      id: SUI_CONFIG.contracts.platformObjectId,
      options: { showContent: true },
    });

    const content = rpcResult?.data?.content as any;
    platformDataCache = content?.fields || null;
    platformDataCacheTime = Date.now();

    return platformDataCache;
  } catch (error) {
    console.error("Failed to fetch platform data:", error);
    throw new Error(`Platform data fetch failed: ${error.message}`);
  }
}

// ============================================================================
// Get Player Object ID from Name
// ============================================================================

async function getPlayerObjectId(playerName: string): Promise<string | null> {
  try {
    const platformData = await fetchPlatformData();

    if (!platformData) {
      throw new Error("Platform data is null");
    }

    const playerNamesTable = platformData.player_names;

    if (!playerNamesTable) {
      console.error("❌ player_names table not found");
      throw new Error("player_names table not found in platform data");
    }

    const tableId = playerNamesTable.id;

    if (!tableId) {
      console.error("❌ Table ID not found in player_names");
      throw new Error("Table ID not found in player_names structure");
    }

    const fields = await rpcClient.getDynamicFields({
      parentId: tableId,
    });

    if (fields.data.length === 0) {
      console.warn(`⚠️ No players registered in contract`);
      return null;
    }

    const matchingField = fields.data.find(
      (f) => String(f.name.value).toLowerCase() === playerName.toLowerCase()
    );

    if (!matchingField) {
      console.warn(`⚠️ Player not found in contract: ${playerName}`);
      return null;
    }

    const fieldObject = await rpcClient.getDynamicFieldObject({
      parentId: tableId,
      name: matchingField.name,
    });

    if (fieldObject?.data?.content) {
      const fieldContent = fieldObject.data.content as any;
      const playerId = fieldContent?.fields?.value || fieldContent?.value;

      if (!playerId) {
        console.error("❌ Player ID not found in field object");
        return null;
      }

      return playerId;
    }

    return null;
  } catch (error) {
    console.error(
      `❌ Error getting player ID for ${playerName}:`,
      error.message
    );
    throw error;
  }
}

// ============================================================================
// Fetch Single Player Contract Data
// ============================================================================

async function fetchPlayerContractData(
  playerId: string
): Promise<OnChainPlayerData | null> {
  try {
    const platformData = await fetchPlatformData();

    if (!platformData) {
      throw new Error("Platform data is null");
    }

    const playersTable = platformData.players;

    if (!playersTable) {
      console.error("❌ players table not found");
      throw new Error("players table not found in platform data");
    }

    const tableId = playersTable.id;

    if (!tableId) {
      throw new Error("Players table ID not found");
    }

    const playerField = await rpcClient.getDynamicFieldObject({
      parentId: tableId,
      name: {
        type: "0x2::object::ID",
        value: playerId,
      },
    });

    if (!playerField?.data?.content) {
      console.error(`❌ Player data not found for ID: ${playerId}`);
      return null;
    }

    const content = playerField.data.content as any;

    let playerData =
      content?.fields?.value?.fields ||
      content?.fields?.value ||
      content?.value?.fields ||
      content?.value ||
      content?.fields;

    if (!playerData) {
      console.error("❌ Could not find player data");
      return null;
    }

    return playerData;
  } catch (error) {
    console.error(
      `❌ Error fetching player data for ${playerId}:`,
      error.message
    );
    throw error;
  }
}

// ============================================================================
// Extract Season-Specific Base Values from Contract
// ============================================================================

function extractSeasonalContractData(onChainData: OnChainPlayerData): {
  early: SeasonContractData;
  mid: SeasonContractData;
  current: SeasonContractData;
} {
  // Extract early season data
  const earlyBaseValueSui = mistToSui(
    BigInt(onChainData.early_season_base_value || "0")
  );

  // Extract mid season data
  const midBaseValueSui = mistToSui(
    BigInt(onChainData.mid_season_base_value || "0")
  );

  // Extract current season data (this is the active trading value)
  const currentBaseValueSui = mistToSui(
    BigInt(
      onChainData.current_season_base_value || onChainData.base_value || "0"
    )
  );

  // Find season-specific performance records from history
  const performanceHistory = onChainData.performance_history || [];

  // Map performance records to seasons (assuming chronological order)
  let earlyScore = 0;
  let midScore = 0;
  let currentScore = 0;
  let earlyBlobId = "";
  let midBlobId = "";
  let currentBlobId = onChainData.walrus_blob_id || "";

  if (performanceHistory.length > 0) {
    // Early season: first record
    if (performanceHistory[0]) {
      earlyScore = Math.round(Number(performanceHistory[0].score || 0) / 10);
      earlyBlobId = performanceHistory[0].walrus_blob_id || "";
    }

    // Mid season: middle record
    const midIndex = Math.floor(performanceHistory.length / 2);
    if (performanceHistory[midIndex]) {
      midScore = Math.round(
        Number(performanceHistory[midIndex].score || 0) / 10
      );
      midBlobId = performanceHistory[midIndex].walrus_blob_id || "";
    }

    // Current season: latest record
    const latestRecord = performanceHistory[performanceHistory.length - 1];
    if (latestRecord) {
      currentScore = Math.round(Number(latestRecord.score || 0) / 10);
      currentBlobId = latestRecord.walrus_blob_id || currentBlobId;
    }
  }

  return {
    early: {
      baseValueSui: earlyBaseValueSui,
      performanceScore: earlyScore,
      walrusBlobId: earlyBlobId,
    },
    mid: {
      baseValueSui: midBaseValueSui || earlyBaseValueSui, // Fallback to early if mid not set
      performanceScore: midScore || earlyScore,
      walrusBlobId: midBlobId || earlyBlobId,
    },
    current: {
      baseValueSui: currentBaseValueSui || earlyBaseValueSui, // Fallback chain
      performanceScore: currentScore || midScore || earlyScore,
      walrusBlobId: currentBlobId,
    },
  };
}

// ============================================================================
// Generate Mock Value History (7-day trend)
// ============================================================================

function generateValueHistory(
  baseValue: number
): { date: string; value: number }[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const history = [];

  for (let i = 0; i < 7; i++) {
    const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
    const value = baseValue * (1 + variance);
    history.push({
      date: days[i],
      value: Math.round(value * 1000) / 1000, // Round to 3 decimals
    });
  }

  return history;
}

// ============================================================================
// Calculate Weekly Change
// ============================================================================

function calculateWeeklyChange(
  valueHistory: { date: string; value: number }[]
): number {
  if (valueHistory.length < 2) return 0;

  const oldValue = valueHistory[0].value;
  const newValue = valueHistory[valueHistory.length - 1].value;

  return ((newValue - oldValue) / oldValue) * 100;
}

// ============================================================================
// Main Function: Merge Football Stats with Contract Data
// ============================================================================

export async function enrichPlayerWithContractData(
  footballPlayer: FootballPlayerData
): Promise<
  Player & {
    onChainSeasonData?: any;
    onChainError?: string;
    onChainPlayerId?: string;
  }
> {
  try {
    // Get player ID from contract
    const playerId = await getPlayerObjectId(footballPlayer.name);

    if (!playerId) {
      const defaultValue = 0.001; // Default price in SUI
      const valueHistory = generateValueHistory(defaultValue);

      return {
        ...footballPlayer,
        currentValue: defaultValue,
        weeklyChange: 0,
        valueHistory,
        walrusProofId: "",
        onChainError: `Player "${footballPlayer.name}" not found in contract`,
      };
    }

    // Fetch contract data
    const onChainData = await fetchPlayerContractData(playerId);

    if (!onChainData) {
      const defaultValue = 0.001;
      const valueHistory = generateValueHistory(defaultValue);

      return {
        ...footballPlayer,
        currentValue: defaultValue,
        weeklyChange: 0,
        valueHistory,
        walrusProofId: "",
        onChainError: `On-chain data not found for "${footballPlayer.name}"`,
      };
    }

    // Extract seasonal contract data (prices + blob IDs)
    const seasonData = extractSeasonalContractData(onChainData);

    // Current season value is the ACTIVE trading price
    const currentSeasonValueSui = seasonData.current.baseValueSui;

    // Generate value history and weekly change based on current season
    const valueHistory = generateValueHistory(currentSeasonValueSui);
    const weeklyChange = calculateWeeklyChange(valueHistory);

    console.log(`✅ Successfully enriched player: ${footballPlayer.name}`);
    console.log(
      `   Early Season: ${seasonData.early.baseValueSui.toFixed(4)} SUI`
    );
    console.log(`   Mid Season: ${seasonData.mid.baseValueSui.toFixed(4)} SUI`);
    console.log(
      `   Current Season: ${seasonData.current.baseValueSui.toFixed(
        4
      )} SUI (ACTIVE)`
    );
    console.log(`   On-Chain Player ID: ${playerId}`);

    // Merge football stats with contract data
    return {
      ...footballPlayer,
      currentValue: currentSeasonValueSui, // This is the ACTIVE trading price
      weeklyChange,
      valueHistory,
      walrusProofId: onChainData.walrus_blob_id || "",
      onChainSeasonData: seasonData, // All three season prices
      onChainPlayerId: playerId, // ⭐ CRITICAL: Store the on-chain player ID for transactions
    };
  } catch (error) {
    console.error(
      `❌ Error enriching player ${footballPlayer.name}:`,
      error.message
    );

    const defaultValue = 0.001;
    const valueHistory = generateValueHistory(defaultValue);

    return {
      ...footballPlayer,
      currentValue: defaultValue,
      weeklyChange: 0,
      valueHistory,
      walrusProofId: "",
      onChainError: error.message,
    };
  }
}

// ============================================================================
// Fetch All Players with Contract Data
// ============================================================================

export async function enrichAllPlayersWithContractData(): Promise<
  (Player & {
    onChainSeasonData?: any;
    onChainError?: string;
    onChainPlayerId?: string;
  })[]
> {
  const enrichedPlayers = await Promise.allSettled(
    FOOTBALL_PLAYERS.map((player) => enrichPlayerWithContractData(player))
  );

  return enrichedPlayers.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      console.error(
        `Failed to enrich player ${FOOTBALL_PLAYERS[index].name}:`,
        result.reason
      );

      const defaultValue = 0.001;
      const valueHistory = generateValueHistory(defaultValue);

      return {
        ...FOOTBALL_PLAYERS[index],
        currentValue: defaultValue,
        weeklyChange: 0,
        valueHistory,
        walrusProofId: "",
        onChainError: result.reason.message,
      };
    }
  });
}

// ============================================================================
// Get Season-Specific Base Value (in SUI) - FOR DISPLAY ONLY
// ============================================================================

export function getSeasonBaseValue(
  player: Player & { onChainSeasonData?: any },
  season: SeasonPeriod
): number {
  // PRIORITY: Use contract data if available
  if (player.onChainSeasonData && player.onChainSeasonData[season]) {
    return player.onChainSeasonData[season].baseValueSui;
  }

  // FALLBACK: Use current value (this is the active trading price)
  return player.currentValue;
}

// ============================================================================
// Get CURRENT Season Base Value (for transactions) - ALWAYS CURRENT
// ============================================================================

export function getCurrentSeasonBaseValue(
  player: Player & { onChainSeasonData?: any }
): number {
  // Always return the CURRENT season value for transactions
  if (player.onChainSeasonData && player.onChainSeasonData.current) {
    return player.onChainSeasonData.current.baseValueSui;
  }

  // Fallback to player.currentValue which should be current season
  return player.currentValue;
}

// ============================================================================
// Get Season-Specific Performance Score (0-100 format)
// ============================================================================

export function getSeasonPerformanceScore(
  player: Player & { onChainSeasonData?: any },
  season: SeasonPeriod
): number {
  // PRIORITY: Use contract performance score if available
  if (player.onChainSeasonData && player.onChainSeasonData[season]) {
    return player.onChainSeasonData[season].performanceScore;
  }

  // FALLBACK: Use AI score from football data
  return player.aiScore;
}

// ============================================================================
// Get Season-Specific Walrus Blob ID
// ============================================================================

export function getSeasonWalrusBlobId(
  player: Player & { onChainSeasonData?: any },
  season: SeasonPeriod
): string {
  // PRIORITY: Use contract blob ID if available
  if (player.onChainSeasonData && player.onChainSeasonData[season]) {
    return player.onChainSeasonData[season].walrusBlobId;
  }

  // FALLBACK: Use main walrus proof ID
  return player.walrusProofId;
}

// ============================================================================
// Helper: Get Player by ID (merged data)
// ============================================================================

export async function getPlayerById(id: string): Promise<Player | undefined> {
  const enrichedPlayers = await enrichAllPlayersWithContractData();
  return enrichedPlayers.find((player) => player.id === id);
}
