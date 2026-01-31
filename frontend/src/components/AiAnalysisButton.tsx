import { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Player, SeasonPeriod } from "@/data/apiData";
import type { AIAnalysis } from "@/lib/openai";
import { analyzePlayer } from "@/lib/openai";

interface AIAnalysisButtonProps {
  player: Player;
  selectedSeason: SeasonPeriod;
  onRunAnalysis: () => void;
}

export function AIAnalysisButton({
  player,
  selectedSeason,
  onRunAnalysis,
}: AIAnalysisButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storageKey = `ai-analysis-${player.id}-${player.club}-${selectedSeason}`;

  const [hasAnalyzed, setHasAnalyzed] = useState(() => {
    return !!localStorage.getItem(storageKey);
  });

  useEffect(() => {
    setHasAnalyzed(!!localStorage.getItem(storageKey));
  }, [storageKey]);

  const handleAnalyze = async () => {
    if (hasAnalyzed) return;

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
      setHasAnalyzed(true);
      onRunAnalysis();

      localStorage.setItem(storageKey, JSON.stringify(result));

    } catch (err) {
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing || hasAnalyzed}
        className="btn-gradient disabled:opacity-60"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : hasAnalyzed ? (
          "AI Analysis Completed"
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
