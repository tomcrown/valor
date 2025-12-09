// ============================================================================
// FILE: lib/suiClient.ts
// Modern Sui client using GraphQL (primary) and JSON-RPC (fallback)
// ============================================================================

import { SuiGraphQLClient } from "@mysten/sui/graphql";
import { graphql } from "@mysten/sui/graphql/schemas/latest";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromBase64 } from "@mysten/sui/utils";
import { SUI_CONFIG, suiToMist, mistToSui } from "../config/sui.config.ts";

// ============================================================================
// GraphQL Client (Primary for reads)
// ============================================================================

export const gqlClient = new SuiGraphQLClient({
  url: SUI_CONFIG.graphqlUrl,
});

// ============================================================================
// JSON-RPC Client (For transactions)
// ============================================================================

export const rpcClient = new SuiClient({
  url: SUI_CONFIG.rpcUrl,
});

// ============================================================================
// Admin Keypair Loading
// ============================================================================

export function loadAdminKeypair(): Ed25519Keypair {
  const privateKey = process.env.ADMIN_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("ADMIN_PRIVATE_KEY not found in environment variables");
  }

  try {
    // Handle different private key formats
    const cleanKey = privateKey.replace("suiprivkey", "").trim();
    const keyData = fromBase64(cleanKey);
    return Ed25519Keypair.fromSecretKey(keyData);
  } catch (error) {
    console.error("Failed to load admin keypair:", error);
    throw new Error("Invalid ADMIN_PRIVATE_KEY format");
  }
}

// ============================================================================
// GraphQL Queries
// ============================================================================

// Query to get player by name
export const getPlayerByNameQuery = graphql(`
  query GetPlayerByName($platformId: SuiAddress!, $playerName: String!) {
    object(address: $platformId) {
      asMoveObject {
        contents {
          json
        }
      }
    }
  }
`);

// Query to check if player exists
export const checkPlayerExistsQuery = graphql(`
  query CheckPlayerExists($platformId: SuiAddress!) {
    object(address: $platformId) {
      asMoveObject {
        contents {
          type {
            repr
          }
          json
        }
      }
    }
  }
`);

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get platform state using GraphQL
 */
export async function getPlatformState() {
  try {
    const result = await gqlClient.query({
      query: checkPlayerExistsQuery,
      variables: {
        platformId: SUI_CONFIG.contracts.platformObjectId,
      },
    });

    return result.data?.object?.asMoveObject?.contents?.json;
  } catch (error) {
    console.error("Failed to fetch platform state:", error);
    // Fallback to JSON-RPC
    return await rpcClient.getObject({
      id: SUI_CONFIG.contracts.platformObjectId,
      options: { showContent: true },
    });
  }
}

/**
 * Execute transaction and wait for confirmation
 */
export async function executeTransaction(
  tx: Transaction,
  keypair: Ed25519Keypair
) {
  try {
    // Sign and execute
    const result = await rpcClient.signAndExecuteTransaction({
      transaction: tx,
      signer: keypair,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });

    // Wait for confirmation
    const confirmed = await rpcClient.waitForTransaction({
      digest: result.digest,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });

    return {
      success: confirmed.effects?.status?.status === "success",
      digest: result.digest,
      effects: confirmed.effects,
      events: confirmed.events,
      objectChanges: confirmed.objectChanges,
    };
  } catch (error: any) {
    console.error("Transaction execution failed:", error);
    throw new Error(`Transaction failed: ${error.message}`);
  }
}

/**
 * Get clock object ID (needed for transactions)
 */
export async function getClockObjectId(): Promise<string> {
  // Clock is a well-known object on Sui
  return "0x6";
}

/**
 * Parse player data from on-chain object
 */
export function parsePlayerData(objectData: any) {
  if (!objectData?.content?.fields) {
    return null;
  }

  const fields = objectData.content.fields;

  return {
    player_id: fields.player_id,
    name: fields.name,
    team: fields.team,
    position: fields.position,
    base_value: BigInt(fields.base_value),
    total_shares: BigInt(fields.total_shares),
    circulating_shares: BigInt(fields.circulating_shares),
    last_update_timestamp: BigInt(fields.last_update_timestamp),
    walrus_blob_id: fields.walrus_blob_id,
    active: fields.active,
  };
}

// ============================================================================
// Export utilities
// ============================================================================

export { suiToMist, mistToSui };
