import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AIAnalysisDialog } from "@/components/AiAnalysisDialog";
import { useAutoAIAnalysis } from "@/hooks/useAutoAIAnalysis";
import { getSeasonBaseValue } from "@/lib/suiDataFetcher";
import type { Player, SeasonPeriod } from "@/data/dummyData";

interface PlayerCardProps {
  player: Player;
  onBuy?: (playerId: string) => void;
  selectedSeason: SeasonPeriod;
}

const PlayerCard = ({ player, onBuy, selectedSeason }: PlayerCardProps) => {
  // Auto-run AI analysis on mount (with cache check)
  const { analysis: aiAnalysis, isAnalyzing } = useAutoAIAnalysis({
    player,
    selectedSeason,
    autoRun: true, // Automatically analyze on mount
  });

  // Get stats for selected season
  const seasonStats = player.seasonalStats[selectedSeason];

  // Get season-specific price for DISPLAY
  const displayPrice = getSeasonBaseValue(player as any, selectedSeason);

  // Dynamic AI score with loading state
  const displayAiScore = aiAnalysis?.performance_score ?? player.aiScore;

  // Use performance_trend from AI (not market trend)
  const displayTrend = aiAnalysis?.performance_trend
    ? aiAnalysis.performance_trend === "improving"
      ? "up"
      : aiAnalysis.performance_trend === "declining"
      ? "down"
      : "stable"
    : player.weeklyChange > 5
    ? "up"
    : player.weeklyChange < -5
    ? "down"
    : "stable";

  const isPositive = player.weeklyChange >= 0;

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBuy?.(player.id);
  };

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

  const getSeasonLabel = () => {
    switch (selectedSeason) {
      case "early":
        return "Early";
      case "mid":
        return "Mid";
      case "current":
        return "Current";
    }
  };

  return (
    <div className="space-y-4">
      <Link to={`/players/${player.id}`} state={{ selectedSeason }}>
        <div className="player-card group">
          {/* Image Section */}
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card z-10" />
            <img
              src={player.imageUrl}
              alt={player.name}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            />

            {/* Season Indicator */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-card/90 backdrop-blur-sm border border-border/50">
              <Calendar className="w-3 h-3 text-accent" />
              <span className="text-[10px] font-semibold text-muted-foreground">
                {getSeasonLabel()}
              </span>
            </div>

            {/* AI Score Badge */}
            <div
              className={cn(
                "absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm border transition-all",
                aiAnalysis
                  ? "bg-accent/80 border-accent"
                  : isAnalyzing
                  ? "bg-card/80 border-accent/50 animate-pulse"
                  : "bg-card/80 border-border/50"
              )}
            >
              {isAnalyzing ? (
                <Sparkles className="w-3.5 h-3.5 text-accent animate-spin" />
              ) : (
                <Zap
                  className={cn(
                    "w-3.5 h-3.5",
                    aiAnalysis ? "text-white" : "text-warning"
                  )}
                />
              )}
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
            <div className="absolute bottom-14 left-3 z-20 px-2.5 py-1 rounded-full bg-primary/80 backdrop-blur-sm">
              <span className="text-xs font-semibold text-primary-foreground">
                {player.position}
              </span>
            </div>

            {/* Trend Indicator - Now shows performance trend */}
            {displayTrend !== "stable" && (
              <div
                className={cn(
                  "absolute bottom-3 left-3 z-20 flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-sm border text-xs font-semibold transition-all",
                  getTrendColor()
                )}
              >
                {getTrendIcon()}
                <span className="uppercase text-[10px]">
                  {aiAnalysis ? "FORM" : "TREND"}
                </span>
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

            {/* Season Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-muted/30 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-bold text-primary">
                  {seasonStats.goals}
                </p>
                <p className="text-[10px] text-muted-foreground">Goals</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-secondary">
                  {seasonStats.assists}
                </p>
                <p className="text-[10px] text-muted-foreground">Assists</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-accent">
                  {seasonStats.matchesPlayed}
                </p>
                <p className="text-[10px] text-muted-foreground">Matches</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">
                  {selectedSeason === "current"
                    ? "Current Value"
                    : `${getSeasonLabel()} Value`}
                </p>
                <p className="text-xl font-bold">
                  {displayPrice.toFixed(4)} SUI
                </p>
                {selectedSeason !== "current" && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Historical
                  </p>
                )}
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
              {/* AI Analysis Dialog */}
              <div onClick={(e) => e.preventDefault()}>
                <AIAnalysisDialog
                  player={player}
                  selectedSeason={selectedSeason}
                />
              </div>

              <Button
                onClick={handleBuy}
                className="w-full btn-gradient text-primary-foreground font-semibold"
              >
                {selectedSeason === "current" ? "Buy Shares" : "View Details"}
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PlayerCard;
