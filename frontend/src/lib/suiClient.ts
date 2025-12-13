import { SuiGraphQLClient } from "@mysten/sui/graphql";
import { graphql } from "@mysten/sui/graphql/schemas/latest";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { SUI_CONFIG, suiToMist, mistToSui } from "../config/sui.config.ts";

export const gqlClient = new SuiGraphQLClient({
  url: SUI_CONFIG.graphqlUrl,
});

export const rpcClient = new SuiClient({
  url: SUI_CONFIG.rpcUrl,
});

export function loadAdminKeypair(): Ed25519Keypair {
  const privateKey = process.env.ADMIN_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("ADMIN_PRIVATE_KEY not found in environment variables");
  }

  const { secretKey } = decodeSuiPrivateKey(privateKey);
  return Ed25519Keypair.fromSecretKey(secretKey);
}

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
    return await rpcClient.getObject({
      id: SUI_CONFIG.contracts.platformObjectId,
      options: { showContent: true },
    });
  }
}

export async function executeTransaction(
  tx: Transaction,
  keypair: Ed25519Keypair
) {
  try {
    const result = await rpcClient.signAndExecuteTransaction({
      transaction: tx,
      signer: keypair,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });

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
    throw new Error(`Transaction failed: ${error.message}`);
  }
}

export async function getClockObjectId(): Promise<string> {
  return "0x6";
}

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

export { suiToMist, mistToSui };
