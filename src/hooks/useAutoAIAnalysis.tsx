import { useState, useEffect, useRef, useCallback } from "react";
import { analyzePlayer } from "@/lib/openai";
import type { Player, SeasonPeriod } from "@/data/dummyData";
import type { AIAnalysis } from "@/lib/openai";

interface UseAutoAIAnalysisOptions {
  player: Player | null; // allow null safely
  selectedSeason: SeasonPeriod;
  autoRun?: boolean;
  onAnalysisComplete?: (analysis: AIAnalysis) => void;
}

export function useAutoAIAnalysis({
  player,
  selectedSeason,
  autoRun = true,
  onAnalysisComplete,
}: UseAutoAIAnalysisOptions) {
  // Always declare hooks first
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasRunRef = useRef(false);

  // Stable callback
  const runAnalysis = useCallback(async () => {
    if (!player) return; // guard early

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

      localStorage.setItem(
        `ai-analysis-${player.id}-${selectedSeason}`,
        JSON.stringify(result)
      );
    } catch (err) {
      console.error("AI analysis failed:", err);
      setError("AI analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [player, selectedSeason, onAnalysisComplete]);

  // Effect: run on mount or season change
  useEffect(() => {
    if (!player) return; // guard early

    hasRunRef.current = false;
    setAnalysis(null);
    setError(null);

    const cacheKey = `ai-analysis-${player.id}-${selectedSeason}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setAnalysis(parsed);
        onAnalysisComplete?.(parsed);
        return;
      } catch {
        console.error("Failed to parse cached analysis");
      }
    }

    if (autoRun && !hasRunRef.current && !isAnalyzing) {
      hasRunRef.current = true;
      runAnalysis();
    }
  }, [
    player,
    selectedSeason,
    autoRun,
    isAnalyzing,
    onAnalysisComplete,
    runAnalysis,
  ]);

  return {
    analysis,
    isAnalyzing,
    error,
    runAnalysis,
  };
}
