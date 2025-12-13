import { SuiClient } from "@mysten/sui/client";
import { SUI_CONFIG } from "@/config/sui.config";
import { PULSE_CONFIG } from "@/config/pulse.config";

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

    console.warn(
      "This function requires platform object access - use getAllActiveSentiments instead"
    );
    return null;
  } catch (error) {
    console.error("Error finding sentiment:", error);
    return null;
  }
}

export async function getAllActiveSentiments(currentWeek: number) {
  try {
    const client = new SuiClient({ url: SUI_CONFIG.rpcUrl });

    if (!PULSE_CONFIG.packageId || !PULSE_CONFIG.platformObjectId) {
      return [];
    }

    const platformObj = await client.getObject({
      id: PULSE_CONFIG.platformObjectId,
      options: { showContent: true },
    });

    if (platformObj.data?.content?.dataType !== "moveObject") {
      throw new Error("Invalid platform object");
    }

    const sentiments = [];

    console.log("Fetching sentiments for week:", currentWeek);

    return sentiments;
  } catch (error) {
    console.error("Error fetching active sentiments:", error);
    return [];
  }
}

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
      owner: userAddress,
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
      owner: userAddress,
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
