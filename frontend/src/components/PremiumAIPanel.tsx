import { useState } from "react";
import {
  Lock,
  Unlock,
  Sparkles,
  TrendingUp,
  Lightbulb,
  AlertCircle,
  Coins,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePointsOperations } from "@/hooks/usePointsOperations";
import { PULSE_POINTS_CONFIG } from "@/config/pulse-points.config";
import { cn } from "@/lib/utils";
import type { SeasonPeriod } from "@/data/apiData";

export interface PublicAIData {
  performance_score: number;
  form_status: string;
  performance_trend: string;
  short_summary: string;
}

export interface PremiumAIData {
  prediction: string;
  key_factors: string[];
  reasoning: string;
}

interface PremiumAIPanelEnhancedProps {
  publicData: PublicAIData;
  premiumData: PremiumAIData;
  playerId: string;
  playerName: string;
  season: SeasonPeriod;
  userOwnsNFT: boolean;
  userShares: number;
  userPoints: number;
  userPointsBalanceId: string | null;
}

type UnlockMethod = "nft" | "points";

export function PremiumAIPanelEnhanced({
  publicData,
  premiumData,
  playerId,
  playerName,
  season,
  userOwnsNFT,
  userShares,
  userPoints,
  userPointsBalanceId,
}: PremiumAIPanelEnhancedProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<UnlockMethod>("nft");
  const { spendPointsForAI, isProcessing } = usePointsOperations();

  const canUnlockWithNFT = userOwnsNFT;
  const canUnlockWithPoints =
    userPoints >= PULSE_POINTS_CONFIG.aiUnlockThreshold;
  const canUnlock = canUnlockWithNFT || canUnlockWithPoints;

  const handleUnlockWithNFT = async () => {
    if (!userOwnsNFT) {
      setUnlockError("You need to own shares to access premium insights");
      return;
    }

    setUnlockError(null);
    setIsUnlocked(true);
  };

  const handleUnlockWithPoints = async () => {
    if (!userPointsBalanceId) {
      setUnlockError("Points balance not initialized");
      return;
    }

    if (!canUnlockWithPoints) {
      setUnlockError(
        `You need ${PULSE_POINTS_CONFIG.aiUnlockThreshold} points to unlock`,
      );
      return;
    }

    const success = await spendPointsForAI(userPointsBalanceId);

    if (success) {
      setUnlockError(null);
      setIsUnlocked(true);
    } else {
      setUnlockError("Failed to spend points. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Public Data */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Performance Overview</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">AI Score</p>
            <p className="text-2xl font-bold text-accent">
              {publicData.performance_score}/100
            </p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Form Status</p>
            <p className="text-lg font-semibold capitalize">
              {publicData.form_status}
            </p>
          </div>
        </div>

        <div className="bg-muted/30 rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-2">Trend</p>
          <div className="flex items-center gap-2">
            <TrendingUp
              className={cn(
                "w-5 h-5",
                publicData.performance_trend === "improving"
                  ? "text-success"
                  : publicData.performance_trend === "declining"
                    ? "text-destructive"
                    : "text-warning",
              )}
            />
            <span className="font-semibold capitalize">
              {publicData.performance_trend}
            </span>
          </div>
        </div>

        {publicData.short_summary && (
          <div className="mt-4 p-4 rounded-xl bg-accent/10 border border-accent/20">
            <p className="text-sm italic">"{publicData.short_summary}"</p>
          </div>
        )}
      </div>

      {/* Premium Data */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <Unlock className="w-5 h-5 text-success" />
            ) : (
              <Lock className="w-5 h-5 text-warning" />
            )}
            <h3 className="font-semibold">Premium Insights</h3>
          </div>

          <div className="flex items-center gap-2">
            {userOwnsNFT && (
              <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {userShares} NFT{userShares !== 1 ? "s" : ""}
              </span>
            )}
            {canUnlockWithPoints && (
              <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full flex items-center gap-1">
                <Coins className="w-3 h-3" />
                {userPoints} points
              </span>
            )}
          </div>
        </div>

        {!isUnlocked ? (
          <div className="space-y-4">
            <div className="bg-muted/20 backdrop-blur-sm rounded-xl p-6 border-2 border-dashed border-warning/30">
              <div className="text-center space-y-4">
                <Lock className="w-12 h-12 mx-auto text-warning" />
                <div>
                  <p className="font-semibold mb-1">Unlock Premium Analysis</p>
                  <p className="text-sm text-muted-foreground">
                    Detailed predictions, key factors, and expert reasoning
                  </p>
                </div>

                {canUnlock ? (
                  <div className="space-y-4">
                    <Tabs
                      value={selectedMethod}
                      onValueChange={(v) =>
                        setSelectedMethod(v as UnlockMethod)
                      }
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="nft" disabled={!canUnlockWithNFT}>
                          <Shield className="w-4 h-4 mr-2" />
                          Use NFT
                        </TabsTrigger>
                        <TabsTrigger
                          value="points"
                          disabled={!canUnlockWithPoints}
                        >
                          <Coins className="w-4 h-4 mr-2" />
                          Use Points
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="nft" className="mt-4">
                        <Button
                          onClick={handleUnlockWithNFT}
                          disabled={!canUnlockWithNFT}
                          className="w-full"
                        >
                          <Unlock className="w-4 h-4 mr-2" />
                          Unlock with NFT
                        </Button>
                        <p className="text-xs text-center mt-2 text-muted-foreground">
                          You own {userShares} share
                          {userShares !== 1 ? "s" : ""}
                        </p>
                      </TabsContent>

                      <TabsContent value="points" className="mt-4">
                        <Button
                          onClick={handleUnlockWithPoints}
                          disabled={isProcessing || !canUnlockWithPoints}
                          className="w-full"
                          variant="secondary"
                        >
                          {isProcessing ? (
                            <>Processing...</>
                          ) : (
                            <>
                              <Coins className="w-4 h-4 mr-2" />
                              Spend {PULSE_POINTS_CONFIG.aiUnlockThreshold}{" "}
                              Points
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-center mt-2 text-muted-foreground">
                          Balance: {userPoints} points
                        </p>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-warning flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Choose an unlock method
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• Buy shares to unlock with NFT</p>
                      <p>
                        • Earn {PULSE_POINTS_CONFIG.aiUnlockThreshold} points to
                        unlock
                      </p>
                    </div>
                  </div>
                )}

                {unlockError && (
                  <p className="text-sm text-destructive">{unlockError}</p>
                )}
              </div>
            </div>

            {/* Preview of locked content */}
            <div className="space-y-3 opacity-40 pointer-events-none">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
              <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Unlocked Premium Content */}
            <div className="bg-success/10 border border-success/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-success">
                <Unlock className="w-4 h-4" />
                <span className="text-sm font-semibold">Premium Unlocked</span>
              </div>
            </div>

            {/* Prediction */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                Future Outlook
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {premiumData.prediction}
              </p>
            </div>

            {/* Key Factors */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-warning" />
                Key Factors
              </h4>
              <ul className="space-y-2">
                {premiumData.key_factors.map((factor, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-3 flex items-start gap-2"
                  >
                    <span className="text-accent font-semibold flex-shrink-0">
                      {index + 1}.
                    </span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reasoning */}
            <div>
              <h4 className="font-semibold mb-2">Expert Analysis</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {premiumData.reasoning}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
