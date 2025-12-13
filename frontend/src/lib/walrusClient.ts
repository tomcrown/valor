import axios from "axios";
import { SUI_CONFIG } from "../config/sui.config.ts";
import type { AIAnalysis } from "./openai.ts";
import type { SeasonPeriod } from "@/data/apiData.ts";

export interface WalrusUploadResponse {
  newlyCreated?: {
    blobObject: {
      id: string;
      storedEpoch: number;
      blobId: string;
      size: number;
      encodingType: string;
      certifiedEpoch: number;
      storage: {
        id: string;
        startEpoch: number;
        endEpoch: number;
        storageSize: number;
      };
    };
    encodedSize: number;
    cost: number;
  };
  alreadyCertified?: {
    blobId: string;
    event: {
      txDigest: string;
      eventSeq: string;
    };
    endEpoch: number;
  };
}

export interface PlayerPerformanceBlob {
  version: string;
  timestamp: string;

  player_id: string;
  player_name: string;
  team: string;
  position: string;
  nationality: string;

  season_period: SeasonPeriod;
  season_label: string;

  stats: {
    goals: number;
    assists: number;
    minutes_played: number;
    matches_played: number;
    rating?: number;
    clean_sheets?: number;
    shots_on_target?: number;
    pass_accuracy?: number;
  };

  ai_analysis: AIAnalysis;

  valuation: {
    base_value_mist: number;
    base_value_sui: number;
    performance_score: number;
    trend: string;
    confidence: number;
  };

  verified: boolean;

  created_at: string;
  uploaded_by: string;
}

export class WalrusClient {
  private publisherUrl: string;
  private aggregatorUrl: string;
  private epochs: number;

  constructor() {
    this.publisherUrl = SUI_CONFIG.walrus.publisherUrl;
    this.aggregatorUrl = SUI_CONFIG.walrus.aggregatorUrl;
    this.epochs = SUI_CONFIG.walrus.epochs;
  }

