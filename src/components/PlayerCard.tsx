import { useState } from "react";
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
  const isPositive = player.weeklyChange >= 0;

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBuy?.(player.id);
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
            {/* AI Score Badge */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/80 backdrop-blur-sm border border-border/50">
              <Zap className="w-3.5 h-3.5 text-warning" />
              <span className="text-xs font-semibold">{player.aiScore}</span>
            </div>
            {/* Position Badge */}
            <div className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-primary/80 backdrop-blur-sm">
              <span className="text-xs font-semibold text-primary-foreground">
                {player.position}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-5">
            <div className="mb-3">
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                {player.name}
              </h3>
              <p className="text-sm text-muted-foreground">{player.club}</p>
            </div>

            {/* Stats Preview */}
            {/* <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-muted/30 rounded-lg">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Goals</p>
                <p className="font-bold">{player.stats.goals}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Assists</p>
                <p className="font-bold">{player.stats.assists}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Matches</p>
                <p className="font-bold">{player.stats.matchesPlayed}</p>
              </div>
            </div> */}

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
                onAnalysisComplete={setAiAnalysis}
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
