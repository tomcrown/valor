import { useState, useEffect } from "react";
import {
  Minus,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Package,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBuySellShares } from "@/hooks/useBuySellShares";
import { useUserShares } from "@/hooks/useUserShares";
import {
  useCurrentAccount,
  ConnectButton,
  useCurrentWallet,
} from "@mysten/dapp-kit";
import { toast } from "@/hooks/use-toast";
import { usePoints } from "@/context/PointsContext";
import { PULSE_POINTS_CONFIG } from "@/config/pulse-points.config";
import { useUserPoints } from "@/hooks/useUserPoints";

interface BuySellWidgetProps {
  playerId: string;
  onChainPlayerId?: string;
  playerName: string;
  currentPrice: number;
  onTransactionComplete: (pointsEarned: number) => void;
}

const BuySellWidget = ({
  playerId,
  onChainPlayerId,
  playerName,
  currentPrice,
  onTransactionComplete,
}: BuySellWidgetProps) => {
  const currentAccount = useCurrentAccount();
  const { currentWallet } = useCurrentWallet();
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState(1);

  // ✅ Get both the local hook and the context (same as voting)
  const {
    pointsData: localPointsData,
    optimisticAddPoints: localAddPoints
  } = useUserPoints();
  const {
    optimisticAddPoints: contextAddPoints
  } = usePoints();

  const {
    buyShares,
    sellShares,
    isProcessing,
    isEnokiWallet: isEnoki,
  } = useBuySellShares();

  const {
    shares,
    totalShares,
    isLoading: loadingShares,
    refetch: refetchShares,
  } = useUserShares(onChainPlayerId || "");

  const totalValue = quantity * currentPrice;
  const networkFee = 0.001;

  useEffect(() => {
    if (currentAccount) {
    }
  }, [currentAccount, isEnoki, onChainPlayerId, totalShares, shares]);

  const handleQuantityChange = (delta: number) => {
    const maxSellable = mode === "sell" ? totalShares : Infinity;
    setQuantity((prev) => Math.max(1, Math.min(maxSellable, prev + delta)));
  };

  const handleBuy = async () => {
    if (!onChainPlayerId) {
      toast({
        title: "Player Not Registered",
        description: `${playerName} is not registered on-chain yet.`,
        variant: "destructive",
      });
      return;
    }

    const result = await buyShares({
      playerId: onChainPlayerId,
      playerName,
      shares: quantity,
      maxPricePerShare: currentPrice * 1.05,
    });

    if (result?.success) {
      // ✅ Update BOTH local state and context (just like we did for voting)
      const pointsToAdd = quantity * PULSE_POINTS_CONFIG.nftSharePoints; // Points per share purchased

      localAddPoints(pointsToAdd);
      contextAddPoints(pointsToAdd);

      setQuantity(1);

      setTimeout(() => {
        refetchShares();
        onTransactionComplete?.(pointsToAdd);
      }, 2000);
    }
  };

  const handleSell = async () => {
    if (shares.length === 0) {
      toast({
        title: "No Shares",
        description: "You don't have any shares to sell.",
        variant: "destructive",
      });
      return;
    }

    let remainingToSell = quantity;
    const sortedShares = [...shares].sort((a, b) => b.shares - a.shares);
    const sellOperations: Array<{ objectId: string; amount: number }> = [];

    for (const shareObj of sortedShares) {
      if (remainingToSell <= 0) break;

      const sharesToSellFromThisObject = Math.min(
        remainingToSell,
        shareObj.shares
      );

      sellOperations.push({
        objectId: shareObj.objectId,
        amount: sharesToSellFromThisObject,
      });

      remainingToSell -= sharesToSellFromThisObject;
    }

    const result = await sellShares({
      operations: sellOperations,
      minPricePerShare: currentPrice * 0.95,
      playerName,
    });

    if (result?.success) {
      setQuantity(1);

      setTimeout(() => {
        refetchShares();
        onTransactionComplete?.(0);
      }, 2000);
    }
  };

  const handleSubmit = () => {
    if (mode === "buy") {
      handleBuy();
    } else {
      handleSell();
    }
  };

  return (
    <div className="glass-card p-6">
      {/* Wallet Type Indicator */}
      {currentAccount && isEnoki && (
        <div className="mb-4 p-3 rounded-2xl bg-info/10 border border-info/20 flex items-center gap-2 text-sm"></div>
      )}

      <div className="flex bg-muted rounded-xl p-1 mb-6">
        <button
          onClick={() => setMode("buy")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold transition-all",
            mode === "buy"
              ? "bg-green-500 text-white shadow-lg"
              : "text-gray-500 hover:text-foreground"
          )}
        >
          <ArrowUpRight className="w-4 h-4" />
          Buy
        </button>
        <button
          onClick={() => setMode("sell")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold transition-all",
            mode === "sell"
              ? "bg-red-400 text-white shadow-lg"
              : "text-gray-500 hover:text-foreground"
          )}
        >
          <ArrowDownRight className="w-4 h-4" />
          Sell
        </button>
      </div>

      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground mb-1">Current Price</p>
        <p className="text-3xl font-bold gradient-text">
          {currentPrice.toFixed(3)} SUI
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          ≈ ${(currentPrice * 2.5).toFixed(2)} USD
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground">Quantity</p>
          {mode === "sell" && totalShares > 0 && (
            <p className="text-xs text-accent">You own: {totalShares} shares</p>
          )}
        </div>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handleQuantityChange(-1)}
            disabled={isProcessing || (mode === "sell" && quantity <= 1)}
            className="w-12 h-12 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus className="w-5 h-5" />
          </button>
          <div className="w-24 text-center">
            <span className="text-3xl font-bold">{quantity}</span>
          </div>
          <button
            onClick={() => handleQuantityChange(1)}
            disabled={
              isProcessing || (mode === "sell" && quantity >= totalShares)
            }
            className="w-12 h-12 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {mode === "sell" && totalShares > 0 && (
          <div className="mt-3 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(totalShares)}
              className="text-xs"
            >
              Sell All ({totalShares})
            </Button>
          </div>
        )}
      </div>

      <div className="bg-muted/50 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Value</span>
          <span className="text-xl font-bold">{totalValue.toFixed(3)} SUI</span>
        </div>
        <div className="flex justify-between items-center mt-2 text-sm">
          <span className="text-muted-foreground">Network Fee</span>
          <span className="text-muted-foreground">~{networkFee} SUI</span>
        </div>
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-border/50">
          <span className="font-semibold">Total Cost</span>
          <span className="font-bold text-accent">
            {(totalValue + networkFee).toFixed(3)} SUI
          </span>
        </div>
      </div>

      {currentAccount ? (
        <>
          {mode === "sell" && totalShares === 0 ? (
            <div className="w-full py-6 px-4 rounded-xl bg-muted/50 text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                You don't own any shares of {playerName}
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setMode("buy")}
                className="mt-2"
              >
                Buy some shares first
              </Button>
            </div>
          ) : !onChainPlayerId && mode === "buy" ? (
            <div className="w-full py-6 px-4 rounded-xl bg-muted/50 text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-warning" />
              <p className="text-sm text-muted-foreground">
                {playerName} is not registered on-chain yet
              </p>
            </div>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={
                isProcessing ||
                loadingShares ||
                (mode === "sell" && totalShares === 0) ||
                (mode === "buy" && !onChainPlayerId)
              }
              className={cn(
                "w-full py-6 text-lg font-semibold transition-all",
                mode === "buy"
                  ? "bg-green-500 hover:bg-green/90 text-white"
                  : "bg-red-400 hover:bg-red/90 text-white"
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : loadingShares ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  {mode === "buy" ? "Buy" : "Sell"} {quantity} Share
                  {quantity > 1 ? "s" : ""}
                </>
              )}
            </Button>
          )}
        </>
      ) : (
        <div className="w-full">
          <ConnectButton className="w-full py-6 text-lg font-semibold" />
          <p className="text-xs text-muted-foreground text-center mt-3">
            LogIn to start trading
          </p>
        </div>
      )}
    </div>
  );
};

export default BuySellWidget;