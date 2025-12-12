import { useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useCurrentWallet,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { SUI_CONFIG, suiToMist } from "@/config/sui.config";
import { toast } from "@/hooks/use-toast";
import { isEnokiWallet } from "@mysten/enoki";

export interface BuySharesParams {
  playerId: string;
  playerName: string;
  shares: number;
  maxPricePerShare: number;
}

export interface SellSharesParams {
  operations: Array<{
    objectId: string;
    amount: number;
  }>;
  minPricePerShare: number;
  playerName: string;
}

export function useBuySellShares() {
  const currentAccount = useCurrentAccount();
  const { currentWallet } = useCurrentWallet();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if using Enoki wallet
  const isEnoki = currentWallet && isEnokiWallet(currentWallet);

  const buyShares = async (params: BuySharesParams) => {
    if (!currentAccount) {
      toast({
        title: "Not Connected",
        description: "Please log in to buy shares.",
        variant: "destructive",
      });
      return null;
    }

    setIsProcessing(true);

    try {
      console.log("🔵 Starting buy shares transaction:", {
        ...params,
        walletType: isEnoki ? "Enoki (zkLogin)" : "Standard Sui Wallet",
        address: currentAccount.address,
      });

      const tx = new Transaction();

      // Set gas budget - Enoki wallets might need higher budget
      // const gasBudget = isEnoki
      //   ? SUI_CONFIG.gas.budget * 1.5
      //   : SUI_CONFIG.gas.budget;

      // tx.setGasBudget(gasBudget);

      // Calculate payment amount with buffer
      const estimatedCost = params.shares * params.maxPricePerShare;
      console.log("Estimated cost (with buffer):", estimatedCost);
      const paymentAmount = suiToMist(estimatedCost);

      console.log("💰 Payment calculation:", {
        shares: params.shares,
        maxPricePerShare: params.maxPricePerShare,
        estimatedCost,
        paymentAmount: paymentAmount.toString(),
      });

      // Split coins for payment
      const [paymentCoin] = tx.splitCoins(tx.gas, [paymentAmount]);
      console.log("🪙 Payment coin prepared:", paymentAmount);

      // Call buy_shares function
      tx.moveCall({
        target: `${SUI_CONFIG.contracts.packageId}::valor::buy_shares`,
        arguments: [
          tx.object(SUI_CONFIG.contracts.platformObjectId),
          tx.pure.address(params.playerId),
          tx.pure.u64(params.shares),
          tx.pure.u64(suiToMist(params.maxPricePerShare)),
          paymentCoin,
          tx.object("0x6"), // Clock object
        ],
      });

      toast({
        title: "Transaction Submitted",
        description: `Buying ${params.shares} shares of ${params.playerName}...`,
      });

      // Execute transaction with proper options
      const result = await signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log("✅ Transaction successful:", result.digest);
          },
          onError: (error) => {
            console.error("❌ Transaction failed:", error);
          },
        }
      );

      console.log("✅ Buy transaction result:", result);

      // Wait a bit for blockchain to process
      await new Promise((resolve) => setTimeout(resolve, 2000));

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
      } else if (errorStr.includes("rejected") || errorStr.includes("denied")) {
        errorMessage = "Transaction was rejected.";
      } else if (errorStr.includes("Enoki")) {
        errorMessage = "zkLogin wallet error. Please try reconnecting.";
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

  const sellShares = async (params: SellSharesParams) => {
    if (!currentAccount) {
      toast({
        title: "Not Connected",
        description: "Please login to sell shares.",
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
        walletType: isEnoki ? "Enoki (zkLogin)" : "Standard Sui Wallet",
        address: currentAccount.address,
      });

      const tx = new Transaction();

      // Add all sell operations
      for (const operation of params.operations) {
        console.log(
          `📤 Selling ${operation.amount} shares from ${operation.objectId}`
        );

        tx.moveCall({
          target: `${SUI_CONFIG.contracts.packageId}::valor::sell_shares`,
          arguments: [
            tx.object(SUI_CONFIG.contracts.platformObjectId),
            tx.object(operation.objectId),
            tx.pure.u64(operation.amount),
            tx.pure.u64(suiToMist(params.minPricePerShare)),
            tx.object("0x6"), // Clock object
          ],
        });
      }

      toast({
        title: "Transaction Submitted",
        description: `Selling ${totalShares} shares of ${params.playerName}...`,
      });

      // Execute transaction
      const result = await signAndExecuteTransaction(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log("✅ Transaction successful:", result.digest);
          },
          onError: (error) => {
            console.error("❌ Transaction failed:", error);
          },
        }
      );

      console.log("✅ Sell transaction result:", result);

      // Wait a bit for blockchain to process
      await new Promise((resolve) => setTimeout(resolve, 2000));

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

      let errorMessage = "Failed to sell shares. Please try again.";

      const errorStr = error.message || error.toString();

      if (errorStr.includes("EInsufficientShares")) {
        errorMessage = "You don't have enough shares to sell.";
      } else if (errorStr.includes("EPriceSlippage")) {
        errorMessage = "Price changed too much. Please try again.";
      } else if (errorStr.includes("rejected") || errorStr.includes("denied")) {
        errorMessage = "Transaction was rejected.";
      } else if (errorStr.includes("Enoki")) {
        errorMessage = "zkLogin wallet error. Please try reconnecting.";
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
    isConnected: !!currentAccount,
    address: currentAccount?.address,
    isEnokiWallet: isEnoki,
  };
}