  async uploadJSON(data: any): Promise<string> {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const jsonSize = new Blob([jsonData]).size;

      const response = await axios.put(
        `${this.publisherUrl}/v1/blobs`,
        jsonData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            epochs: this.epochs,
          },
          timeout: 30000,
        }
      );

      const result = response.data as WalrusUploadResponse;

      const blobId =
        result.newlyCreated?.blobObject?.blobId ||
        result.alreadyCertified?.blobId;

      if (!blobId) {
        throw new Error("No blob ID returned from Walrus");
      }

      if (result.newlyCreated) {
      } else if (result.alreadyCertified) return blobId;
    } catch (error: any) {
      if (error.response) {
      } else if (error.request) {
      } else {
      }

      throw new Error(`Walrus upload failed: ${error.message}`);
    }
  }

  async downloadJSON<T = any>(blobId: string): Promise<T> {
    try {
      const response = await axios.get(`${this.aggregatorUrl}/v1/${blobId}`, {
        timeout: 30000,
        headers: {
          Accept: "application/json",
        },
      });

      const dataSize = JSON.stringify(response.data).length;

      return response.data as T;
    } catch (error: any) {
      if (error.response?.status === 404) {
      } else if (error.response) {
      } else {
      }

      throw new Error(`Walrus download failed: ${error.message}`);
    }
  }

  async verifyBlob(blobId: string): Promise<boolean> {
    try {
      await axios.head(`${this.aggregatorUrl}/v1/${blobId}`, {
        timeout: 10000,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async uploadPlayerPerformance(
    playerId: string,
    playerName: string,
    team: string,
    position: string,
    nationality: string,
    seasonPeriod: SeasonPeriod,
    stats: {
      goals: number;
      assists: number;
      minutes_played: number;
      matches_played: number;
      rating?: number;
      clean_sheets?: number;
      shots_on_target?: number;
      pass_accuracy?: number;
    },
    aiAnalysis: AIAnalysis,
    baseValueMist: number,
    uploadedBy: string = "admin"
  ): Promise<string> {
    const seasonLabels = {
      early: "Early Season (Matches 1-3)",
      mid: "Mid Season (Matches 4-9)",
      current: "Current Season (All Matches)",
    };

    const blob: PlayerPerformanceBlob = {
      version: "1.0.0",
      timestamp: new Date().toISOString(),

      player_id: playerId,
      player_name: playerName,
      team,
      position,
      nationality,

      season_period: seasonPeriod,
      season_label: seasonLabels[seasonPeriod],

      stats: {
        goals: stats.goals,
        assists: stats.assists,
        minutes_played: stats.minutes_played,
        matches_played: stats.matches_played,
        rating: stats.rating,
        clean_sheets: stats.clean_sheets || 0,
        shots_on_target: stats.shots_on_target,
        pass_accuracy: stats.pass_accuracy,
      },

      ai_analysis: aiAnalysis,

      valuation: {
        base_value_mist: baseValueMist,
        base_value_sui: baseValueMist / 1_000_000_000,
        performance_score: aiAnalysis.performance_score,
        trend: aiAnalysis.performance_trend,
        confidence: aiAnalysis.confidence,
      },

      verified: true,

      created_at: new Date().toISOString(),
      uploaded_by: uploadedBy,
    };

    return await this.uploadJSON(blob);
  }

  async downloadPlayerPerformance(
    blobId: string
  ): Promise<PlayerPerformanceBlob> {
    return await this.downloadJSON<PlayerPerformanceBlob>(blobId);
  }

  getBlobUrl(blobId: string): string {
    return `${this.aggregatorUrl}/v1/${blobId}`;
  }

  async verifyMultipleBlobs(blobIds: string[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    await Promise.all(
      blobIds.map(async (blobId) => {
        const exists = await this.verifyBlob(blobId);
        results.set(blobId, exists);
      })
    );

    return results;
  }

  async getBlobInfo(blobId: string): Promise<any> {
    try {
      const response = await axios.head(`${this.aggregatorUrl}/v1/${blobId}`, {
        timeout: 10000,
      });

      return {
        exists: true,
        contentType: response.headers["content-type"],
        contentLength: response.headers["content-length"],
        lastModified: response.headers["last-modified"],
      };
    } catch (error) {
      return {
        exists: false,
      };
    }
  }
}

export interface PulseVoteRecord {
  voter_address: string;
  vote: "yes" | "no";
  timestamp: string;
  transaction_digest?: string;
}

export interface PulseVoteBlob {
  version: string;
  timestamp: string;

  week_number: number;
  week_start: string;
  week_end: string;

  player_id: string;
  player_name: string;

  summary: {
    yes_count: number;
    no_count: number;
    total_votes: number;
    yes_percentage: number;
    no_percentage: number;
  };

  votes: PulseVoteRecord[];

  verified: boolean;
  created_at: string;
  updated_by: string;
}

export async function uploadPulseVotes(
  walrusClient: WalrusClient,
  weekNumber: number,
  weekStart: string,
  weekEnd: string,
  playerId: string,
  playerName: string,
  votes: PulseVoteRecord[],
  uploadedBy: string = "admin"
): Promise<string> {
  const yesVotes = votes.filter((v) => v.vote === "yes");
  const noVotes = votes.filter((v) => v.vote === "no");
  const totalVotes = votes.length;

  const blob: PulseVoteBlob = {
    version: "1.0.0",
    timestamp: new Date().toISOString(),

    week_number: weekNumber,
    week_start: weekStart,
    week_end: weekEnd,

    player_id: playerId,
    player_name: playerName,

    summary: {
      yes_count: yesVotes.length,
      no_count: noVotes.length,
      total_votes: totalVotes,
      yes_percentage:
        totalVotes > 0 ? Math.round((yesVotes.length / totalVotes) * 100) : 0,
      no_percentage:
        totalVotes > 0 ? Math.round((noVotes.length / totalVotes) * 100) : 0,
    },

    votes: votes.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    ),

    verified: true,
    created_at: new Date().toISOString(),
    updated_by: uploadedBy,
  };

  return await walrusClient.uploadJSON(blob);
}

export async function downloadPulseVotes(
  walrusClient: WalrusClient,
  blobId: string
): Promise<PulseVoteBlob> {
  return await walrusClient.downloadJSON<PulseVoteBlob>(blobId);
}

export async function initializePulseBlob(
  walrusClient: WalrusClient,
  weekNumber: number,
  weekStart: string,
  weekEnd: string,
  playerId: string,
  playerName: string
): Promise<string> {
  return await uploadPulseVotes(
    walrusClient,
    weekNumber,
    weekStart,
    weekEnd,
    playerId,
    playerName,
    [],
    "system"
  );
}

export const walrusClient = new WalrusClient();

export function shortenBlobId(blobId: string): string {
  if (blobId.length <= 12) return blobId;
  return `${blobId.slice(0, 6)}...${blobId.slice(-4)}`;
}

export function formatStorageDuration(epochs: number): string {
  const days = epochs * 1; // Rough estimate: 1 epoch ≈ 1 day
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  return `${Math.floor(days / 30)} months`;
}
