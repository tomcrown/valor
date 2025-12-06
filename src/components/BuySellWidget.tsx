import { useState } from "react";
import { SwapModal } from "@/components/SwapModal";
import { Minus, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BuySellWidgetProps {
  playerName: string;
  currentPrice: number;
  onBuy?: (quantity: number) => void;
  onSell?: (quantity: number) => void;
}

const BuySellWidget = ({
  playerName,
  currentPrice,
  onBuy,
  onSell,
}: BuySellWidgetProps) => {
  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState(1);

  const totalValue = quantity * currentPrice;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleSubmit = () => {
    if (mode === "buy") {
      onBuy?.(quantity);
      console.log(
        `Buy ${quantity} shares of ${playerName} at $${currentPrice} each`
      );
    } else {
      onSell?.(quantity);
      console.log(
        `Sell ${quantity} shares of ${playerName} at $${currentPrice} each`
      );
    }
  };

  return (
    <div className="glass-card p-6">
      {/* Mode Toggle */}
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

      {/* Price Display */}
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground mb-1">Current Price</p>
        <p className="text-3xl   font-bold gradient-text">
          ${currentPrice.toLocaleString()}
        </p>
      </div>

      {/* Quantity Selector */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-3">Quantity</p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handleQuantityChange(-1)}
            className="w-12 h-12 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <Minus className="w-5 h-5" />
          </button>
          <div className="w-24 text-center">
            <span className="text-3xl   font-bold">{quantity}</span>
          </div>
          <button
            onClick={() => handleQuantityChange(1)}
            className="w-12 h-12 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Total */}
      <div className="bg-muted/50 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Total Value</span>
          <span className="text-xl   font-bold">
            ${totalValue.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center mt-2 text-sm">
          <span className="text-muted-foreground">Network Fee</span>
          <span className="text-muted-foreground">~0.001 SUI</span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        className={cn(
          "w-full py-6 text-lg font-semibold transition-all",
          mode === "buy"
            ? "bg-success hover:bg-success/90 text-success-foreground"
            : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
        )}
      >
        {mode === "buy" ? "Buy" : "Sell"} {quantity} Share
        {quantity > 1 ? "s" : ""}
      </Button>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center mt-4">
        Powered by Sui • Verified by Walrus
      </p>
    </div>
  );
};

export default BuySellWidget;
