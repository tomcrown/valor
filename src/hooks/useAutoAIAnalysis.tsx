import { useState, useEffect, useRef } from "react";
import { analyzePlayer } from "@/lib/openai";
import type { Player, SeasonPeriod } from "@/data/dummyData";
import type { AIAnalysis } from "@/lib/openai";

interface UseAutoAIAnalysisOptions {
  player: Player;
  selectedSeason: SeasonPeriod;
  autoRun?: boolean; // Whether to auto-run analysis on mount
  onAnalysisComplete?: (analysis: AIAnalysis) => void;
}

export function useAutoAIAnalysis({
  player,
  selectedSeason,
  autoRun = true,
  onAnalysisComplete,
}: UseAutoAIAnalysisOptions) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Reset on season change
    hasRunRef.current = false;

    const cacheKey = `ai-analysis-${player.id}-${selectedSeason}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsedAnalysis = JSON.parse(cached);
        setAnalysis(parsedAnalysis);
        onAnalysisComplete?.(parsedAnalysis);
        return;
      } catch (e) {
        console.error("Failed to parse cached analysis");
      }
    }

    // Auto-run analysis if enabled and not already running
    if (autoRun && !hasRunRef.current && !isAnalyzing) {
      hasRunRef.current = true;
      runAnalysis();
    }
  }, [player.id, selectedSeason]);

  const runAnalysis = async () => {
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

      setAnalysis(result);
      onAnalysisComplete?.(result);

      // Cache the result
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

  return {
    analysis,
    isAnalyzing,
    error,
    runAnalysis,
  };
}
