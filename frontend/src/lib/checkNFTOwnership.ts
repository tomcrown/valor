import { SuiClient } from "@mysten/sui/client";

/**
 * Check if a user owns NFTs for a specific player
 * Returns ownership status and share count
 */
export async function checkPlayerNFTOwnership(
  suiClient: SuiClient,
  userAddress: string,
  playerId: string,
  packageId: string,
): Promise<{ ownsNFT: boolean; shareCount: number }> {
  try {
    // Get all PlayerSharesNFT objects owned by the user
    const ownedObjects = await suiClient.getOwnedObjects({
      owner: userAddress,
      filter: {
        StructType: `${packageId}::valor::PlayerSharesNFT`,
      },
      options: {
        showContent: true,
        showType: true,
      },
    });

    let totalShares = 0;

    // Check each NFT to see if it's for this player
    for (const obj of ownedObjects.data) {
      if (obj.data?.content?.dataType === "moveObject") {
        const fields = obj.data.content.fields as any;

        // Check if this NFT is for the requested player
        if (fields.player_id === playerId) {
          const shares = Number(fields.shares || 0);
          totalShares += shares;
        }
      }
    }

    return {
      ownsNFT: totalShares > 0,
      shareCount: totalShares,
    };
  } catch (error) {
    return { ownsNFT: false, shareCount: 0 };
  }
}
