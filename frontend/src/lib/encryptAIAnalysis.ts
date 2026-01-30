import { createSealClient, type EncryptedAIBlob } from "./sealClient";
import { walrusClient } from "./walrusClient";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import type { AIAnalysis } from "./gemini";
import type { SeasonPeriod } from "@/data/apiData";


export async function encryptAndUploadAI(
  playerId: string,
  season: SeasonPeriod,
  aiAnalysis: AIAnalysis,
): Promise<string> {


  try {
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


    const suiClient = new SuiClient({
      url: getFullnodeUrl(network),
    });
    const sealClient = createSealClient(suiClient, valorPackageId);


    const encryptedBlob = await sealClient.encryptPremiumAI(
      playerId,
      season,
      aiAnalysis,
    );

    const blobId = await walrusClient.uploadJSON(encryptedBlob);


    return blobId;
  } catch (error: any) {
    throw new Error(`Failed to encrypt AI analysis: ${error.message}`);
  }
}

export async function downloadEncryptedAI(
  blobId: string,
  options?: {
    maxRetries?: number;
    silent?: boolean;
  },
): Promise<EncryptedAIBlob | null> {
  try {
    if (!options?.silent) {

    }

    // Use walrusClient's built-in retry logic
    const blob = await walrusClient.downloadJSON<EncryptedAIBlob>(blobId, {
      maxRetries: options?.maxRetries ?? 5,
      retryDelayMs: 2000,
      silent: options?.silent ?? false,
    });

    if (!options?.silent) {

    }

    return blob;
  } catch (error: any) {
    if (!options?.silent) {
    }

    return null;
  }
}


export function validateEncryptedBlob(blob: any): blob is EncryptedAIBlob {
  if (
    !blob ||
    typeof blob !== "object" ||
    !("public_data" in blob) ||
    !("encrypted_premium" in blob) ||
    !("player_id" in blob) ||
    !("season" in blob)
  ) {
    return false;
  }

  if (!(blob.encrypted_premium instanceof Uint8Array)) {

    const encryptedObj = blob.encrypted_premium;

    if (typeof encryptedObj !== "object" || encryptedObj === null) {
      return false;
    }

    const keys = Object.keys(encryptedObj);
    const length = keys.length;

    if (length === 0) {
      return false;
    }

    const uint8Array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      uint8Array[i] = encryptedObj[i.toString()];
    }

    blob.encrypted_premium = uint8Array;
  }

  return true;
}
