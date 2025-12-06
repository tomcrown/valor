import { useState, useEffect } from "react";
import { Sparkles, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AIAnalysisPanel } from "@/components/AiAnalysisPanel";
import type { Player } from "@/data/dummyData";
import type { AIAnalysis } from "@/lib/openai";
import { analyzePlayer } from "@/lib/openai";
import { cn } from "@/lib/utils";

interface AIAnalysisDialogProps {
  player: Player;
  trigger?: React.ReactNode;
  onAnalysisComplete?: (analysis: AIAnalysis) => void;
}

export function AIAnalysisDialog({
  player,
  trigger,
  onAnalysisComplete,
}: AIAnalysisDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzePlayer({
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

      setAnalysis(result);
      onAnalysisComplete?.(result);

      // Save to localStorage
      localStorage.setItem(`ai-analysis-${player.id}`, JSON.stringify(result));
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("AI analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-analyze when dialog opens
  useEffect(() => {
    if (isOpen && !analysis && !isAnalyzing) {
      // Check for cached analysis first
      const cached = localStorage.getItem(`ai-analysis-${player.id}`);
      if (cached) {
        try {
          const parsedAnalysis = JSON.parse(cached);
          setAnalysis(parsedAnalysis);
          onAnalysisComplete?.(parsedAnalysis);
        } catch {
          // If cache is corrupted, analyze fresh
          handleAnalyze();
        }
      } else {
        // No cache, analyze
        handleAnalyze();
      }
    }
  }, [isOpen]);

  // Reset state when dialog closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Optional: clear state on close
      // setAnalysis(null);
      // setError(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            className="w-full border-accent/30 hover:bg-accent/10 hover:border-accent transition-all"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Analysis
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <DialogHeader className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">
                AI Performance Analysis
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {player.name} • {player.club}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          <div className="space-y-6">
            {/* Player Quick Stats */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                Season Performance
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text">
                    {player.stats.goals}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Goals</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text">
                    {player.stats.assists}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Assists</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text">
                    {player.stats.matchesPlayed}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Matches</p>
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      "text-3xl font-bold",
                      player.weeklyChange >= 0
                        ? "text-success"
                        : "text-destructive"
                    )}
                  >
                    {player.weeklyChange >= 0 ? "+" : ""}
                    {player.weeklyChange.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Weekly Change
                  </p>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="relative">
                  <Loader2 className="w-16 h-16 animate-spin text-accent" />
                  <Sparkles className="w-6 h-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold mb-2">
                    Analyzing {player.name}...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    GPT-4 is evaluating performance metrics and market trends
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !isAnalyzing && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                <p className="text-destructive font-semibold mb-3">{error}</p>
                <Button
                  onClick={handleAnalyze}
                  variant="outline"
                  className="border-destructive/30 hover:bg-destructive/10"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}

            {/* Analysis Result */}
            {analysis && !isAnalyzing && (
              <div className="space-y-6">
                <AIAnalysisPanel analysis={analysis} playerName={player.name} />

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center pt-4">
                  <Button
                    onClick={handleAnalyze}
                    variant="outline"
                    disabled={isAnalyzing}
                    className="border-accent/30 hover:bg-accent/10"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Refresh Analysis
                  </Button>
                  <Button
                    onClick={() => setIsOpen(false)}
                    className="btn-gradient"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
