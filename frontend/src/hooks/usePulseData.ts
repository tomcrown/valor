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

    const interval = setInterval(
      fetchPulseData,
      PULSE_CONFIG.ui.refreshIntervalSeconds * 1000
    );

    return () => clearInterval(interval);
  }, [currentAccount]);

  async function fetchPulseData() {
    try {
      const client = new SuiClient({ url: SUI_CONFIG.rpcUrl });

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

      const sentimentData = await fetchPlayerSentiments(client, currentWeek);

      let userVotes = new Map<string, "yes" | "no">();
      if (currentAccount?.address) {
        userVotes = await fetchUserVotes(
          client,
          currentAccount.address,
          currentWeek
        );
      }

      const enrichedSentiments = sentimentData.map((sentiment) => ({
        ...sentiment,
        userHasVoted: userVotes.has(sentiment.playerId),
        userVote: userVotes.get(sentiment.playerId),
      }));

      setSentiments(enrichedSentiments);
      setIsLoading(false);
    } catch (error: any) {
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

async function fetchPlayerSentiments(
  client: SuiClient,
  currentWeek: number
): Promise<Omit<PlayerSentiment, "userHasVoted" | "userVote">[]> {
  if (!PULSE_CONFIG.packageId) {
    return [];
  }

  try {
    const createdEvents = await client.queryEvents({
      query: {
        MoveEventType: `${PULSE_CONFIG.packageId}::pulse::SentimentCreated`,
      },
      limit: 100,
      order: "descending",
    });

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

    if (sentimentIds.length === 0) {
      return [];
    }

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

      if (!latestUpdates.has(sentimentId)) {
        latestUpdates.set(sentimentId, data);
      }
    }

    const sentiments: Omit<PlayerSentiment, "userHasVoted" | "userVote">[] = [];

    for (const sentimentId of sentimentIds) {
      const metadata = sentimentMetadata.get(sentimentId);
      const update = latestUpdates.get(sentimentId);

      if (!metadata) continue;

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

    return sentiments;
  } catch (error) {
    return [];
  }
}

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
      continue;
    }
  }

  return sentiments;
}

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
    }

    return votes;
  } catch (error) {
    return new Map();
  }
}

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
