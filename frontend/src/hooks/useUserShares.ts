import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { rpcClient } from "@/lib/suiClient";
import { SUI_CONFIG } from "@/config/sui.config";

export interface PlayerSharesObject {
  objectId: string;
  playerId: string;
  playerName: string;
  nftImageUrl: string;
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
      setShares([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
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

      const userShares: PlayerSharesObject[] = [];

      for (const obj of ownedObjects.data) {
        if (!obj.data?.content || obj.data.content.dataType !== "moveObject") {
          continue;
        }

        const fields = obj.data.content.fields as any;

        if (playerId && fields.player_id !== playerId) {
          continue;
        }

        let imageUrl = "";
        if (fields.nft_image_url) {
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
      }

      setShares(userShares);
    } catch (err: any) {
      setError(err.message || "Failed to fetch shares");
      setShares([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserShares();
  }, [account?.address, playerId]);

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
