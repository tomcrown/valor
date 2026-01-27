import { createSealClient, type EncryptedAIBlob } from "./sealClient";
import { walrusClient } from "./walrusClient";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import type { AIAnalysis } from "./gemini";
import type { SeasonPeriod } from "@/data/apiData";

/**
 * Encrypts premium AI fields and uploads to Walrus
 * Returns the Walrus blob ID
 */
export async function encryptAndUploadAI(
  playerId: string,
  season: SeasonPeriod,
  aiAnalysis: AIAnalysis,
): Promise<string> {
  console.log(
    `\n🔐 Encrypting premium AI for player ${playerId} (${season})...`,
  );

  try {
    // Get network and package ID from environment
    const network =
      (typeof process !== "undefined" && process.env?.VITE_SUI_NETWORK) ||
      (typeof import.meta !== "undefined" &&
        (import.meta as any).env?.VITE_SUI_NETWORK) ||
      "testnet";

    const valorPackageId =
      (typeof process !== "undefined" &&
        process.env?.VITE_VALOR_SEAL_PACKAGE_ID) ||
      (typeof import.meta !== "undefined" &&
        (import.meta as any).env?.VITE_VALOR_SEAL_PACKAGE_ID);

    if (!valorPackageId) {
      throw new Error("VITE_VALOR_SEAL_PACKAGE_ID not found in environment");
    }

    console.log(`   📦 Using Valor Package: ${valorPackageId}`);

    // Initialize Seal client with Valor package ID
    const suiClient = new SuiClient({
      url: getFullnodeUrl(network),
    });
    const sealClient = createSealClient(suiClient, valorPackageId);

    // Encrypt premium fields (prediction, key_factors, reasoning)
    console.log(`   📊 AI Score: ${aiAnalysis.performance_score}/100`);
    console.log(`   🔒 Encrypting: prediction, key_factors, reasoning`);

    const encryptedBlob = await sealClient.encryptPremiumAI(
      playerId,
      season,
      aiAnalysis,
    );

    console.log(`   ✅ Encryption successful`);
    console.log(`   📦 Uploading to Walrus...`);

    // Upload encrypted blob to Walrus
    const blobId = await walrusClient.uploadJSON(encryptedBlob);

    console.log(`   ✅ Uploaded to Walrus`);
    console.log(`   🆔 Blob ID: ${blobId}`);
    console.log(`   🔗 URL: ${walrusClient.getBlobUrl(blobId)}`);

    return blobId;
  } catch (error: any) {
    console.error(`   ❌ Encryption failed:`, error.message);
    throw new Error(`Failed to encrypt AI analysis: ${error.message}`);
  }
}

/**
 * Downloads and parses encrypted AI blob from Walrus with retry logic
 */
export async function downloadEncryptedAI(
  blobId: string,
  options?: {
    maxRetries?: number;
    silent?: boolean;
  },
): Promise<EncryptedAIBlob | null> {
  try {
    if (!options?.silent) {
      console.log(`\n📥 Downloading encrypted AI from Walrus...`);
      console.log(`   Blob ID: ${blobId}`);
    }

    // Use walrusClient's built-in retry logic
    const blob = await walrusClient.downloadJSON<EncryptedAIBlob>(blobId, {
      maxRetries: options?.maxRetries ?? 5,
      retryDelayMs: 2000,
      silent: options?.silent ?? false,
    });

    if (!options?.silent) {
      console.log(`   ✅ Downloaded successfully`);
      console.log(`   📊 Public data available`);
      console.log(`   🔒 Premium data encrypted`);
    }

    return blob;
  } catch (error: any) {
    if (!options?.silent) {
      console.error(`   ❌ Download failed:`, error.message);
    }

    // Return null instead of throwing - allows graceful degradation
    return null;
  }
}

/**
 * Verifies that an encrypted blob is valid
 */
export function validateEncryptedBlob(blob: any): blob is EncryptedAIBlob {
  return (
    blob &&
    typeof blob === "object" &&
    "public_data" in blob &&
    "encrypted_premium" in blob &&
    "player_id" in blob &&
    "season" in blob &&
    blob.encrypted_premium instanceof Uint8Array
  );
}
