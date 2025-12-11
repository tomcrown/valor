// ============================================================================
// FILE: lib/pulseDataUtils.ts
// Utility functions for querying Pulse sentiment data
// FIXED VERSION
// ============================================================================

import { SuiClient } from "@mysten/sui/client";
import { SUI_CONFIG } from "@/config/sui.config";
import { PULSE_CONFIG } from "@/config/pulse.config";

/**
 * Find sentiment object ID for a specific player in a specific week
 * Useful when you know the player ID but not the sentiment object ID
 */
export async function findSentimentForPlayer(
  playerId: string,
  week: number
): Promise<string | null> {
  try {
    const client = new SuiClient({ url: SUI_CONFIG.rpcUrl });

    if (!PULSE_CONFIG.packageId) {
      console.error("Pulse package ID not configured");
      return null;
    }

    // Query all PlayerSentiment objects
    // NOTE: getOwnedObjects requires an owner, but for finding sentiments
    // we need to query by type. Use getDynamicFields or multiGetObjects instead
    // For now, we'll need the platform/registry to get all sentiments

    // Alternative: Query events or use a different approach
    // This is a limitation - we need the owner address or use dynamic fields

    console.warn(
      "This function requires platform object access - use getAllActiveSentiments instead"
    );
    return null;
  } catch (error) {
    console.error("Error finding sentiment:", error);
    return null;
  }
}

/**
 * Get all active sentiments for the current week
 * Note: This requires knowing where sentiments are stored
 */
export async function getAllActiveSentiments(currentWeek: number) {
  try {
    const client = new SuiClient({ url: SUI_CONFIG.rpcUrl });

    if (!PULSE_CONFIG.packageId || !PULSE_CONFIG.platformObjectId) {
      return [];
    }

    // Fetch platform object to get registry
    const platformObj = await client.getObject({
      id: PULSE_CONFIG.platformObjectId,
      options: { showContent: true },
    });

    if (platformObj.data?.content?.dataType !== "moveObject") {
      throw new Error("Invalid platform object");
    }

    const sentiments = [];

    // You'll need to access dynamic fields or use a different query method
    // This is a placeholder - actual implementation depends on your Move contract structure

    console.log("Fetching sentiments for week:", currentWeek);

    return sentiments;
  } catch (error) {
    console.error("Error fetching active sentiments:", error);
    return [];
  }
}

/**
 * Check if a user has voted for a specific player in a specific week
 */
export async function hasUserVoted(
  userAddress: string,
  playerId: string,
  week: number
): Promise<boolean> {
  try {
    const client = new SuiClient({ url: SUI_CONFIG.rpcUrl });

    if (!PULSE_CONFIG.packageId) {
      return false;
    }

    const response = await client.getOwnedObjects({
      owner: userAddress, // FIXED: Added required owner parameter
      filter: {
        StructType: `${PULSE_CONFIG.packageId}::pulse::VoteReceipt`,
      },
      options: {
        showContent: true,
      },
    });

    for (const obj of response.data) {
      if (!obj.data?.content || obj.data.content.dataType !== "moveObject") {
        continue;
      }

      const fields = (obj.data.content as any).fields;

      if (fields.player_id === playerId && parseInt(fields.week) === week) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking vote status:", error);
    return false;
  }
}

/**
 * Get user's vote for a specific player in a specific week
 */
export async function getUserVote(
  userAddress: string,
  playerId: string,
  week: number
): Promise<"yes" | "no" | null> {
  try {
    const client = new SuiClient({ url: SUI_CONFIG.rpcUrl });

    if (!PULSE_CONFIG.packageId) {
      return null;
    }

    const response = await client.getOwnedObjects({
      owner: userAddress, // FIXED: Added required owner parameter
      filter: {
        StructType: `${PULSE_CONFIG.packageId}::pulse::VoteReceipt`,
      },
      options: {
        showContent: true,
      },
    });

    for (const obj of response.data) {
      if (!obj.data?.content || obj.data.content.dataType !== "moveObject") {
        continue;
      }

      const fields = (obj.data.content as any).fields;

      if (fields.player_id === playerId && parseInt(fields.week) === week) {
        return fields.vote ? "yes" : "no";
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching user vote:", error);
    return null;
  }
}

/**
 * Get voting statistics for all players in a specific week
 */
export async function getWeekVotingStats(week: number) {
  try {
    const sentiments = await getAllActiveSentiments(week);

    const totalVotes = sentiments.reduce(
      (sum, s) => sum + s.yesCount + s.noCount,
      0
    );

    const playersWithVotes = sentiments.filter(
      (s) => s.yesCount + s.noCount > 0
    ).length;

    const avgYesPercentage =
      sentiments.length > 0
        ? sentiments.reduce((sum, s) => {
            const total = s.yesCount + s.noCount;
            return sum + (total > 0 ? (s.yesCount / total) * 100 : 0);
          }, 0) / sentiments.length
        : 0;

    return {
      week,
      totalPlayers: sentiments.length,
      playersWithVotes,
      totalVotes,
      avgYesPercentage: Math.round(avgYesPercentage),
    };
  } catch (error) {
    console.error("Error calculating week stats:", error);
    return {
      week,
      totalPlayers: 0,
      playersWithVotes: 0,
      totalVotes: 0,
      avgYesPercentage: 0,
    };
  }
}
