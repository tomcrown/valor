// ============================================================================
// FILE: hooks/useUserShares.ts
// Fetch user's owned PlayerShares for a specific player
// ============================================================================

import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { rpcClient } from "@/lib/suiClient";
import { SUI_CONFIG } from "@/config/sui.config";

export interface PlayerSharesObject {
  objectId: string;
  playerId: string;
  playerName: string;
  imageUrl: string;
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

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all objects owned by the user
      const ownedObjects = await rpcClient.getOwnedObjects({
        owner: account.address,
        filter: {
          StructType: `${SUI_CONFIG.contracts.packageId}::valor::PlayerShares`,
        },
        options: {
          showContent: true,
          showType: true,
        },
      });

      const userShares: PlayerSharesObject[] = [];

      for (const obj of ownedObjects.data) {
        if (!obj.data?.content || obj.data.content.dataType !== "moveObject") {
          continue;
        }

        const fields = obj.data.content.fields as any;

        // If playerId is specified, only include matching shares
        if (playerId && fields.player_id !== playerId) {
          continue;
        }

        userShares.push({
          objectId: obj.data.objectId,
          playerId: fields.player_id,
          playerName: fields.player_name,
          imageUrl: fields.image_url,
          shares: Number(fields.shares),
          purchasePrice: Number(fields.purchase_price),
          purchaseTimestamp: Number(fields.purchase_timestamp),
        });
      }

      setShares(userShares);
    } catch (err: any) {
      console.error("Error fetching user shares:", err);
      setError(err.message || "Failed to fetch shares");
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
