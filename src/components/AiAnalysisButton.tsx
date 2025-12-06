import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Player } from "@/data/dummyData";
import type { AIAnalysis } from "@/lib/openai";
import { analyzePlayer } from "@/lib/openai";

interface AIAnalysisButtonProps {
  player: Player;
  onAnalysisComplete: (analysis: AIAnalysis) => void;
}

export function AIAnalysisButton({
  player,
  onAnalysisComplete,
}: AIAnalysisButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAnalyzing(true);

    try {
      const analysis = await analyzePlayer({
        name: player.name,
        position: player.position,
        team: player.club,
        goals: player.stats.goals,
        assists: player.stats.assists,
        minutesPlayed: player.stats.minutesPlayed,
        matchesPlayed: player.stats.matchesPlayed,
        currentValue: player.currentValue,
        weeklyChange: player.weeklyChange,
      });

      onAnalysisComplete(analysis);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("AI analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Button
      onClick={handleAnalyze}
      disabled={isAnalyzing}
      variant="outline"
      className="w-full border-accent/30 hover:bg-accent/10 hover:border-accent transition-all"
    >
      {isAnalyzing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 mr-2" />
          AI Analysis
        </>
      )}
    </Button>
  );
}
