import { Coins, Sparkles, TrendingUp } from "lucide-react";
import { useUserPoints } from "@/hooks/useUserPoints";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PULSE_POINTS_CONFIG } from "@/config/pulse-points.config";

interface PointsBadgeProps {
  variant?: "full" | "compact" | "icon";
  showAnimation?: boolean;
  className?: string;
}

export function PointsBadge({
  variant = "full",
  showAnimation = true,
  className,
}: PointsBadgeProps) {
  const currentAccount = useCurrentAccount();
  const { pointsData, isLoading } = useUserPoints();

  if (!currentAccount) {
    return null;
  }

  if (variant === "icon") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20",
                showAnimation && "animate-pulse-slow",
                className,
              )}
            >
              <Coins className="w-4 h-4 text-accent" />
              <span className="font-bold text-sm">
                {pointsData.currentPoints}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">Pulse Points</p>
            <p className="text-xs text-muted-foreground">
              Lifetime: {pointsData.lifetimePoints}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Coins className="w-4 h-4 text-accent" />
        <span className="font-semibold">{pointsData.currentPoints}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "glass-card p-4 border-accent/30",
        showAnimation && pointsData.currentPoints > 0 && "animate-border-glow",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Pulse Points</h3>
        </div>
        {pointsData.canUnlockAI && (
          <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-2xl font-bold text-accent">
            {pointsData.currentPoints}
          </p>
          <p className="text-xs text-muted-foreground">Current</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{pointsData.lifetimePoints}</p>
          <p className="text-xs text-muted-foreground">Lifetime</p>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Votes Cast</span>
          <span className="font-semibold">{pointsData.votesCount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Correct Predictions</span>
          <span className="font-semibold">{pointsData.correctPredictions}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">NFT Shares</span>
          <span className="font-semibold">{pointsData.nftSharesOwned}</span>
        </div>
      </div>

      {pointsData.canUnlockAI && (
        <div className="mt-3 p-2 rounded-lg bg-accent/10 border border-accent/20">
          <p className="text-xs text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span className="font-semibold">AI Unlock Available!</span>
          </p>
        </div>
      )}

      {!pointsData.canUnlockAI && pointsData.currentPoints > 0 && (
        <div className="mt-3 p-2 rounded-lg bg-muted/30">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">AI Unlock Progress</span>
            <span className="font-semibold">
              {pointsData.currentPoints}/{PULSE_POINTS_CONFIG.aiUnlockThreshold}
            </span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{
                width: `${
                  (pointsData.currentPoints /
                    PULSE_POINTS_CONFIG.aiUnlockThreshold) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface PointsEarnedAnimationProps {
  amount: number;
  reason: string;
  onComplete?: () => void;
}

export function PointsEarnedAnimation({
  amount,
  reason,
  onComplete,
}: PointsEarnedAnimationProps) {
  return (
    <div
      className="fixed top-20 right-4 z-50 animate-slide-in-right"
      onAnimationEnd={onComplete}
    >
      <div className="glass-card p-4 border-accent bg-accent/20 flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-accent" />
        <div>
          <p className="font-bold text-accent">+{amount} Points!</p>
          <p className="text-xs text-muted-foreground">{reason}</p>
        </div>
      </div>
    </div>
  );
}

export function InitializePointsPrompt() {
  const currentAccount = useCurrentAccount();
  const { pointsData } = useUserPoints();

  // Only show if user is connected and doesn't have a balance
  if (!currentAccount || pointsData.balanceObjectId) {
    return null;
  }

  return (
    <div className="glass-card p-6 border-accent/30 mb-6">
      <div className="flex items-center gap-4">
        <Coins className="w-12 h-12 text-accent" />
        <div className="flex-1">
          <h3 className="font-bold mb-1">Start Earning Pulse Points!</h3>
          <p className="text-sm text-muted-foreground">
            Initialize your points balance to start earning rewards for voting,
            predictions, and NFT investments.
          </p>
        </div>
        <button
          className="btn-gradient px-6 py-2 rounded-xl font-semibold"
          onClick={() => {
            // This will be handled by the integration
            console.log("Initialize points balance");
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
