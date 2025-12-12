// ============================================================================
// FILE: hooks/usePulseData.ts
// React hook for fetching Pulse voting data
// FINAL VERSION - Works with improved contract that emits sentiment IDs
// ============================================================================

import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { PULSE_CONFIG } from "@/config/pulse.config";
import { SUI_CONFIG } from "@/config/sui.config";

export interface PlayerSentiment {
  objectId: string;
  playerId: string;
  playerName: string;
  week: number;
  yesCount: number;
  noCount: number;
  totalVotes: number;
  yesPercentage: number;
  noPercentage: number;
  walrusBlobId: string;
  userHasVoted: boolean;
  userVote?: "yes" | "no";
  createdAt: number;
  updatedAt: number;
}

export interface PulsePlatformState {
  currentWeek: number;
  weekStartTime: number;
  weekEndTime: number;
  active: boolean;
  totalVotes: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Main hook for fetching all Pulse data
 */
export function usePulseData() {
  const currentAccount = useCurrentAccount();
  const [platformState, setPlatformState] = useState<PulsePlatformState>({
    currentWeek: 0,
    weekStartTime: 0,
    weekEndTime: 0,
    active: false,
    totalVotes: 0,
    isLoading: true,
    error: null,
  });
  const [sentiments, setSentiments] = useState<PlayerSentiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!PULSE_CONFIG.platformObjectId) {
      setPlatformState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Pulse platform not configured",
      }));
      setIsLoading(false);
      return;
    }

    fetchPulseData();

    // Set up polling for live updates
    const interval = setInterval(
      fetchPulseData,
      PULSE_CONFIG.ui.refreshIntervalSeconds * 1000
    );

    return () => clearInterval(interval);
  }, [currentAccount]);

  async function fetchPulseData() {
    try {
      const client = new SuiClient({ url: SUI_CONFIG.rpcUrl });

      // 1. Fetch platform state
      const platformObj = await client.getObject({
        id: PULSE_CONFIG.platformObjectId,
        options: { showContent: true },
      });

      if (platformObj.data?.content?.dataType !== "moveObject") {
        throw new Error("Invalid platform object");
      }

      const fields = (platformObj.data.content as any).fields;
      const currentWeek = parseInt(fields.current_week);

      setPlatformState({
        currentWeek,
        weekStartTime: parseInt(fields.week_start_time),
        weekEndTime: parseInt(fields.week_end_time),
        active: fields.active,
        totalVotes: parseInt(fields.total_votes),
        isLoading: false,
        error: null,
      });

      // 2. Fetch all PlayerSentiment objects for current week
      const sentimentData = await fetchPlayerSentiments(client, currentWeek);

      // 3. If user is connected, check their vote receipts
      let userVotes = new Map<string, "yes" | "no">();
      if (currentAccount?.address) {
        userVotes = await fetchUserVotes(
          client,
          currentAccount.address,
          currentWeek
        );
      }

      // 4. Merge sentiment data with user vote data
      const enrichedSentiments = sentimentData.map((sentiment) => ({
        ...sentiment,
        userHasVoted: userVotes.has(sentiment.playerId),
        userVote: userVotes.get(sentiment.playerId),
      }));

      setSentiments(enrichedSentiments);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Failed to fetch pulse data:", error);
      setPlatformState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
      setIsLoading(false);
    }
  }

  return {
    platformState,
    sentiments,
    isLoading,
    refetch: fetchPulseData,
  };
}

/**
 * Fetch all PlayerSentiment objects for the current week
 * Uses SentimentCreated and SentimentUpdated events from improved contract
 */
