import { useParams, Link } from "react-router-dom";
import { SwapModal } from "@/components/SwapModal";
import { useState, useEffect } from "react";
import { AIAnalysisButton } from "@/components/AiAnalysisButton";
import { AIAnalysisPanel } from "@/components/AiAnalysisPanel";
import type { AIAnalysis } from "@/lib/openai";
import {
  ArrowLeft,
  Zap,
  TrendingUp,
  TrendingDown,
  Shield,
  Clock,
  Target,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import Chart from "@/components/Chart";
import BuySellWidget from "@/components/BuySellWidget";
import { getPlayerById } from "@/data/dummyData";
import { cn } from "@/lib/utils";

const PlayerDetailPage = () => {
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const player = getPlayerById(id || "");
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const displayAiScore = aiAnalysis?.performance_score ?? player.aiScore;
  const displayTrend =
    aiAnalysis?.trend ??
    (player.weeklyChange > 5
      ? "up"
      : player.weeklyChange < -5
      ? "down"
      : "stable");

  useEffect(() => {
    const cached = localStorage.getItem(`ai-analysis-${player.id}`);
    if (cached) {
      try {
        setAiAnalysis(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached analysis");
      }
    }
  }, [player.id]);

  const handleAnalysisComplete = (analysis: AIAnalysis) => {
    setAiAnalysis(analysis);
    localStorage.setItem(`ai-analysis-${player.id}`, JSON.stringify(analysis));
  };

  if (!player) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl   font-bold mb-4">Player Not Found</h1>
          <Link to="/players">
            <Button variant="outline">Back to Players</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isPositive = player.weeklyChange >= 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/players"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Players
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player Header */}
            <div className="glass-card overflow-hidden w-1/2">
              <div className="relative h-64 md:h-80   ">
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent z-10" />
                <img
                  src={player.imageUrl}
                  alt={player.name}
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                          {player.position}
                        </span>
                        <span className="text-muted-foreground">
                          {player.nationality}
                        </span>
                      </div>
                      <h1 className="text-3xl md:text-4xl   font-bold mb-1">
                        {player.name}
                      </h1>
                      <p className="text-lg text-muted-foreground">
                        {player.club}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/50">
                      <Zap className="w-4 h-4 text-warning" />
                      <span
                        className={cn(
                          "font-semibold",
                          aiAnalysis && "text-accent"
                        )}
                      >
                        AI Score: {displayAiScore}
                        {aiAnalysis && (
                          <span className="text-xs ml-1 opacity-80">
                            (AI Updated)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border/50">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Current Value
                    </p>
                    <p className="text-3xl   font-bold gradient-text">
                      ${player.currentValue.toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl",
                      isPositive
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    <span className="text-lg font-semibold">
                      {isPositive ? "+" : ""}
                      {player.weeklyChange.toFixed(1)}% this week
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Value Chart */}
            <div className="glass-card p-6">
              <h2 className="text-xl   font-bold mb-6">7-Day Value Trend</h2>
              <div className="pl-12">
                <Chart data={player.valueHistory} height={250} />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="glass-card p-6">
              <h2 className="text-xl   font-bold mb-6">Season Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Target className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl   font-bold">{player.stats.goals}</p>
                  <p className="text-sm text-muted-foreground">Goals</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Activity className="w-6 h-6 text-secondary mx-auto mb-2" />
                  <p className="text-2xl   font-bold">{player.stats.assists}</p>
                  <p className="text-sm text-muted-foreground">Assists</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
                  <p className="text-2xl   font-bold">
                    {player.stats.minutesPlayed}
                  </p>
                  <p className="text-sm text-muted-foreground">Minutes</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Shield className="w-6 h-6 text-warning mx-auto mb-2" />
                  <p className="text-2xl   font-bold">
                    {player.stats.matchesPlayed}
                  </p>
                  <p className="text-sm text-muted-foreground">Matches</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">AI-Powered Insights</h2>
                <AIAnalysisButton
                  player={player}
                  onAnalysisComplete={handleAnalysisComplete}
                />
              </div>
              {aiAnalysis ? (
                <AIAnalysisPanel
                  analysis={aiAnalysis}
                  playerName={player.name}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Click "AI Analysis" for GPT-4 powered insights
                </div>
              )}
            </div>

            {/* Walrus Verification */}
            <div className="glass-card p-6 border border-accent/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="  font-bold mb-1">Walrus Verified Data</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    All performance data for this player is cryptographically
                    verified and stored on Walrus decentralized storage.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted font-mono text-sm">
                    <span className="text-muted-foreground">Proof ID:</span>
                    <span className="text-accent">{player.walrusProofId}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Buy/Sell Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BuySellWidget
                playerName={player.name}
                currentPrice={player.currentValue}
                onBuy={(qty) =>
                  console.log(`Buy ${qty} shares of ${player.name}`)
                }
                onSell={(qty) =>
                  console.log(`Sell ${qty} shares of ${player.name}`)
                }
              />
              <div className="mt-4">
                <button
                  onClick={() => setIsSwapModalOpen(true)}
                  className="w-full text-sm text-muted-foreground hover:text-accent transition-colors flex items-center justify-center gap-2 py-2"
                >
                  Not enough SUI?{" "}
                  <span className="font-semibold text-accent underline">
                    Swap now
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SwapModal open={isSwapModalOpen} onOpenChange={setIsSwapModalOpen} />
    </Layout>
  );
};

export default PlayerDetailPage;
