import { useState } from "react";
import { SwapModal } from "@/components/SwapModal";
import {
  Minus,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Wallet,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBuySellShares } from "@/hooks/useBuySellShares";
import { useUserShares } from "@/hooks/useUserShares";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { ConnectButton } from "@mysten/dapp-kit";
import { toast } from "@/hooks/use-toast";

interface BuySellWidgetProps {
  playerId: string;
  onChainPlayerId?: string;
  playerName: string;
  currentPrice: number;
  onTransactionComplete?: () => void;
}

const BuySellWidget = ({
  playerId,
  onChainPlayerId,
  playerName,
  currentPrice,
  onTransactionComplete,
}: BuySellWidgetProps) => {
  const account = useCurrentAccount();
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState(1);
  const [selectedSharesObject, setSelectedSharesObject] = useState<string>("");
  const { buyShares, sellShares, isProcessing } = useBuySellShares();

  // Use onChainPlayerId for fetching shares, not the football playerId
  const {
    shares,
    totalShares,
    isLoading: loadingShares,
    refetch: refetchShares,
  } = useUserShares(onChainPlayerId || "");

  const totalValue = quantity * currentPrice;
  const networkFee = 0.001;

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
      setQuantity(1);
      refetchShares();
      onTransactionComplete?.();
    }
  };

  const handleSell = async () => {
    if (shares.length === 0) {
      return;
    }

    // Calculate which objects to sell from
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

    console.log(
      `Selling ${quantity} shares across ${sellOperations.length} objects in ONE transaction`
    );

    const result = await sellShares({
      operations: sellOperations,
      minPricePerShare: currentPrice * 0.95,
      playerName,
    });

    if (result?.success) {
      setQuantity(1);
      refetchShares();
      onTransactionComplete?.();
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
      <div className="flex bg-muted rounded-xl p-1 mb-6">
        <button
          onClick={() => setMode("buy")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all",
            mode === "buy"
              ? "bg-success text-success-foreground shadow-lg"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ArrowUpRight className="w-4 h-4" />
          Buy
        </button>
        <button
          onClick={() => setMode("sell")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all",
            mode === "sell"
              ? "bg-destructive text-destructive-foreground shadow-lg"
              : "text-muted-foreground hover:text-foreground"
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

      {account ? (
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
              <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
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
                  ? "bg-success hover:bg-success/90 text-success-foreground"
                  : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
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
            Connect your wallet to start trading
          </p>
        </div>
      )}

      {account && (
        <div className="mt-4 p-3 rounded-lg bg-muted/30 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="w-3 h-3" />
            <span className="font-mono">
              {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </span>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center mt-4">
        Powered by Sui • Verified by Walrus
      </p>
    </div>
  );
};

export default BuySellWidget;
