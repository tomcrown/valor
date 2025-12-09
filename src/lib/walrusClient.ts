// ============================================================================
// FILE: lib/walrusClient.ts
// Walrus decentralized storage client for performance data and AI analysis
// ============================================================================

import axios from "axios";
import { SUI_CONFIG } from "../config/sui.config.ts";
import type { AIAnalysis } from "./openai.ts";
import type { SeasonPeriod } from "@/data/dummyData";

// ============================================================================
// Walrus API Response Types
// ============================================================================

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

// ============================================================================
// Player Performance Blob Structure
// ============================================================================

export interface PlayerPerformanceBlob {
  // Metadata
  version: string;
  timestamp: string;

  // Player Information
  player_id: string;
  player_name: string;
  team: string;
  position: string;
  nationality: string;

  // Season Context
  season_period: SeasonPeriod;
  season_label: string;

  // Raw Statistics
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

  // AI Analysis (Full GPT-4o output)
  ai_analysis: AIAnalysis;

  // Valuation Data
  valuation: {
    base_value_mist: number;
    base_value_sui: number;
    performance_score: number;
    trend: string;
    confidence: number;
  };

  // Verification
  data_hash: string;
  verified: boolean;

  // Audit Trail
  created_at: string;
  uploaded_by: string;
}

// ============================================================================
// Walrus Client Class
// ============================================================================

export class WalrusClient {
  private publisherUrl: string;
  private aggregatorUrl: string;
  private epochs: number;

  constructor() {
    this.publisherUrl = SUI_CONFIG.walrus.publisherUrl;
    this.aggregatorUrl = SUI_CONFIG.walrus.aggregatorUrl;
    this.epochs = SUI_CONFIG.walrus.epochs;

    console.log("🐋 Walrus Client Initialized");
    console.log(`   Publisher: ${this.publisherUrl}`);
    console.log(`   Aggregator: ${this.aggregatorUrl}`);
    console.log(`   Storage epochs: ${this.epochs}`);
  }

  /**
   * Upload any JSON data to Walrus
   * @param data - Any JSON-serializable data
   * @returns Blob ID for retrieval
   */
  async uploadJSON(data: any): Promise<string> {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const jsonSize = new Blob([jsonData]).size;

      console.log(`\n📦 Uploading to Walrus...`);
      console.log(`   Size: ${(jsonSize / 1024).toFixed(2)} KB`);
      console.log(`   Storage: ${this.epochs} epochs`);

      const response = await axios.put(
        `${this.publisherUrl}/v1/store`,
        jsonData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          params: {
            epochs: this.epochs,
          },
          timeout: 30000, // 30 second timeout
        }
      );

      const result = response.data as WalrusUploadResponse;

      // Extract blob ID from response
      const blobId =
        result.newlyCreated?.blobObject?.blobId ||
        result.alreadyCertified?.blobId;

      if (!blobId) {
        throw new Error("No blob ID returned from Walrus");
      }

      // Log success details
      if (result.newlyCreated) {
        console.log(`   ✅ Newly created blob`);
        console.log(
          `   📊 Stored epoch: ${result.newlyCreated.blobObject.storedEpoch}`
        );
        console.log(
          `   📊 End epoch: ${result.newlyCreated.blobObject.storage.endEpoch}`
        );
        console.log(`   💰 Cost: ${result.newlyCreated.cost} MIST`);
      } else if (result.alreadyCertified) {
        console.log(`   ♻️  Already certified (reused blob)`);
        console.log(`   📊 End epoch: ${result.alreadyCertified.endEpoch}`);
      }

      console.log(`   🆔 Blob ID: ${blobId}`);
      console.log(`   🔗 View URL: ${this.getBlobUrl(blobId)}`);