async function fetchPlayerSentiments(
  client: SuiClient,
  currentWeek: number
): Promise<Omit<PlayerSentiment, "userHasVoted" | "userVote">[]> {
  if (!PULSE_CONFIG.packageId) {
    console.warn("Pulse package ID not configured");
    return [];
  }

  try {
    console.log(`📊 Fetching sentiments for week ${currentWeek}...`);

    // Step 1: Get all SentimentCreated events for current week
    // This gives us the initial sentiment object IDs
    const createdEvents = await client.queryEvents({
      query: {
        MoveEventType: `${PULSE_CONFIG.packageId}::pulse::SentimentCreated`,
      },
      limit: 100, // Adjust based on expected player count
      order: "descending",
    });

    console.log(
      `📊 Found ${createdEvents.data.length} SentimentCreated events`
    );

    // Extract sentiment IDs for current week
    const sentimentIds: string[] = [];
    const sentimentMetadata = new Map<string, any>();

    for (const event of createdEvents.data) {
      const data = event.parsedJson as any;
      const week = parseInt(data.week);

      if (week === currentWeek) {
        const sentimentId = data.sentiment_id;
        sentimentIds.push(sentimentId);
        sentimentMetadata.set(sentimentId, {
          playerId: data.player_id,
          playerName: data.player_name,
          createdAt: parseInt(data.timestamp),
        });
      }
    }

    console.log(
      `✅ Found ${sentimentIds.length} sentiments for week ${currentWeek}`
    );

    if (sentimentIds.length === 0) {
      return [];
    }

    // Step 2: Get latest vote counts from SentimentUpdated events
    // This gives us the current yes/no counts without fetching objects
    const updatedEvents = await client.queryEvents({
      query: {
        MoveEventType: `${PULSE_CONFIG.packageId}::pulse::SentimentUpdated`,
      },
      limit: 1000,
      order: "descending",
    });

    const latestUpdates = new Map<string, any>();

    for (const event of updatedEvents.data) {
      const data = event.parsedJson as any;
      const sentimentId = data.sentiment_id;

      // Only track latest update for each sentiment
      if (!latestUpdates.has(sentimentId)) {
        latestUpdates.set(sentimentId, data);
      }
    }

    // Step 3: Combine metadata with latest updates
    const sentiments: Omit<PlayerSentiment, "userHasVoted" | "userVote">[] = [];

    for (const sentimentId of sentimentIds) {
      const metadata = sentimentMetadata.get(sentimentId);
      const update = latestUpdates.get(sentimentId);

      if (!metadata) continue;

      // Use update data if available, otherwise use defaults
      const yesCount = update ? parseInt(update.yes_count) : 0;
      const noCount = update ? parseInt(update.no_count) : 0;
      const totalVotes = yesCount + noCount;

      sentiments.push({
        objectId: sentimentId,
        playerId: metadata.playerId,
        playerName: metadata.playerName,
        week: currentWeek,
        yesCount,
        noCount,
        totalVotes,
        yesPercentage:
          totalVotes > 0 ? Math.round((yesCount / totalVotes) * 100) : 0,
        noPercentage:
          totalVotes > 0 ? Math.round((noCount / totalVotes) * 100) : 0,
        walrusBlobId: update?.walrus_blob_id || "",
        createdAt: metadata.createdAt,
        updatedAt: update ? parseInt(update.timestamp) : metadata.createdAt,
      });
    }

    console.log(`✅ Loaded ${sentiments.length} complete sentiments`);
    return sentiments;
  } catch (error) {
    console.error("Failed to fetch sentiments:", error);
    return [];
  }
}

/**
 * Alternative: Fetch sentiments by directly querying objects (if you have IDs)
 * This is more reliable but requires knowing the object IDs upfront
 */
async function fetchPlayerSentimentsByIds(
  client: SuiClient,
  sentimentObjectIds: string[],
  currentWeek: number
): Promise<Omit<PlayerSentiment, "userHasVoted" | "userVote">[]> {
  const sentiments: Omit<PlayerSentiment, "userHasVoted" | "userVote">[] = [];

  for (const objectId of sentimentObjectIds) {
    try {
      const obj = await client.getObject({
        id: objectId,
        options: { showContent: true },
      });

      if (!obj.data?.content || obj.data.content.dataType !== "moveObject") {
        continue;
      }

      const fields = (obj.data.content as any).fields;
      const week = parseInt(fields.week);

      if (week !== currentWeek) {
        continue;
      }

      const yesCount = parseInt(fields.yes_count);
      const noCount = parseInt(fields.no_count);
      const totalVotes = yesCount + noCount;

      sentiments.push({
        objectId: obj.data.objectId,
        playerId: fields.player_id,
        playerName: fields.player_name,
        week,
        yesCount,
        noCount,
        totalVotes,
        yesPercentage:
          totalVotes > 0 ? Math.round((yesCount / totalVotes) * 100) : 0,
        noPercentage:
          totalVotes > 0 ? Math.round((noCount / totalVotes) * 100) : 0,
        walrusBlobId: fields.walrus_blob_id || "",
        createdAt: parseInt(fields.created_at),
        updatedAt: parseInt(fields.updated_at),
      });
    } catch (err) {
      console.error(`Error fetching sentiment ${objectId}:`, err);
      continue;
    }
  }

  return sentiments;
}

