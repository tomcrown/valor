import { useState, useEffect, useRef, useCallback } from "react";
import { analyzePlayer } from "@/lib/openai";
import type { Player, SeasonPeriod } from "@/data/apiData";
import type { AIAnalysis } from "@/lib/openai";

interface UseAutoAIAnalysisOptions {
  player: Player | null;
  selectedSeason: SeasonPeriod;
  autoRun?: boolean;
  onAnalysisComplete?: () => void;
}

export function useAutoAIAnalysis({
  player,
  selectedSeason,
  autoRun = false,
  onAnalysisComplete,
}: UseAutoAIAnalysisOptions) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasRunRef = useRef(false);

  const runAnalysis = useCallback(async () => {
    if (!player) return;

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
      onAnalysisComplete();

      localStorage.setItem(
        `ai-analysis-${player.id}-${player.club}-${selectedSeason}`,
        JSON.stringify(result)
      );
    } catch (err) {
      setError("AI analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [player, selectedSeason, onAnalysisComplete]);

  useEffect(() => {
    if (!player) return;

    hasRunRef.current = false;
    setAnalysis(null);
    setError(null);

    const cacheKey = `ai-analysis-${player.id}-${player.club}-${selectedSeason}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setAnalysis(parsed);
        return;
      } catch {}
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
