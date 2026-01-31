import { walrusClient } from "./walrusClient";
import type { AIAnalysis } from "./gemini";
import type { SeasonPeriod } from "@/data/apiData";

// Simplified AI blob structure without encryption
export interface AIBlob {
  public_data: PublicAIData;
  premium_data: PremiumAIData;
  player_id: string;
  season: SeasonPeriod;
  created_at: string;
}

export interface PublicAIData {
  performance_score: number;
  form_status: string;
  performance_trend: string;
  short_summary: string;
}

export interface PremiumAIData {
  prediction: string;
  key_factors: string[];
  reasoning: string;
}

/**
 * Upload AI analysis directly to Walrus without encryption
 * Since Seal is removed, all data is stored in plaintext on Walrus
 */
export async function uploadAIAnalysis(
  playerId: string,
  season: SeasonPeriod,
  aiAnalysis: AIAnalysis,
): Promise<string> {
  try {
    // Create the AI blob with both public and premium data
    const aiBlob: AIBlob = {
      public_data: {
        performance_score: aiAnalysis.performance_score,
        form_status: aiAnalysis.form_status,
        performance_trend: aiAnalysis.performance_trend,
        short_summary: aiAnalysis.short_summary,
      },
      premium_data: {
        prediction: aiAnalysis.prediction,
        key_factors: aiAnalysis.key_factors,
        reasoning: aiAnalysis.reasoning,
      },
      player_id: playerId,
      season,
      created_at: new Date().toISOString(),
    };

    // Upload directly to Walrus
    const blobId = await walrusClient.uploadJSON(aiBlob);

    console.log(`✅ AI analysis uploaded to Walrus: ${blobId}`);
    return blobId;
  } catch (error: any) {
    console.error("Failed to upload AI analysis:", error);
    throw new Error(`Failed to upload AI analysis: ${error.message}`);
  }
}

/**
 * Download AI analysis from Walrus
 */
export async function downloadAIAnalysis(
  blobId: string,
  options?: {
    maxRetries?: number;
    silent?: boolean;
  },
): Promise<AIBlob | null> {
  try {
    if (!options?.silent) {
      console.log(`📥 Downloading AI analysis from Walrus: ${blobId}`);
    }

    // Use walrusClient's built-in retry logic
    const blob = await walrusClient.downloadJSON<AIBlob>(blobId, {
      maxRetries: options?.maxRetries ?? 5,
      retryDelayMs: 2000,
      silent: options?.silent ?? false,
    });

    if (!options?.silent) {
      console.log("✅ AI analysis downloaded successfully");
    }

    return blob;
  } catch (error: any) {
    if (!options?.silent) {
      console.error("Failed to download AI analysis:", error);
    }
    return null;
  }
}

/**
 * Validate that a blob has the correct AIBlob structure
 */
export function validateAIBlob(blob: any): blob is AIBlob {
  if (
    !blob ||
    typeof blob !== "object" ||
    !("public_data" in blob) ||
    !("premium_data" in blob) ||
    !("player_id" in blob) ||
    !("season" in blob)
  ) {
    return false;
  }

  // Validate public_data structure
  const publicData = blob.public_data;
  if (
    !publicData ||
    typeof publicData !== "object" ||
    typeof publicData.performance_score !== "number" ||
    typeof publicData.form_status !== "string" ||
    typeof publicData.performance_trend !== "string" ||
    typeof publicData.short_summary !== "string"
  ) {
    return false;
  }

  // Validate premium_data structure
  const premiumData = blob.premium_data;
  if (
    !premiumData ||
    typeof premiumData !== "object" ||
    typeof premiumData.prediction !== "string" ||
    !Array.isArray(premiumData.key_factors) ||
    typeof premiumData.reasoning !== "string"
  ) {
    return false;
  }

  return true;
}
