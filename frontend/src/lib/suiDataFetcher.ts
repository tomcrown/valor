import { gqlClient, rpcClient } from "./suiClient";
import { SUI_CONFIG, mistToSui } from "../config/sui.config";
import { graphql } from "@mysten/sui/graphql/schemas/latest";
import type { Player, SeasonPeriod, FootballPlayerData } from "@/data/apiData";
import { FOOTBALL_PLAYERS } from "@/data/apiData";

interface SeasonContractData {
  baseValueSui: number;
  performanceScore: number;
  walrusBlobId: string;
  nautilusSignature: string; // 🔥 NEW: Hardware attestation signature
}

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

interface OnChainPlayerData {
  player_id: string;
  name: string;
  team: string;
  position: string;
  image_url: string;
  base_value: string;
  early_season_base_value: string;
  mid_season_base_value: string;
  current_season_base_value: string;

  // Walrus blob IDs for each season
  early_season_walrus_blob_id: string;
  mid_season_walrus_blob_id: string;
  current_season_walrus_blob_id: string;

  // 🔥 NEW: Nautilus signatures for each season
  early_season_nautilus_signature: string;
  mid_season_nautilus_signature: string;
  current_season_nautilus_signature: string;

  total_shares: string;
  circulating_shares: string;
  performance_history: OnChainPerformanceRecord[];
  walrus_blob_id: string;
  active: boolean;
  lifetime_volume: string;
  all_time_high: string;
  all_time_low: string;

  // Legacy fields
  nautilus_verified: boolean;
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
  season?: number | string;
  season_period?: string;
}

let platformDataCache: any = null;
let platformDataCacheTime: number = 0;
const CACHE_DURATION = 30000;

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
    throw new Error(`Platform data fetch failed: ${error.message}`);
  }
}

async function getPlayerObjectId(playerName: string): Promise<string | null> {
  try {
    const platformData = await fetchPlatformData();

    if (!platformData) {
      throw new Error("Platform data is null");
    }

    const playerNamesTable = platformData.player_names;

    if (!playerNamesTable) {
      throw new Error("player_names table not found in platform data");
    }

    const tableId = playerNamesTable.id;

    if (!tableId) {
      throw new Error("Table ID not found in player_names structure");
    }

    const fields = await rpcClient.getDynamicFields({
      parentId: tableId,
    });

    if (fields.data.length === 0) {
      return null;
    }

    const matchingField = fields.data.find(
      (f) => String(f.name.value).toLowerCase() === playerName.toLowerCase(),
    );

    if (!matchingField) {
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
        return null;
      }

      return playerId;
    }

    return null;
  } catch (error) {
    throw error;
  }
}

async function fetchPlayerContractData(
  playerId: string,
): Promise<OnChainPlayerData | null> {
  try {
    const platformData = await fetchPlatformData();

    if (!platformData) {
      throw new Error("Platform data is null");
    }

    const playersTable = platformData.players;

    if (!playersTable) {
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
      return null;
    }

    return playerData;
  } catch (error) {
    throw error;
  }
}

// 🔥 ENHANCED: Now reads Nautilus signatures for each season
function extractSeasonalContractData(onChainData: OnChainPlayerData): {
  early: SeasonContractData;
  mid: SeasonContractData;
  current: SeasonContractData;
} {
  const earlyBaseValueSui = mistToSui(
    BigInt(onChainData.early_season_base_value || "0"),
  );

  const midBaseValueSui = mistToSui(
    BigInt(onChainData.mid_season_base_value || "0"),
  );

  const currentBaseValueSui = mistToSui(
    BigInt(
      onChainData.current_season_base_value || onChainData.base_value || "0",
    ),
  );

  const performanceHistory = onChainData.performance_history || [];

  // Initialize scores
  let earlyScore = 0;
  let midScore = 0;
  let currentScore = 0;

  // Read blob IDs directly from dedicated fields
  const earlyBlobId = onChainData.early_season_walrus_blob_id || "";
  const midBlobId = onChainData.mid_season_walrus_blob_id || "";
  const currentBlobId =
    onChainData.current_season_walrus_blob_id ||
    onChainData.walrus_blob_id ||
    "";

  // 🔥 NEW: Read Nautilus signatures directly from dedicated fields
  const earlySignature = onChainData.early_season_nautilus_signature || "";
  const midSignature = onChainData.mid_season_nautilus_signature || "";
  const currentSignature = onChainData.current_season_nautilus_signature || "";

  // Match performance records to get scores
  const earlyBaseValueMist = BigInt(onChainData.early_season_base_value || "0");
  const midBaseValueMist = BigInt(onChainData.mid_season_base_value || "0");
  const currentBaseValueMist = BigInt(
    onChainData.current_season_base_value || onChainData.base_value || "0",
  );

  if (performanceHistory.length > 0) {
    for (const record of performanceHistory) {
      const recordBaseValue = BigInt(record.base_value || "0");
      const score = Number(record.score || 0);

      if (recordBaseValue === earlyBaseValueMist && earlyBaseValueMist > 0n) {
        earlyScore = score;
      } else if (
        recordBaseValue === midBaseValueMist &&
        midBaseValueMist > 0n
      ) {
        midScore = score;
      } else if (
        recordBaseValue === currentBaseValueMist &&
        currentBaseValueMist > 0n
      ) {
        currentScore = score;
      }
    }
  }

  console.log("📊 Extracted season data:");
  console.log("  Early:", {
    baseValueSui: earlyBaseValueSui,
    score: earlyScore,
    blobId: earlyBlobId || "NOT FOUND",
    signature: earlySignature
      ? `${earlySignature.slice(0, 20)}...`
      : "NOT FOUND",
  });
  console.log("  Mid:", {
    baseValueSui: midBaseValueSui,
    score: midScore,
    blobId: midBlobId || "NOT FOUND",
    signature: midSignature ? `${midSignature.slice(0, 20)}...` : "NOT FOUND",
  });
  console.log("  Current:", {
    baseValueSui: currentBaseValueSui,
    score: currentScore,
    blobId: currentBlobId || "NOT FOUND",
    signature: currentSignature
      ? `${currentSignature.slice(0, 20)}...`
      : "NOT FOUND",
  });

  return {
    early: {
      baseValueSui: earlyBaseValueSui,
      performanceScore: earlyScore,
      walrusBlobId: earlyBlobId,
      nautilusSignature: earlySignature,
    },
    mid: {
      baseValueSui: midBaseValueSui,
      performanceScore: midScore,
      walrusBlobId: midBlobId,
      nautilusSignature: midSignature,
    },
    current: {
      baseValueSui: currentBaseValueSui,
      performanceScore: currentScore,
      walrusBlobId: currentBlobId,
      nautilusSignature: currentSignature,
    },
  };
}

