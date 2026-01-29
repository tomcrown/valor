import { useState, useEffect, useRef } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { SUI_CONFIG } from "@/config/sui.config";
import { PULSE_POINTS_CONFIG } from "@/config/pulse-points.config";

export interface UserPointsData {
  currentPoints: number;
  lifetimePoints: number;
  votesCount: number;
  correctPredictions: number;
  nftSharesOwned: number;
  canUnlockAI: boolean;
  balanceObjectId: string | null;
  lastUpdated: number;
}

export interface LeaderboardEntry {
  address: string;
  points: number;
  lifetimePoints: number;
  votesCount: number;
  correctPredictions: number;
  nftSharesOwned: number;
  rank: number;
}

export function useUserPoints() {
  const prevPointsRef = useRef<number | null>(null);
  const isAutoRefreshingRef = useRef(false);

  const currentAccount = useCurrentAccount();
  const [pointsData, setPointsData] = useState<UserPointsData>({
    currentPoints: 0,
    lifetimePoints: 0,
    votesCount: 0,
    correctPredictions: 0,
    nftSharesOwned: 0,
    canUnlockAI: false,
    balanceObjectId: null,
    lastUpdated: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPoints = async () => {
    if (!currentAccount?.address) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const client = new SuiClient({ url: SUI_CONFIG.rpcUrl });

      // Get user's PointsBalance NFT
      const ownedObjects = await client.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${PULSE_POINTS_CONFIG.packageId}::pulse_points::PointsBalance`,
        },
        options: {
          showContent: true,
          showType: true,
        },
      });

      if (!ownedObjects.data.length) {
        setPointsData(prev => ({
          ...prev,
          balanceObjectId: null,
        }));
        return;
      }

      const balanceObj = ownedObjects.data[0];
      if (
        !balanceObj.data?.content ||
        balanceObj.data.content.dataType !== "moveObject"
      ) {
        throw new Error("Invalid balance object");
      }

      const fields = (balanceObj.data.content as any).fields;
      const aiUnlockThreshold = PULSE_POINTS_CONFIG.aiUnlockThreshold;
      const currentPoints = Number(fields.points || 0);

      // 🔁 Detect increase
      if (
        prevPointsRef.current !== null &&
        currentPoints > prevPointsRef.current &&
        !isAutoRefreshingRef.current
      ) {
        isAutoRefreshingRef.current = true;

        // Small delay lets chain indexers settle
        setTimeout(() => {
          fetchUserPoints();
          isAutoRefreshingRef.current = false;
        }, 600);
      }

      prevPointsRef.current = currentPoints;


      setPointsData({
        currentPoints,
        lifetimePoints: Number(fields.lifetime_points || 0),
        votesCount: Number(fields.votes_count || 0),
        correctPredictions: Number(fields.correct_predictions || 0),
        nftSharesOwned: Number(fields.nft_shares_owned || 0),
        canUnlockAI: currentPoints >= aiUnlockThreshold,
        balanceObjectId: balanceObj.data.objectId,
        lastUpdated: Number(fields.last_updated || 0),
      });
    } catch (err: any) {
      console.error("Error fetching user points:", err);
      setError(err.message || "Failed to fetch points");
    } finally {
      setIsLoading(false);
    }
  };

  const optimisticAddPoints = (amount: number) => {
    setPointsData(prev => ({
      ...prev,
      currentPoints: prev.currentPoints + amount,
      lifetimePoints: prev.lifetimePoints + amount,
    }));
  };


  useEffect(() => {
    fetchUserPoints();
  }, [currentAccount?.address]);

  return {
    pointsData,
    isLoading,
    error,
    refetch: fetchUserPoints,
    optimisticAddPoints,
  };
}

export function useLeaderboard(limit: number = 50) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const client = new SuiClient({ url: SUI_CONFIG.rpcUrl });

      // Query all PointsBalance objects
      const events = await client.queryEvents({
        query: {
          MoveEventType: `${PULSE_POINTS_CONFIG.packageId}::pulse_points::PointsMinted`,
        },
        limit: 1000,
        order: "descending",
      });

      // Aggregate points by user
      const userPointsMap = new Map<string, LeaderboardEntry>();

      for (const event of events.data) {
        const data = event.parsedJson as any;
        const userAddress = data.user;

        if (!userPointsMap.has(userAddress)) {
          // Fetch user's current balance
          const balances = await client.getOwnedObjects({
            owner: userAddress,
            filter: {
              StructType: `${PULSE_POINTS_CONFIG.packageId}::pulse_points::PointsBalance`,
            },
            options: {
              showContent: true,
            },
          });

          if (balances.data.length > 0) {
            const balanceObj = balances.data[0];
            if (balanceObj.data?.content?.dataType === "moveObject") {
              const fields = (balanceObj.data.content as any).fields;

              userPointsMap.set(userAddress, {
                address: userAddress,
                points: Number(fields.points || 0),
                lifetimePoints: Number(fields.lifetime_points || 0),
                votesCount: Number(fields.votes_count || 0),
                correctPredictions: Number(fields.correct_predictions || 0),
                nftSharesOwned: Number(fields.nft_shares_owned || 0),
                rank: 0,
              });
            }
          }
        }
      }

      // Sort by lifetime points and assign ranks
      const sortedUsers = Array.from(userPointsMap.values())
        .sort((a, b) => b.lifetimePoints - a.lifetimePoints)
        .slice(0, limit)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1,
        }));

      setLeaderboard(sortedUsers);
    } catch (err: any) {
      console.error("Error fetching leaderboard:", err);
      setError(err.message || "Failed to fetch leaderboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return {
    leaderboard,
    isLoading,
    error,
    refetch: fetchLeaderboard,
  };
}

export function calculateTotalScore(entry: LeaderboardEntry): number {
  // Weighted scoring for overall ranking
  return (
    entry.lifetimePoints +
    entry.votesCount * 2 +
    entry.correctPredictions * 10 +
    entry.nftSharesOwned * 5
  );
}
