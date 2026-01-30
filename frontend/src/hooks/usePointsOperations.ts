import { useState } from "react";
import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PULSE_POINTS_CONFIG } from "@/config/pulse-points.config";
import { toast } from "sonner";

export function usePointsOperations() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [isProcessing, setIsProcessing] = useState(false);

  async function initializePointsBalance(): Promise<boolean> {
    if (!currentAccount) {
      toast.error("Please connect your wallet first");
      return false;
    }

    if (!PULSE_POINTS_CONFIG.platformObjectId) {
      toast.error("Points system not configured");
      return false;
    }

    setIsProcessing(true);

    try {
      const tx = new Transaction();
      const clockId = "0x6";

      tx.moveCall({
        target: `${PULSE_POINTS_CONFIG.packageId}::pulse_points::initialize_balance`,
        arguments: [
          tx.object(PULSE_POINTS_CONFIG.platformObjectId),
          tx.object(clockId),
        ],
      });

      const result = await signAndExecute({
        transaction: tx,
      });

      if (result.digest) {
        toast.success("Points balance initialized!", {
          description: "You can now start earning Pulse Points",
        });
        return true;
      }

      return false;
    } catch (error: any) {
      toast.error("Failed to initialize points balance", {
        description: error.message || "Please try again",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }

  async function mintVotePoints(balanceObjectId: string): Promise<boolean> {
    if (!currentAccount || !balanceObjectId) {
      return false;
    }

    setIsProcessing(true);

    try {
      const tx = new Transaction();
      const clockId = "0x6";

      tx.moveCall({
        target: `${PULSE_POINTS_CONFIG.packageId}::pulse_points::mint_vote_points`,
        arguments: [
          tx.object(PULSE_POINTS_CONFIG.platformObjectId),
          tx.object(balanceObjectId),
          tx.object(clockId),
        ],
      });

      const result = await signAndExecute({
        transaction: tx,
      });

      return !!result.digest;
    } catch (error: any) {
      return false;
    } finally {
      setIsProcessing(false);
    }
  }

  async function mintNFTPoints(
    balanceObjectId: string,
    sharesAmount: number,
  ): Promise<boolean> {
    if (!currentAccount || !balanceObjectId || sharesAmount <= 0) {
      return false;
    }

    setIsProcessing(true);

    try {
      const tx = new Transaction();
      const clockId = "0x6";

      tx.moveCall({
        target: `${PULSE_POINTS_CONFIG.packageId}::pulse_points::mint_nft_points`,
        arguments: [
          tx.object(PULSE_POINTS_CONFIG.platformObjectId),
          tx.object(balanceObjectId),
          tx.pure.u64(sharesAmount),
          tx.object(clockId),
        ],
      });

      const result = await signAndExecute({
        transaction: tx,
      });

      if (result.digest) {
        const pointsEarned = sharesAmount * PULSE_POINTS_CONFIG.nftSharePoints;
        toast.success(`Earned ${pointsEarned} Points!`, {
          description: `${sharesAmount} NFT shares purchased`,
        });
        return true;
      }

      return false;
    } catch (error: any) {
      return false;
    } finally {
      setIsProcessing(false);
    }
  }

  async function spendPointsForAI(balanceObjectId: string): Promise<boolean> {
    if (!currentAccount || !balanceObjectId) {
      toast.error("Points balance not found");
      return false;
    }

    setIsProcessing(true);

    try {
      const tx = new Transaction();
      const clockId = "0x6";

      tx.moveCall({
        target: `${PULSE_POINTS_CONFIG.packageId}::pulse_points::spend_points_for_ai`,
        arguments: [
          tx.object(PULSE_POINTS_CONFIG.platformObjectId),
          tx.object(balanceObjectId),
          tx.object(clockId),
        ],
      });

      const result = await signAndExecute({
        transaction: tx,
      });

      if (result.digest) {
        toast.success("AI Insights Unlocked!", {
          description: `Spent ${PULSE_POINTS_CONFIG.aiUnlockThreshold} points`,
        });
        return true;
      }

      return false;
    } catch (error: any) {
      if (error.message?.includes("EInsufficientPoints")) {
        toast.error("Insufficient points", {
          description: `You need ${PULSE_POINTS_CONFIG.aiUnlockThreshold} points to unlock AI insights`,
        });
      } else {
        toast.error("Failed to unlock AI insights", {
          description: error.message || "Please try again",
        });
      }
      return false;
    } finally {
      setIsProcessing(false);
    }
  }

  return {
    initializePointsBalance,
    mintVotePoints,
    mintNFTPoints,
    spendPointsForAI,
    isProcessing,
  };
}

export function useVoteWithPoints() {
  const { mintVotePoints } = usePointsOperations();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [isVoting, setIsVoting] = useState(false);

  async function submitVoteWithPoints(
    sentimentObjectId: string,
    vote: "yes" | "no",
    playerName: string,
    balanceObjectId: string | null,
  ): Promise<boolean> {
    if (!currentAccount) {
      toast.error("Please login first");
      return false;
    }

    setIsVoting(true);

    try {
      const tx = new Transaction();
      const clockId = "0x6";

      const PULSE_CONFIG = {
        packageId: import.meta.env.VITE_PULSE_PACKAGE_ID,
        platformObjectId: import.meta.env.VITE_PULSE_PLATFORM_ID,
        registryObjectId: import.meta.env.VITE_PULSE_REGISTRY_ID,
        moduleName: "pulse",
      };

      const voteFunction = vote === "yes" ? "vote_yes" : "vote_no";

      tx.moveCall({
        target: `${PULSE_CONFIG.packageId}::${PULSE_CONFIG.moduleName}::${voteFunction}`,
        arguments: [
          tx.object(PULSE_CONFIG.platformObjectId),
          tx.object(PULSE_CONFIG.registryObjectId),
          tx.object(sentimentObjectId),
          tx.object(clockId),
        ],
      });

      if (balanceObjectId) {
        tx.moveCall({
          target: `${PULSE_POINTS_CONFIG.packageId}::pulse_points::mint_vote_points`,
          arguments: [
            tx.object(PULSE_POINTS_CONFIG.platformObjectId),
            tx.object(balanceObjectId),
            tx.object(clockId),
          ],
        });
      }

      const result = await signAndExecute({
        transaction: tx,
      });

      if (result.digest) {
        toast.success(
          `Vote submitted! You voted ${vote.toUpperCase()} for ${playerName}`,
          {
            description: balanceObjectId
              ? `+${PULSE_POINTS_CONFIG.votePoints} Pulse Points earned`
              : "Your vote has been recorded",
          },
        );
        return true;
      }

      return false;
    } catch (error: any) {
      if (error.message?.includes("EAlreadyVoted")) {
        toast.error("You have already voted for this player this week");
      } else if (error.message?.includes("EWeekNotActive")) {
        toast.error("Voting is not currently active");
      } else {
        toast.error("Failed to submit vote", {
          description: error.message || "Please try again",
        });
      }
      return false;
    } finally {
      setIsVoting(false);
    }
  }

  return {
    submitVoteWithPoints,
    isVoting,
  };
}
