import { SealClient, SessionKey } from "@mysten/seal";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519PublicKey } from "@mysten/sui/keypairs/ed25519";
import type { AIAnalysis } from "./gemini";

// Seal configuration for Testnet
const SEAL_CONFIG = {
  // This is the Seal PROTOCOL package (for creating SealClient)
  sealProtocolPackageId:
    "0x4016869413374eaa71df2a043d1660ed7bc927ab7962831f8b07efbc7efdb2c3",
  keyServerTestnet:
    "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
};

// Premium AI fields that will be encrypted
export interface PremiumAIData {
  prediction: string;
  key_factors: string[];
  reasoning: string;
}

// Public AI fields (always visible)
export interface PublicAIData {
  performance_score: number;
  performance_trend: "improving" | "stable" | "declining";
  form_status: "excellent" | "good" | "average" | "poor";
  confidence: number;
  short_summary: string;
  season_context?: string;
}

// Complete encrypted blob structure
export interface EncryptedAIBlob {
  public_data: PublicAIData;
  encrypted_premium: Uint8Array; // Encrypted PremiumAIData
  player_id: string;
  season: string;
  encrypted_at: string;
  seal_metadata: {
    threshold: number;
    services: string[];
  };
}

export class ValorSealClient {
  private sealClient: SealClient;
  private suiClient: SuiClient;
  private valorPackageId: string;

  constructor(suiClient: SuiClient, valorPackageId: string) {
    this.suiClient = suiClient;
    this.valorPackageId = valorPackageId;

    this.sealClient = new SealClient({
      suiClient,
      serverConfigs: [
        {
          objectId: SEAL_CONFIG.keyServerTestnet,
          weight: 1,
        },
      ],
      verifyKeyServers: false, // Set to true for production
    });
  }

  /**
   * Encrypt premium AI analysis fields
   */
  async encryptPremiumAI(
    playerId: string,
    season: "early" | "mid" | "current",
    fullAnalysis: AIAnalysis,
  ): Promise<EncryptedAIBlob> {
    // Extract premium fields
    const premiumData: PremiumAIData = {
      prediction: fullAnalysis.prediction,
      key_factors: fullAnalysis.key_factors,
      reasoning: fullAnalysis.reasoning,
    };

    // Create encryption ID: [player_id][season]
    const encryptionId = this.createEncryptionId(playerId, season);

    // Convert encryptionId (Uint8Array) to hex string
    const encryptionIdHex = Array.from(encryptionId)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Encrypt the premium data
    const premiumJson = JSON.stringify(premiumData);
    const premiumBytes = new TextEncoder().encode(premiumJson);

    // CRITICAL FIX: Use valorPackageId, not the Seal protocol package
    const { encryptedObject } = await this.sealClient.encrypt({
      threshold: 1,
      packageId: this.valorPackageId, // YOUR package with seal_approve functions
      id: encryptionIdHex,
      data: premiumBytes,
    });

    // Create public data (never encrypted)
    const publicData: PublicAIData = {
      performance_score: fullAnalysis.performance_score,
      performance_trend: fullAnalysis.performance_trend,
      form_status: fullAnalysis.form_status,
      confidence: fullAnalysis.confidence,
      short_summary: fullAnalysis.short_summary,
      season_context: fullAnalysis.season_context,
    };

    // Return the complete encrypted blob
    return {
      public_data: publicData,
      encrypted_premium: encryptedObject,
      player_id: playerId,
      season,
      encrypted_at: new Date().toISOString(),
      seal_metadata: {
        threshold: 1,
        services: [SEAL_CONFIG.keyServerTestnet],
      },
    };
  }