/**
 * Fetch user's vote receipts to determine what they've voted on
 */
async function fetchUserVotes(
  client: SuiClient,
  userAddress: string,
  currentWeek: number
): Promise<Map<string, "yes" | "no">> {
  if (!PULSE_CONFIG.packageId) {
    return new Map();
  }

  try {
    const response = await client.getOwnedObjects({
      owner: userAddress,
      filter: {
        StructType: `${PULSE_CONFIG.packageId}::pulse::VoteReceipt`,
      },
      options: {
        showContent: true,
      },
    });

    console.log(`🎫 Found ${response.data.length} vote receipts for user`);

    const votes = new Map<string, "yes" | "no">();

    for (const obj of response.data) {
      if (!obj.data?.content || obj.data.content.dataType !== "moveObject") {
        continue;
      }

      const fields = (obj.data.content as any).fields;
      const week = parseInt(fields.week);

      if (week !== currentWeek) {
        continue;
      }

      const playerId = fields.player_id;
      const vote = fields.vote ? "yes" : "no";

      votes.set(playerId, vote);
      console.log(
        `  ✓ User voted ${vote.toUpperCase()} for player ${playerId}`
      );
    }

    console.log(`✅ User has voted on ${votes.size} players this week`);
    return votes;
  } catch (error) {
    console.error("Failed to fetch user votes:", error);
    return new Map();
  }
}

/**
 * Hook for fetching a single player's sentiment
 */
export function usePlayerSentiment(sentimentObjectId?: string) {
  const [sentiment, setSentiment] = useState<PlayerSentiment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentAccount = useCurrentAccount();

  useEffect(() => {
    if (!sentimentObjectId) {
      setIsLoading(false);
      return;
    }

    fetchSentiment();
  }, [sentimentObjectId, currentAccount]);

  async function fetchSentiment() {
    if (!sentimentObjectId) return;

    try {
      const client = new SuiClient({ url: SUI_CONFIG.rpcUrl });

      const obj = await client.getObject({
        id: sentimentObjectId,
        options: { showContent: true },
      });

      if (obj.data?.content?.dataType !== "moveObject") {
        throw new Error("Invalid sentiment object");
      }

      const fields = (obj.data.content as any).fields;

      const yesCount = parseInt(fields.yes_count);
      const noCount = parseInt(fields.no_count);
      const totalVotes = yesCount + noCount;
      const currentWeek = parseInt(fields.week);
      const playerId = fields.player_id;

      let userHasVoted = false;
      let userVote: "yes" | "no" | undefined;

      if (currentAccount?.address && PULSE_CONFIG.packageId) {
        const userVotes = await fetchUserVotes(
          client,
          currentAccount.address,
          currentWeek
        );
        userHasVoted = userVotes.has(playerId);
        userVote = userVotes.get(playerId);
      }

      setSentiment({
        objectId: sentimentObjectId,
        playerId,
        playerName: fields.player_name,
        week: currentWeek,
        yesCount,
        noCount,
        totalVotes,
        yesPercentage:
          totalVotes > 0 ? Math.round((yesCount / totalVotes) * 100) : 0,
        noPercentage:
          totalVotes > 0 ? Math.round((noCount / totalVotes) * 100) : 0,
        walrusBlobId: fields.walrus_blob_id || "",
        userHasVoted,
        userVote,
        createdAt: parseInt(fields.created_at),
        updatedAt: parseInt(fields.updated_at),
      });

      setIsLoading(false);
    } catch (err: any) {
      console.error("Failed to fetch sentiment:", err);
      setError(err.message);
      setIsLoading(false);
    }
  }

  return {
    sentiment,
    isLoading,
    error,
    refetch: fetchSentiment,
  };
}
