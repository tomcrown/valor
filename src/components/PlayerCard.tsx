// ============================================================================
// FILE 1: src/components/PlayerCard.tsx (UPDATED)
// PlayerCard with dynamic AI score and trend updates
// ============================================================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AIAnalysisButton } from "@/components/AiAnalysisButton";
import { AIAnalysisPanel } from "@/components/AiAnalysisPanel";
import type { Player } from "@/data/dummyData";
import type { AIAnalysis } from "@/lib/openai";

interface PlayerCardProps {
  player: Player;
  onBuy?: (playerId: string) => void;
}

const PlayerCard = ({ player, onBuy }: PlayerCardProps) => {
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);

  // Dynamic AI score - updates when analysis is complete
  const displayAiScore = aiAnalysis?.performance_score ?? player.aiScore;

  // Dynamic trend - based on AI analysis or weekly change
  const displayTrend =
    aiAnalysis?.trend ??
    (player.weeklyChange > 5
      ? "up"
      : player.weeklyChange < -5
      ? "down"
      : "stable");

  const isPositive = player.weeklyChange >= 0;

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBuy?.(player.id);
  };

  const handleAnalysisComplete = (analysis: AIAnalysis) => {
    setAiAnalysis(analysis);
    // Optional: Save to localStorage for persistence
    localStorage.setItem(`ai-analysis-${player.id}`, JSON.stringify(analysis));
  };

  // Load cached analysis on mount
  useEffect(() => {
    const cached = localStorage.getItem(`ai-analysis-${player.id}`);
    if (cached) {
      try {
        setAiAnalysis(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached analysis");
      }
    }
  }, [player.id]);

  // Get trend icon and color
  const getTrendIcon = () => {
    switch (displayTrend) {
      case "up":
        return <TrendingUp className="w-3.5 h-3.5 text-success" />;
      case "down":
        return <TrendingDown className="w-3.5 h-3.5 text-destructive" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (displayTrend) {
      case "up":
        return "text-success border-success/20 bg-success/5";
      case "down":
        return "text-destructive border-destructive/20 bg-destructive/5";
      default:
        return "text-muted-foreground border-border/50 bg-muted/50";
    }
  };

  return (
    <div className="space-y-4">
      <Link to={`/players/${player.id}`}>
        <div className="player-card group">
          {/* Image Section */}
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card z-10" />
            <img
              src={player.imageUrl}
              alt={player.name}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            />

            {/* AI Score Badge - NOW DYNAMIC */}
            <div
              className={cn(
                "absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm border transition-all",
                aiAnalysis
                  ? "bg-accent/80 border-accent animate-pulse-slow"
                  : "bg-card/80 border-border/50"
              )}
            >
              <Zap
                className={cn(
                  "w-3.5 h-3.5",
                  aiAnalysis ? "text-white" : "text-warning"
                )}
              />
              <span
                className={cn(
                  "text-xs font-semibold",
                  aiAnalysis ? "text-white" : ""
                )}
              >
                {displayAiScore}
              </span>
              {aiAnalysis && (
                <span className="text-[10px] text-white/80 ml-0.5">AI</span>
              )}
            </div>

            {/* Position Badge */}
            <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-primary/80 backdrop-blur-sm">
              <span className="text-xs font-semibold text-primary-foreground">
                {player.position}
              </span>
            </div>

            {/* Trend Indicator - NOW DYNAMIC */}
            {displayTrend !== "stable" && (
              <div
                className={cn(
                  "absolute bottom-3 left-3 z-20 flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm border text-xs font-semibold transition-all",
                  getTrendColor()
                )}
              >
                {getTrendIcon()}
                <span className="uppercase text-[10px]">{displayTrend}</span>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-5">
            <div className="mb-3">
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                {player.name}
              </h3>
              <p className="text-sm text-muted-foreground">{player.club}</p>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  Current Value
                </p>
                <p className="text-xl font-bold">${player.currentValue}</p>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 rounded-lg",
                  isPositive
                    ? "bg-success/10 text-success"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-semibold">
                  {isPositive ? "+" : ""}
                  {player.weeklyChange.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <AIAnalysisButton
                player={player}
                onAnalysisComplete={handleAnalysisComplete}
              />

              <Button
                onClick={handleBuy}
                className="w-full btn-gradient text-primary-foreground font-semibold"
              >
                Buy Shares
              </Button>
            </div>
          </div>
        </div>
      </Link>

      {/* AI Analysis Panel (appears below card) */}
      {aiAnalysis && (
        <AIAnalysisPanel analysis={aiAnalysis} playerName={player.name} />
      )}
    </div>
  );
};

export default PlayerCard;
