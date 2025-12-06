// ============================================================================
// FILE 3: src/components/AIAnalysisPanel.tsx
// Panel that displays the AI analysis results
// ============================================================================

import {
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AIAnalysis } from "@/lib/openai";

interface AIAnalysisPanelProps {
  analysis: AIAnalysis;
  playerName: string;
}

export function AIAnalysisPanel({
  analysis,
  playerName,
}: AIAnalysisPanelProps) {
  const getTrendIcon = () => {
    switch (analysis.trend) {
      case "up":
        return <TrendingUp className="w-5 h-5 text-success" />;
      case "down":
        return <TrendingDown className="w-5 h-5 text-destructive" />;
      default:
        return <Minus className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (analysis.trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="glass-card p-6 border-2 border-accent/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">AI Performance Analysis</h3>
          <p className="text-sm text-muted-foreground">
            GPT-4 powered insights for {playerName}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
          <CheckCircle2 className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-accent">
            {analysis.confidence}% confidence
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Performance Score
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold gradient-text">
                {analysis.performance_score}
              </span>
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={cn("font-semibold text-lg", getTrendColor())}>
              {analysis.trend.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Score Bar */}
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent via-primary to-secondary transition-all duration-1000"
            style={{ width: `${analysis.performance_score}%` }}
          />
        </div>
      </div>

      {/* Reasoning */}
      <div className="mb-6 p-4 bg-muted/50 rounded-xl border border-border/50">
        <p className="text-sm font-medium mb-2 text-primary">
          Expert Analysis:
        </p>
        <p className="text-sm leading-relaxed">{analysis.reasoning}</p>
      </div>

      {/* Key Factors */}
      <div className="mb-6">
        <p className="text-sm font-semibold mb-3">Key Factors:</p>
        <div className="flex flex-wrap gap-2">
          {analysis.key_factors.map((factor, index) => (
            <div
              key={index}
              className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium border border-primary/20"
            >
              {factor}
            </div>
          ))}
        </div>
      </div>

      {/* Prediction */}
      <div className="p-4 bg-gradient-to-br from-accent/5 to-secondary/5 rounded-xl border border-accent/20">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold mb-1 text-accent">
              Market Prediction:
            </p>
            <p className="text-sm text-muted-foreground">
              {analysis.prediction}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-l-4 border-primary">
        <p className="text-sm font-semibold text-primary">
          {analysis.short_summary}
        </p>
      </div>
    </div>
  );
}
