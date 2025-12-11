// ============================================================================
// FILE: hooks/useBuySellShares.ts
// Custom hook for buying and selling player shares
// BUY/SELL ALWAYS USES CURRENT SEASON VALUE
// FIXED: Now supports selling across multiple NFT objects
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
  playerId: string; // On-chain player ID (NOT football player ID)
  playerName: string;
  shares: number;
  maxPricePerShare: number; // in SUI (ALWAYS CURRENT SEASON PRICE)
}

export interface SellSharesParams {
  operations: Array<{
    objectId: string; // The PlayerSharesNFT object ID
    amount: number; // Number of shares to sell from this object
  }>;
  minPricePerShare: number; // in SUI (ALWAYS CURRENT SEASON PRICE)
  playerName: string;
}

export function useBuySellShares() {
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Buy player shares
   * ALWAYS uses CURRENT SEASON base value for pricing
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
      console.log("🔵 Starting buy shares transaction:", {
        playerId: params.playerId,
        shares: params.shares,
        maxPricePerShare: params.maxPricePerShare,
        packageId: SUI_CONFIG.contracts.packageId,
        platformObjectId: SUI_CONFIG.contracts.platformObjectId,
      });

      const tx = new Transaction();

      // Set gas budget
      tx.setGasBudget(SUI_CONFIG.gas.budget);

      // Calculate payment amount (add 20% buffer for slippage and bonding curve)
      const estimatedCost = params.shares * params.maxPricePerShare * 1.2;
      const paymentAmount = suiToMist(estimatedCost);

      console.log("💰 Payment calculation:", {
        estimatedCost: estimatedCost.toFixed(4),
        paymentAmountMist: paymentAmount.toString(),
        shares: params.shares,
        maxPricePerShare: params.maxPricePerShare,
      });

      // Split coin for payment
      const [paymentCoin] = tx.splitCoins(tx.gas, [paymentAmount]);

      // Call buy_shares function
      tx.moveCall({
        target: `${SUI_CONFIG.contracts.packageId}::valor::buy_shares`,
        arguments: [
          tx.object(SUI_CONFIG.contracts.platformObjectId), // platform
          tx.pure.address(params.playerId), // player_id (on-chain ID)
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

      console.log("📤 Executing transaction...");

      const result = await signAndExecute({
        transaction: tx,
      });

      console.log("📥 Transaction result:", result);
      console.log("✅ Transaction successful!");

      toast({
        title: "Purchase Successful! 🎉",
        description: `You now own ${params.shares} shares of ${params.playerName}`,
      });

      return {
        success: true,
        digest: result.digest,
      };
    } catch (error: any) {
      console.error("❌ Buy shares error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause,
      });

      let errorMessage = "Failed to buy shares. Please try again.";

      const errorStr = error.message || error.toString();

      if (
        errorStr.includes("InsufficientCoinBalance") ||
        errorStr.includes("InsufficientGas")
      ) {
        errorMessage =
          "Insufficient SUI balance. Please add more SUI to your wallet.";
      } else if (errorStr.includes("EInsufficientPayment")) {
        errorMessage = "Insufficient SUI for purchase. Please add more SUI.";
      } else if (errorStr.includes("EPriceSlippage")) {
        errorMessage = "Price changed too much. Please try again.";
      } else if (errorStr.includes("EInsufficientShares")) {
        errorMessage = "Not enough shares available for purchase.";
      } else if (errorStr.includes("EMaxPurchaseExceeded")) {
        errorMessage =
          "Purchase amount exceeds maximum allowed (30% of total shares).";
      } else if (errorStr.includes("EPlayerNotFound")) {
        errorMessage =
          "Player not found on-chain. They may need to be registered first.";
      } else if (
        errorStr.includes("object") &&
        errorStr.includes("not found")
      ) {
        errorMessage =
          "Contract object not found. Please check the configuration.";
      } else if (
        errorStr.includes("rejected") ||
        errorStr.includes("User rejected")
      ) {
        errorMessage = "Transaction was rejected.";
      } else if (error.message && error.message !== "Transaction failed") {
        errorMessage = `Transaction failed: ${error.message}`;
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
   * Sell player shares across multiple NFT objects
   * ALWAYS uses CURRENT SEASON base value for pricing
   * Supports batch selling in a SINGLE transaction
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

    if (!params.operations || params.operations.length === 0) {
      toast({
        title: "Invalid Parameters",
        description: "No shares specified to sell.",
        variant: "destructive",
      });
      return null;
    }

    setIsProcessing(true);

    try {
      const totalShares = params.operations.reduce(
        (sum, op) => sum + op.amount,
        0
      );

      console.log("🔵 Starting sell shares transaction:", {
        operations: params.operations,
        totalShares,
        minPricePerShare: params.minPricePerShare,
      });

      const tx = new Transaction();

      // Set gas budget (higher for batch operations)
      tx.setGasBudget(SUI_CONFIG.gas.budget);

      // Call sell_shares for each operation in a single transaction
      for (const operation of params.operations) {
        console.log(
          `  - Selling ${operation.amount} shares from ${operation.objectId}`
        );

        tx.moveCall({
          target: `${SUI_CONFIG.contracts.packageId}::valor::sell_shares`,
          arguments: [
            tx.object(SUI_CONFIG.contracts.platformObjectId), // platform
            tx.object(operation.objectId), // nft (PlayerSharesNFT object)
            tx.pure.u64(operation.amount), // shares_to_sell
            tx.pure.u64(suiToMist(params.minPricePerShare)), // min_price_per_share (in MIST)
            tx.object("0x6"), // clock
          ],
        });
      }

      toast({
        title: "Transaction Submitted",
        description: `Selling ${totalShares} shares of ${params.playerName} across ${params.operations.length} object(s)...`,
      });

      console.log("📤 Executing transaction...");

      const result = await signAndExecute({
        transaction: tx,
      });

      console.log("📥 Transaction result:", result);
      console.log("✅ Transaction successful!");

      toast({
        title: "Sale Successful! 💰",
        description: `Successfully sold ${totalShares} shares of ${params.playerName}`,
      });

      return {
        success: true,
        digest: result.digest,
      };
    } catch (error: any) {
      console.error("❌ Sell shares error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause,
      });

      let errorMessage = "Failed to sell shares. Please try again.";

      const errorStr = error.message || error.toString();

      if (errorStr.includes("EInsufficientShares")) {
        errorMessage = "You don't have enough shares to sell.";
      } else if (errorStr.includes("EPriceSlippage")) {
        errorMessage = "Price changed too much. Please try again.";
      } else if (errorStr.includes("EInsufficientLiquidity")) {
        errorMessage =
          "Not enough liquidity in the pool. Try selling fewer shares.";
      } else if (
        errorStr.includes("rejected") ||
        errorStr.includes("User rejected")
      ) {
        errorMessage = "Transaction was rejected.";
      } else if (error.message && error.message !== "Transaction failed") {
        errorMessage = `Transaction failed: ${error.message}`;
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