      return blobId;
    } catch (error: any) {
      console.error("\n❌ Walrus upload failed");

      if (error.response) {
        console.error(
          `   HTTP ${error.response.status}: ${error.response.statusText}`
        );
        console.error("   Response data:", error.response.data);
      } else if (error.request) {
        console.error("   No response received from Walrus");
        console.error("   Is the Walrus network accessible?");
      } else {
        console.error("   Error:", error.message);
      }

      throw new Error(`Walrus upload failed: ${error.message}`);
    }
  }

  /**
   * Download and parse JSON from Walrus
   * @param blobId - The blob ID to retrieve
   * @returns Parsed JSON data
   */
  async downloadJSON<T = any>(blobId: string): Promise<T> {
    try {
      console.log(`\n🔍 Downloading from Walrus...`);
      console.log(`   Blob ID: ${blobId}`);

      const response = await axios.get(`${this.aggregatorUrl}/v1/${blobId}`, {
        timeout: 30000,
        headers: {
          Accept: "application/json",
        },
      });

      const dataSize = JSON.stringify(response.data).length;
      console.log(`   ✅ Downloaded successfully`);
      console.log(`   📊 Size: ${(dataSize / 1024).toFixed(2)} KB`);

      return response.data as T;
    } catch (error: any) {
      console.error("\n❌ Walrus download failed");

      if (error.response?.status === 404) {
        console.error(
          "   Blob not found. It may have expired or the ID is incorrect."
        );
      } else if (error.response) {
        console.error(
          `   HTTP ${error.response.status}: ${error.response.statusText}`
        );
      } else {
        console.error("   Error:", error.message);
      }

      throw new Error(`Walrus download failed: ${error.message}`);
    }
  }

  /**
   * Check if a blob exists on Walrus
   * @param blobId - The blob ID to check
   * @returns true if blob exists, false otherwise
   */
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

  /**
   * Upload complete player performance data with AI analysis
   * This is the main method used by the deployment scripts
   */
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
    dataHash: string,
    uploadedBy: string = "admin"
  ): Promise<string> {
    const seasonLabels = {
      early: "Early Season (Matches 1-3)",
      mid: "Mid Season (Matches 4-9)",
      current: "Current Season (All Matches)",
    };

    // Construct comprehensive blob
    const blob: PlayerPerformanceBlob = {
      // Metadata
      version: "1.0.0",
      timestamp: new Date().toISOString(),

      // Player info
      player_id: playerId,
      player_name: playerName,
      team,
      position,
      nationality,

      // Season context
      season_period: seasonPeriod,
      season_label: seasonLabels[seasonPeriod],

      // Raw stats
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

      // AI analysis (complete GPT-4o output)
      ai_analysis: aiAnalysis,

      // Valuation
      valuation: {
        base_value_mist: baseValueMist,
        base_value_sui: baseValueMist / 1_000_000_000,
        performance_score: aiAnalysis.performance_score,
        trend: aiAnalysis.performance_trend,
        confidence: aiAnalysis.confidence,
      },

      // Verification
      data_hash: dataHash,
      verified: true,

      // Audit trail
      created_at: new Date().toISOString(),
      uploaded_by: uploadedBy,
    };

    console.log(`\n📊 Uploading ${playerName} performance data...`);
    console.log(`   Season: ${seasonLabels[seasonPeriod]}`);
    console.log(`   Goals: ${stats.goals}, Assists: ${stats.assists}`);
    console.log(`   AI Score: ${aiAnalysis.performance_score}/100`);
    console.log(`   Base Value: ${blob.valuation.base_value_sui} SUI`);

    return await this.uploadJSON(blob);
  }

  /**
   * Download player performance blob
   */
  async downloadPlayerPerformance(
    blobId: string
  ): Promise<PlayerPerformanceBlob> {
    return await this.downloadJSON<PlayerPerformanceBlob>(blobId);
  }

  /**
   * Get the full URL for viewing a blob in browser
   * @param blobId - The blob ID
   * @returns Full HTTPS URL
   */
  getBlobUrl(blobId: string): string {
    return `${this.aggregatorUrl}/v1/${blobId}`;
  }

  /**
   * Verify multiple blobs in parallel
   * @param blobIds - Array of blob IDs to verify
   * @returns Map of blob ID to verification status
   */
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

  /**
   * Get storage info for a blob
   * @param blobId - The blob ID
   * @returns Storage metadata if available
   */
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

// ============================================================================
// Singleton Instance
// ============================================================================

export const walrusClient = new WalrusClient();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a shortened blob ID for display
 * @param blobId - Full blob ID
 * @returns Shortened format (e.g., "0xabcd...ef12")
 */
export function shortenBlobId(blobId: string): string {
  if (blobId.length <= 12) return blobId;
  return `${blobId.slice(0, 6)}...${blobId.slice(-4)}`;
}

/**
 * Format storage epochs for display
 * @param epochs - Number of epochs
 * @returns Human-readable duration
 */
export function formatStorageDuration(epochs: number): string {
  const days = epochs * 1; // Rough estimate: 1 epoch ≈ 1 day
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  return `${Math.floor(days / 30)} months`;
}

// ============================================================================
// Export Types
// ============================================================================

// PlayerPerformanceBlob is already exported as an interface above; no additional export needed.