  /**
   * Decrypt premium AI analysis (requires NFT ownership)
   */
  async decryptPremiumAI(
    encryptedBlob: EncryptedAIBlob,
    userAddress: string,
    nftRegistryId: string,
    signer: any,
  ): Promise<PremiumAIData | null> {
    try {
      console.log("🔓 Starting decryption...");
      console.log("   User:", userAddress);
      console.log("   Player ID:", encryptedBlob.player_id);

      // Pre-fetch and cache the public key before creating the wrapper
      const publicKeyBytes = await signer.getPublicKey();
      console.log("   🔑 Public key bytes (length):", publicKeyBytes.length);

      // Handle the case where the public key has a 1-byte prefix (33 bytes total)
      let cleanPublicKeyBytes = publicKeyBytes;
      if (publicKeyBytes.length === 33) {
        cleanPublicKeyBytes = publicKeyBytes.slice(1);
        console.log("   🔪 Removed prefix byte, now 32 bytes");
      } else if (publicKeyBytes.length !== 32) {
        throw new Error(
          `Invalid public key length: ${publicKeyBytes.length}. Expected 32 or 33 bytes.`,
        );
      }

      // Create the public key object ONCE before the wrapper
      const cachedPublicKey = new Ed25519PublicKey(cleanPublicKeyBytes);
      console.log("   ✅ Public key object created and cached");
      console.log("   🔍 Has toSuiAddress:", "toSuiAddress" in cachedPublicKey);
      console.log("   ✅ Test toSuiAddress():", cachedPublicKey.toSuiAddress());

      // ✅ Create a full Signer implementation wrapper
      const wrappedSigner = {
        // Required for SessionKey.create
        getAddress: async () => {
          const address = await signer.getAddress();
          console.log("   📍 Address requested:", address);
          return address;
        },

        // Make this SYNCHRONOUS - return the cached key immediately
        getPublicKey: () => {
          console.log("   🔄 getPublicKey() called, returning cached key");
          return cachedPublicKey;
        },

        signPersonalMessage: async (input: Uint8Array) => {
          console.log("   ✍️ Signing message...");
          console.log("   📏 Message length:", input?.length);

          if (!input || !input.length) {
            throw new Error(
              "signPersonalMessage: message is empty or undefined",
            );
          }

          // Pass the Uint8Array directly - don't convert to base64
          // The wallet will handle the format it needs
          const result = await signer.signPersonalMessage(input);
          console.log("   ✅ Message signed");
          console.log("   🔑 Result:", result);

          return result;
        },

        // Additional Signer methods (may not be used by Seal but required by interface)
        sign: async (input: Uint8Array) => {
          throw new Error(
            "sign() not implemented - use signPersonalMessage instead",
          );
        },

        signWithIntent: async (input: Uint8Array, intent: any) => {
          throw new Error("signWithIntent() not implemented");
        },

        signTransaction: async (input: Uint8Array | Transaction) => {
          throw new Error(
            "signTransaction() not implemented for Seal decryption",
          );
        },

        signAndExecuteTransaction: async (input: any) => {
          throw new Error(
            "signAndExecuteTransaction() not needed for Seal decryption",
          );
        },

        // These might be needed
        toSuiAddress: () => userAddress,

        getKeyScheme: () => "ED25519" as const,
      };

      // ✅ Create session key with the wrapped signer
      const sessionKey = await SessionKey.create({
        address: userAddress,
        packageId: this.valorPackageId,
        ttlMin: 10,
        suiClient: this.suiClient,
        signer: wrappedSigner as any, // Cast to 'any' to bypass strict type checking
      });

      console.log("   ✅ Session key created");

      // Create PTB
      const tx = new Transaction();
      const playerId = encryptedBlob.player_id;

      console.log("   📦 Building PTB for seal_approve...");
      console.log(
        "   🎯 Target:",
        `${this.valorPackageId}::valor_seal::seal_approve_with_player`,
      );
      console.log(
        "   🔑 Encryption ID:",
        this.createEncryptionId(playerId, encryptedBlob.season),
      );
      console.log("   🏛️  NFT Registry:", nftRegistryId);
      console.log("   👤 Player ID:", playerId);

      tx.moveCall({
        target: `${this.valorPackageId}::valor_seal::seal_approve_with_player`,
        arguments: [
          tx.pure.vector(
            "u8",
            this.createEncryptionId(playerId, encryptedBlob.season),
          ),
          tx.object(nftRegistryId),
          tx.pure.id(playerId),
        ],
      });

      const txBytes = await tx.build({
        client: this.suiClient,
        onlyTransactionKind: true,
      });

      console.log("   ✅ PTB built, transaction bytes length:", txBytes.length);

      console.log("   🔐 Decrypting...");

      const decryptedBytes = await this.sealClient.decrypt({
        data: encryptedBlob.encrypted_premium,
        sessionKey,
        txBytes,
      });

      const decryptedJson = new TextDecoder().decode(decryptedBytes);
      const premiumData: PremiumAIData = JSON.parse(decryptedJson);

      console.log("   🎊 Unlocked!");
      return premiumData;
    } catch (error) {
      console.error("❌ Decryption failed:", error);
      return null;
    }
  }

  /**
   * Create encryption ID for Seal
   * Format: [player_id][season_byte]
   */
  private createEncryptionId(playerId: string, season: string): Uint8Array {
    // Convert player ID to bytes
    const playerIdBytes = this.hexToBytes(playerId.replace("0x", ""));

    // Convert season to a single byte
    const seasonByte = season === "early" ? 0 : season === "mid" ? 1 : 2;

    // Combine: player_id + season
    const id = new Uint8Array(playerIdBytes.length + 1);
    id.set(playerIdBytes, 0);
    id[playerIdBytes.length] = seasonByte;

    return id;
  }

  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }
}

/**
 * Helper: Check if user owns NFTs for a player (frontend helper)
 */
export async function checkNFTOwnership(
  suiClient: SuiClient,
  nftRegistryId: string,
  playerId: string,
  userAddress: string,
): Promise<{ hasOwnership: boolean; shares: number }> {
  try {
    // Call the view function to check ownership
    // TODO: Implement proper on-chain check
    return { hasOwnership: true, shares: 1 };
  } catch (error) {
    console.error("Failed to check NFT ownership:", error);
    return { hasOwnership: false, shares: 0 };
  }
}

/**
 * Export singleton instance - NOW REQUIRES VALOR PACKAGE ID
 */
export function createSealClient(
  suiClient: SuiClient,
  valorPackageId?: string,
): ValorSealClient {
  // Get Valor package ID from env or parameter
  const pkgId =
    valorPackageId ||
    (typeof process !== "undefined" &&
      process.env?.VITE_VALOR_SEAL_PACKAGE_ID) ||
    (typeof import.meta !== "undefined" &&
      (import.meta as any).env?.VITE_VALOR_SEAL_PACKAGE_ID);

  if (!pkgId) {
    throw new Error(
      "Valor package ID not found. Set VITE_VALOR_SEAL_PACKAGE_ID in .env",
    );
  }

  return new ValorSealClient(suiClient, pkgId);
}
