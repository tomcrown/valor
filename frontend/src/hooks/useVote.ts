import { useState } from "react";
import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PULSE_CONFIG } from "@/config/pulse.config";
import { SUI_CONFIG } from "@/config/sui.config";
import { toast } from "sonner";

function getExplorerUrl(network: string): string {
  switch (network) {
    case "mainnet":
      return "https://suiscan.xyz/mainnet";
    case "testnet":
      return "https://suiscan.xyz/testnet";
    case "devnet":
      return "https://suiscan.xyz/devnet";
    default:
      return "https://suiscan.xyz/testnet";
  }
}

export function useVote() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [isVoting, setIsVoting] = useState(false);

  async function submitVote(
    sentimentObjectId: string,
    vote: "yes" | "no",
    playerName: string
  ): Promise<boolean> {
    if (!currentAccount) {
      toast.error("Please login first");
      return false;
    }

    if (!PULSE_CONFIG.platformObjectId || !PULSE_CONFIG.registryObjectId) {
      toast.error("Pulse system not configured");
      return false;
    }

    setIsVoting(true);

    try {
      const tx = new Transaction();

      const clockId = "0x6";

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

      const result = await signAndExecute({
        transaction: tx,
      });

      if (result.digest) {
        const explorerUrl = getExplorerUrl(SUI_CONFIG.network);

        toast.success(
          `Vote submitted! You voted ${vote.toUpperCase()} for ${playerName}`,
          {
            description: "Your vote has been recorded on-chain",
            action: {
              label: "View Transaction",
              onClick: () =>
                window.open(`${explorerUrl}/tx/${result.digest}`, "_blank"),
            },
          }
        );
        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Vote failed:", error);

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
    submitVote,
    isVoting,
  };
}
