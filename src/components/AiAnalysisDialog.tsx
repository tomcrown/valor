import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AIAnalysisPanel } from "@/components/AiAnalysisPanel";
import { useAutoAIAnalysis } from "@/hooks/useAutoAIAnalysis";
import type { Player, SeasonPeriod } from "@/data/dummyData";

interface AIAnalysisDialogProps {
  player: Player;
  selectedSeason: SeasonPeriod;
  trigger?: React.ReactNode;
}

const SEASON_LABELS = {
  early: "Early Season (Matches 1-3)",
  mid: "Mid Season (Matches 4-9)",
  current: "Current Season (All Matches)",
};

export function AIAnalysisDialog({
  player,
  selectedSeason,
  trigger,
}: AIAnalysisDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Use the hook to get/run analysis
  const { analysis, isAnalyzing, runAnalysis } = useAutoAIAnalysis({
    player,
    selectedSeason,
    autoRun: false, // Don't auto-run in dialog, we'll trigger manually
  });

  // Get stats for selected season
  const seasonStats = player.seasonalStats[selectedSeason];

  // Run analysis when dialog opens if no cached data
  useEffect(() => {
    if (isOpen && !analysis && !isAnalyzing) {
      runAnalysis();
    }
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
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
                {player.name} • {player.club} • {SEASON_LABELS[selectedSeason]}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          <div className="space-y-6">
            {/* Season Stats */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">
                {SEASON_LABELS[selectedSeason]} Performance
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text">
                    {seasonStats.goals}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Goals</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text">
                    {seasonStats.assists}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Assists</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text">
                    {seasonStats.matchesPlayed}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Matches</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold gradient-text">
                    {seasonStats.minutesPlayed}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Minutes</p>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isAnalyzing && !analysis && (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="relative">
                  <Loader2 className="w-16 h-16 animate-spin text-accent" />
                  <Sparkles className="w-6 h-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold mb-2">
                    Analyzing {SEASON_LABELS[selectedSeason]}...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    GPT-4 is evaluating {player.name}'s performance for this
                    period
                  </p>
                </div>
              </div>
            )}

            {/* Analysis Result */}
            {analysis && (
              <div className="space-y-6">
                <AIAnalysisPanel analysis={analysis} playerName={player.name} />

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center pt-4">
                  <Button
                    onClick={runAnalysis}
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

            {/* No Analysis Yet */}
            {!analysis && !isAnalyzing && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Click below to start AI analysis
                </p>
                <Button onClick={runAnalysis} className="btn-gradient">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Now
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