function generateValueHistory(
  baseValue: number,
): { date: string; value: number }[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const history = [];

  for (let i = 0; i < 7; i++) {
    const variance = (Math.random() - 0.5) * 0.1;
    const value = baseValue * (1 + variance);
    history.push({
      date: days[i],
      value: Math.round(value * 1000) / 1000,
    });
  }

  return history;
}

function calculateWeeklyChange(
  valueHistory: { date: string; value: number }[],
): number {
  if (valueHistory.length < 2) return 0;

  const oldValue = valueHistory[0].value;
  const newValue = valueHistory[valueHistory.length - 1].value;

  return ((newValue - oldValue) / oldValue) * 100;
}

export async function enrichPlayerWithContractData(
  footballPlayer: FootballPlayerData,
): Promise<
  Player & {
    onChainSeasonData?: any;
    onChainError?: string;
    onChainPlayerId?: string;
  }
> {
  try {
    const playerId = await getPlayerObjectId(footballPlayer.name);

    if (!playerId) {
      const defaultValue = 0.001;
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

    const seasonData = extractSeasonalContractData(onChainData);

    const currentSeasonValueSui = seasonData.current.baseValueSui;

    const valueHistory = generateValueHistory(currentSeasonValueSui);
    const weeklyChange = calculateWeeklyChange(valueHistory);

    return {
      ...footballPlayer,
      currentValue: currentSeasonValueSui,
      weeklyChange,
      valueHistory,
      walrusProofId: onChainData.walrus_blob_id || "",
      onChainSeasonData: seasonData,
      onChainPlayerId: playerId,
    };
  } catch (error) {
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

export async function enrichAllPlayersWithContractData(): Promise<
  (Player & {
    onChainSeasonData?: any;
    onChainError?: string;
    onChainPlayerId?: string;
  })[]
> {
  const enrichedPlayers = await Promise.allSettled(
    FOOTBALL_PLAYERS.map((player) => enrichPlayerWithContractData(player)),
  );

  return enrichedPlayers.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
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

export function getSeasonBaseValue(
  player: Player & { onChainSeasonData?: any },
  season: SeasonPeriod,
): number {
  if (player.onChainSeasonData && player.onChainSeasonData[season]) {
    return player.onChainSeasonData[season].baseValueSui;
  }

  return player.currentValue;
}

export function getCurrentSeasonBaseValue(
  player: Player & { onChainSeasonData?: any },
): number {
  if (player.onChainSeasonData && player.onChainSeasonData.current) {
    return player.onChainSeasonData.current.baseValueSui;
  }

  return player.currentValue;
}

export function getSeasonPerformanceScore(
  player: Player & { onChainSeasonData?: any },
  season: SeasonPeriod,
): number {
  if (player.onChainSeasonData && player.onChainSeasonData[season]) {
    return player.onChainSeasonData[season].performanceScore;
  }

  return player.aiScore;
}

export function getSeasonWalrusBlobId(
  player: Player & { onChainSeasonData?: any },
  season: SeasonPeriod,
): string {
  if (player.onChainSeasonData && player.onChainSeasonData[season]) {
    const blobId = player.onChainSeasonData[season].walrusBlobId;

    if (!blobId) {
      console.warn(`⚠️ No blob ID found for ${season} season`);
      return "";
    }

    return blobId;
  }

  if (season === "current" && player.walrusProofId) {
    return player.walrusProofId;
  }

  console.warn(`⚠️ No blob ID found for ${season} season`);
  return "";
}

// 🔥 NEW: Get Nautilus signature for a specific season
export function getSeasonNautilusSignature(
  player: Player & { onChainSeasonData?: any },
  season: SeasonPeriod,
): string {
  if (player.onChainSeasonData && player.onChainSeasonData[season]) {
    const signature = player.onChainSeasonData[season].nautilusSignature;

    if (!signature) {
      console.warn(`⚠️ No Nautilus signature found for ${season} season`);
      return "";
    }

    return signature;
  }

  console.warn(`⚠️ No Nautilus signature found for ${season} season`);
  return "";
}

export async function getPlayerById(id: string): Promise<Player | undefined> {
  const enrichedPlayers = await enrichAllPlayersWithContractData();
  return enrichedPlayers.find((player) => player.id === id);
}
