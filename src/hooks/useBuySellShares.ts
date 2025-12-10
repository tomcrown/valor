// ============================================================================
// FILE: hooks/useBuySellShares.ts
// Custom hook for buying and selling player shares
// ============================================================================

import { useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { SUI_CONFIG, suiToMist } from "@/config/sui.config";
import { toast } from "@/hooks/use-toast";

export interface BuySharesParams {
  playerId: string;
  playerName: string;
  shares: number;
  maxPricePerShare: number; // in SUI
}

export interface SellSharesParams {
  sharesObjectId: string;
  sharesToSell: number;
  minPricePerShare: number; // in SUI
}

export function useBuySellShares() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Buy player shares
   */
  const buyShares = async (params: BuySharesParams) => {
    if (!account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to buy shares.",
        variant: "destructive",
      });
      return null;
    }

    setIsProcessing(true);

    try {
      const tx = new Transaction();

      // Set gas budget
      tx.setGasBudget(SUI_CONFIG.gas.budget);

      // Calculate payment amount (add 10% buffer for slippage)
      const estimatedCost = params.shares * params.maxPricePerShare * 1.1;
      const paymentAmount = suiToMist(estimatedCost);

      // Split coin for payment
      const [paymentCoin] = tx.splitCoins(tx.gas, [paymentAmount]);

      // Call buy_shares function
      tx.moveCall({
        target: `${SUI_CONFIG.contracts.packageId}::valor::buy_shares`,
        arguments: [
          tx.object(SUI_CONFIG.contracts.platformObjectId), // platform
          tx.pure.id(params.playerId), // player_id
          tx.pure.u64(params.shares), // shares
          tx.pure.u64(suiToMist(params.maxPricePerShare)), // max_price_per_share (in MIST)
          paymentCoin, // payment
          tx.object("0x6"), // clock
        ],
      });

      toast({
        title: "Transaction Submitted",
        description: `Buying ${params.shares} shares of ${params.playerName}...`,
      });

      const result = await signAndExecute({
        transaction: tx,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        },
      });

      // Check if transaction was successful
      if (result.effects?.status?.status === "success") {
        toast({
          title: "Purchase Successful! 🎉",
          description: `You now own ${params.shares} shares of ${params.playerName}`,
        });

        return {
          success: true,
          digest: result.digest,
          effects: result.effects,
          events: result.events,
        };
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      console.error("Buy shares error:", error);

      let errorMessage = "Failed to buy shares. Please try again.";

      if (error.message?.includes("EInsufficientPayment")) {
        errorMessage = "Insufficient SUI for purchase. Please add more SUI.";
      } else if (error.message?.includes("EPriceSlippage")) {
        errorMessage = "Price changed too much. Please try again.";
      } else if (error.message?.includes("EInsufficientShares")) {
        errorMessage = "Not enough shares available for purchase.";
      } else if (error.message?.includes("EMaxPurchaseExceeded")) {
        errorMessage =
          "Purchase amount exceeds maximum allowed (30% of total shares).";
      }

      toast({
        title: "Purchase Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Sell player shares
   */
  const sellShares = async (params: SellSharesParams) => {
    if (!account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to sell shares.",
        variant: "destructive",
      });
      return null;
    }

    setIsProcessing(true);

    try {
      const tx = new Transaction();

      // Set gas budget
      tx.setGasBudget(SUI_CONFIG.gas.budget);

      // Call sell_shares function
      tx.moveCall({
        target: `${SUI_CONFIG.contracts.packageId}::valor::sell_shares`,
        arguments: [
          tx.object(SUI_CONFIG.contracts.platformObjectId), // platform
          tx.object(params.sharesObjectId), // shares_obj
          tx.pure.u64(params.sharesToSell), // shares_to_sell
          tx.pure.u64(suiToMist(params.minPricePerShare)), // min_price_per_share (in MIST)
          tx.object("0x6"), // clock
        ],
      });

      toast({
        title: "Transaction Submitted",
        description: `Selling ${params.sharesToSell} shares...`,
      });

      const result = await signAndExecute({
        transaction: tx,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        },
      });

      // Check if transaction was successful
      if (result.effects?.status?.status === "success") {
        toast({
          title: "Sale Successful! 💰",
          description: `Successfully sold ${params.sharesToSell} shares`,
        });

        return {
          success: true,
          digest: result.digest,
          effects: result.effects,
          events: result.events,
        };
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error: any) {
      console.error("Sell shares error:", error);

      let errorMessage = "Failed to sell shares. Please try again.";

      if (error.message?.includes("EInsufficientShares")) {
        errorMessage = "You don't have enough shares to sell.";
      } else if (error.message?.includes("EPriceSlippage")) {
        errorMessage = "Price changed too much. Please try again.";
      } else if (error.message?.includes("EInsufficientLiquidity")) {
        errorMessage =
          "Not enough liquidity in the pool. Try selling fewer shares.";
      }

      toast({
        title: "Sale Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    buyShares,
    sellShares,
    isProcessing,
    isConnected: !!account,
    address: account?.address,
  };
}
