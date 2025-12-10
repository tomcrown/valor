// ============================================================================
// FILE: lib/suiDataFetcher.ts
// Fetch ONLY contract data (prices + walrus blobs) and merge with football stats
// ============================================================================

import { gqlClient, rpcClient } from "./suiClient";
import { SUI_CONFIG, mistToSui } from "../config/sui.config";
import { graphql } from "@mysten/sui/graphql/schemas/latest";
import type {
  Player,
  SeasonPeriod,
  FootballPlayerData,
  PurePlayerStats,
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
  base_value: string;
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
// Cache for Platform Data (reduce RPC calls)
// ============================================================================

let platformDataCache: any = null;
let platformDataCacheTime: number = 0;
const CACHE_DURATION = 60000; // 1 minute

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
// Extract Seasonal Contract Data from Performance History
// ============================================================================

function extractSeasonalContractData(
  performanceHistory: OnChainPerformanceRecord[],
  currentBaseValue: string,
  currentWalrusBlobId: string
): {
  early: SeasonContractData;
  mid: SeasonContractData;
  current: SeasonContractData;
} {
  const emptyData: SeasonContractData = {
    baseValueSui: 0,
    performanceScore: 0,
    walrusBlobId: "",
  };

  // If no performance history, use current base value
  if (!performanceHistory || performanceHistory.length === 0) {
    const currentValueSui = mistToSui(BigInt(currentBaseValue || "0"));
    return {
      early: {
        baseValueSui: currentValueSui,
        performanceScore: 0,
        walrusBlobId: currentWalrusBlobId,
      },
      mid: {
        baseValueSui: currentValueSui,
        performanceScore: 0,
        walrusBlobId: currentWalrusBlobId,
      },
      current: {
        baseValueSui: currentValueSui,
        performanceScore: 0,
        walrusBlobId: currentWalrusBlobId,
      },
    };
  }

  const sortedHistory = [...performanceHistory].sort(
    (a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0)
  );

  const convertRecord = (
    record: OnChainPerformanceRecord
  ): SeasonContractData => {
    try {
      const baseValueStr = String(record.base_value || "0");
      const baseValueBigInt = BigInt(baseValueStr);
      const scoreRaw = Number(record.score || 0);

      // Convert score from 0-1000 to 0-100 format
      const scoreOutOf100 = Math.round(scoreRaw / 10);

      return {
        baseValueSui: mistToSui(baseValueBigInt),
        performanceScore: scoreOutOf100,
        walrusBlobId: record.walrus_blob_id || "",
      };
    } catch (err) {
      console.warn(`⚠️ Error converting performance record:`, err);
      return emptyData;
    }
  };

  // Map records to seasons based on index
  // Early: first record, Mid: middle record, Current: latest record
  const early =
    sortedHistory.length > 0 ? convertRecord(sortedHistory[0]) : emptyData;

  const mid =
    sortedHistory.length > 1
      ? convertRecord(sortedHistory[Math.floor(sortedHistory.length / 2)])
      : early;

  const current =
    sortedHistory.length > 0
      ? convertRecord(sortedHistory[sortedHistory.length - 1])
      : emptyData;

  return { early, mid, current };
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
      value: Math.round(value),
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
): Promise<Player & { onChainSeasonData?: any; onChainError?: string }> {
  try {
    // Get player ID from contract
    const playerId = await getPlayerObjectId(footballPlayer.name);

    if (!playerId) {
      // Return football data with default values if not found on-chain
      const defaultValue = 1000; // Default price
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
      const defaultValue = 1000;
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
    const seasonData = extractSeasonalContractData(
      onChainData.performance_history || [],
      onChainData.base_value,
      onChainData.walrus_blob_id
    );

    // Get current base value in SUI
    const currentBaseValueSui = mistToSui(
      BigInt(onChainData.base_value || "0")
    );

    // Generate value history and weekly change
    const valueHistory = generateValueHistory(currentBaseValueSui);
    const weeklyChange = calculateWeeklyChange(valueHistory);

    console.log(`✅ Successfully enriched player: ${footballPlayer.name}`);
    console.log(`   Current Price: ${currentBaseValueSui} SUI`);
    console.log(`   Early Season: ${seasonData.early.baseValueSui} SUI`);
    console.log(`   Mid Season: ${seasonData.mid.baseValueSui} SUI`);

    // Merge football stats with contract data
    return {
      ...footballPlayer,
      currentValue: currentBaseValueSui, // Current season price
      weeklyChange,
      valueHistory,
      walrusProofId: onChainData.walrus_blob_id || "",
      onChainSeasonData: seasonData, // Seasonal prices + blobs
    };
  } catch (error) {
    console.error(
      `❌ Error enriching player ${footballPlayer.name}:`,
      error.message
    );

    const defaultValue = 1000;
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
  (Player & { onChainSeasonData?: any; onChainError?: string })[]
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

      const defaultValue = 1000;
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
// Get Season-Specific Base Value (in SUI) - Contract Override
// ============================================================================

export function getSeasonBaseValue(
  player: Player & { onChainSeasonData?: any },
  season: SeasonPeriod
): number {
  // PRIORITY: Use contract data if available
  if (player.onChainSeasonData && player.onChainSeasonData[season]) {
    return player.onChainSeasonData[season].baseValueSui;
  }

  // FALLBACK: Use current value
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
// Get Season-Specific Walrus Blob ID - Contract Override
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
