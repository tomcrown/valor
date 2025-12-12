// ============================================================================
// FILE: hooks/useUserShares.ts
// Fetch user's owned PlayerSharesNFT for a specific player
// FIXED: Changed struct type from PlayerShares to PlayerSharesNFT
// ============================================================================

import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { rpcClient } from "@/lib/suiClient";
import { SUI_CONFIG } from "@/config/sui.config";

export interface PlayerSharesObject {
  objectId: string;
  playerId: string;
  playerName: string;
  nftImageUrl: string; // Changed from imageUrl to match contract
  shares: number;
  purchasePrice: number;
  purchaseTimestamp: number;
}

export function useUserShares(playerId?: string) {
  const account = useCurrentAccount();
  const [shares, setShares] = useState<PlayerSharesObject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserShares = async () => {
    if (!account?.address) {
      setShares([]);
      return;
    }

    if (!playerId) {
      console.log("⚠️ No playerId provided, skipping fetch");
      setShares([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching shares for user:", account.address);
      console.log("🎯 Looking for player ID:", playerId);

      // FIXED: Changed from PlayerShares to PlayerSharesNFT
      const ownedObjects = await rpcClient.getOwnedObjects({
        owner: account.address,
        filter: {
          StructType: `${SUI_CONFIG.contracts.packageId}::valor::PlayerSharesNFT`,
        },
        options: {
          showContent: true,
          showType: true,
        },
      });

      console.log("📦 Total NFTs found:", ownedObjects.data.length);

      const userShares: PlayerSharesObject[] = [];

      for (const obj of ownedObjects.data) {
        if (!obj.data?.content || obj.data.content.dataType !== "moveObject") {
          continue;
        }

        const fields = obj.data.content.fields as any;

        console.log("🔎 Found NFT:", {
          objectId: obj.data.objectId,
          playerId: fields.player_id,
          playerName: fields.player_name,
          shares: fields.shares,
        });

        // Filter by player ID if specified
        if (playerId && fields.player_id !== playerId) {
          console.log("  ⏭️ Skipping (different player)");
          continue;
        }

        // Extract image URL from the Url object
        let imageUrl = "";
        if (fields.nft_image_url) {
          // The nft_image_url is a Sui Url object with a 'url' field
          imageUrl =
            fields.nft_image_url.fields?.url || fields.nft_image_url.url || "";
        }

        userShares.push({
          objectId: obj.data.objectId,
          playerId: fields.player_id,
          playerName: fields.player_name,
          nftImageUrl: imageUrl,
          shares: Number(fields.shares),
          purchasePrice: Number(fields.purchase_price),
          purchaseTimestamp: Number(fields.purchase_timestamp),
        });

        console.log("  ✅ Added to user shares");
      }

      console.log(`✅ Found ${userShares.length} NFTs for player ${playerId}`);
      console.log(
        "📊 Total shares:",
        userShares.reduce((sum, s) => sum + s.shares, 0)
      );

      setShares(userShares);
    } catch (err: any) {
      console.error("❌ Error fetching user shares:", err);
      setError(err.message || "Failed to fetch shares");
      setShares([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserShares();
  }, [account?.address, playerId]);

  // Calculate total shares for this player
  const totalShares = shares.reduce((sum, s) => sum + s.shares, 0);

  return {
    shares,
    totalShares,
    isLoading,
    error,
    refetch: fetchUserShares,
    hasShares: shares.length > 0,
  };
}
