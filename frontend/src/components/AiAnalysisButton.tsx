import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Player, SeasonPeriod } from "@/data/dummyData";
import type { AIAnalysis } from "@/lib/openai";
import { analyzePlayer } from "@/lib/openai";

interface AIAnalysisButtonProps {
  player: Player;
  selectedSeason: SeasonPeriod;
  onAnalysisComplete?: (analysis: AIAnalysis) => void;
}

export function AIAnalysisButton({
  player,
  selectedSeason,
  onAnalysisComplete,
}: AIAnalysisButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const seasonStats = player.seasonalStats[selectedSeason];

      const result = await analyzePlayer({
        name: player.name,
        position: player.position,
        team: player.club,
        goals: seasonStats.goals,
        assists: seasonStats.assists,
        minutesPlayed: seasonStats.minutesPlayed,
        matchesPlayed: seasonStats.matchesPlayed,
        currentValue: player.currentValue,
        weeklyChange: player.weeklyChange,
        season: selectedSeason,
      });

      onAnalysisComplete?.(result);

      // Save to localStorage with season key
      localStorage.setItem(
        `ai-analysis-${player.id}-${selectedSeason}`,
        JSON.stringify(result)
      );
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("AI analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        className="btn-gradient"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Run AI Analysis
          </>
        )}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
