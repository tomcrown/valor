import { useParams, Link, useLocation } from "react-router-dom";
import { SwapModal } from "@/components/SwapModal";
import { useState } from "react";
import { AIAnalysisButton } from "@/components/AiAnalysisButton";
import { AIAnalysisPanel } from "@/components/AiAnalysisPanel";
import { useAutoAIAnalysis } from "@/hooks/useAutoAIAnalysis";
import { useOnChainPlayer } from "@/hooks/useOnChainPlayers";
import {
  getSeasonBaseValue,
  getSeasonPerformanceScore,
  getSeasonWalrusBlobId,
} from "@/lib/suiDataFetcher";
import type { SeasonPeriod } from "@/data/dummyData";
import {
  ArrowLeft,
  Zap,
  TrendingUp,
  TrendingDown,
  Shield,
  Clock,
  Target,
  Activity,
  Calendar,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import Chart from "@/components/Chart";
import BuySellWidget from "@/components/BuySellWidget";
import { cn } from "@/lib/utils";

const SEASON_LABELS = {
  early: "Early Season",
  mid: "Mid Season",
  current: "Current Season",
};

const SEASON_DESCRIPTIONS = {
  early: "Initial Performance",
  mid: "Mid-Season Form",
  current: "Latest Performance",
};

const PlayerDetailPage = () => {
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [selectedSeason, setSelectedSeason] = useState<SeasonPeriod>(
    (location.state?.selectedSeason as SeasonPeriod) || "current"
  );

  // Fetch merged player data (football stats + contract data)
  const {
    player: mergedPlayer,
    isLoading: isLoadingContract,
    error: contractError,
    refetch: refetchPlayer,
  } = useOnChainPlayer({
    playerId: id || "",
    autoFetch: true,
  });

  const safePlayer = mergedPlayer ?? null;

  const {
    analysis: aiAnalysis,
    isAnalyzing,
    runAnalysis,
  } = useAutoAIAnalysis({
    player: safePlayer,
    selectedSeason,
    autoRun: !!safePlayer,
  });

  if (!mergedPlayer) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          {isLoadingContract ? (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">
                Loading Player Data...
              </h1>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-4">Player Not Found</h1>
              <Link to="/players">
                <Button variant="outline">Back to Players</Button>
              </Link>
            </>
          )}
        </div>
      </Layout>
    );
  }

  const seasonStats = mergedPlayer.seasonalStats[selectedSeason];

  let baseValueSui = getSeasonBaseValue(mergedPlayer as any, selectedSeason);

  if (!baseValueSui || baseValueSui <= 0) {
    baseValueSui = mergedPlayer.currentValue ?? 0;
  }

  const seasonPerformanceScore = getSeasonPerformanceScore(
    mergedPlayer as any,
    selectedSeason
  );

  const seasonWalrusBlobId = getSeasonWalrusBlobId(
    mergedPlayer as any,
    selectedSeason
  );

  const displayAiScore =
    seasonPerformanceScore ||
    aiAnalysis?.performance_score ||
    mergedPlayer.aiScore ||
    0;

  const isPositive = mergedPlayer.weeklyChange >= 0;

  // Handler for when transaction completes - refresh player data
  const handleTransactionComplete = () => {
    refetchPlayer();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/players"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Players
          </Link>

          {/* Refresh Button */}
          <Button
            onClick={refetchPlayer}
            variant="outline"
            size="sm"
            disabled={isLoadingContract}
            className="flex items-center gap-2"
          >
            {isLoadingContract ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isLoadingContract ? "Updating..." : "Refresh"}
          </Button>
        </div>

        {/* Contract Error Warning */}
        {mergedPlayer.onChainError && (
          <div className="mb-6 p-4 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm">
            ⚠️ Contract data unavailable: {mergedPlayer.onChainError}
            <br />
            Showing football stats with default prices.
          </div>
        )}

        {/* Season Selector */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Select Season Period</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["early", "mid", "current"] as SeasonPeriod[]).map((season) => {
              const seasonValue = getSeasonBaseValue(
                mergedPlayer as any,
                season
              );
              const seasonScore = getSeasonPerformanceScore(
                mergedPlayer as any,
                season
              );

              return (
                <button
                  key={season}
                  onClick={() => setSelectedSeason(season)}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all text-left",
                    selectedSeason === season
                      ? "border-accent bg-accent/10 shadow-lg shadow-accent/20"
                      : "border-border/50 hover:border-border bg-card/50"
                  )}
                >
                  <div className="font-semibold mb-1">
                    {SEASON_LABELS[season]}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {SEASON_DESCRIPTIONS[season]}
                  </div>
                  <div className="text-xs text-accent font-mono">
                    {seasonValue.toFixed(3)} SUI
                  </div>
                  {seasonScore > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Score: {seasonScore}/100
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player Header */}
            <div className="glass-card overflow-hidden">
              <div className="relative h-64 md:h-80">
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent z-10" />
                <img
                  src={mergedPlayer.imageUrl}
                  alt={mergedPlayer.name}
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                          {mergedPlayer.position}
                        </span>
                        <span className="text-muted-foreground">
                          {mergedPlayer.nationality}
                        </span>
                      </div>
                      <h1 className="text-3xl md:text-4xl font-bold mb-1">
                        {mergedPlayer.name}
                      </h1>
                      <p className="text-lg text-muted-foreground">
                        {mergedPlayer.club}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/50">
                      {isAnalyzing || isLoadingContract ? (
                        <Loader2 className="w-4 h-4 text-accent animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 text-warning" />
                      )}
                      <span
                        className={cn(
                          "font-semibold",
                          seasonPerformanceScore && "text-accent"
                        )}
                      >
                        {displayAiScore}/100
                      </span>
                      {seasonPerformanceScore > 0 && (
                        <span className="text-xs ml-1 opacity-80">⛓️</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border/50">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Base Value ({SEASON_LABELS[selectedSeason]})
                    </p>
                    <p className="text-3xl font-bold gradient-text">
                      {baseValueSui.toFixed(3)} SUI
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Season: {selectedSeason}
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
                      {mergedPlayer.weeklyChange.toFixed(1)}% this week
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Value Chart */}
            {mergedPlayer.valueHistory &&
              mergedPlayer.valueHistory.length > 0 && (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-bold mb-6">7-Day Value Trend</h2>
                  <div className="pl-12">
                    <Chart data={mergedPlayer.valueHistory} height={250} />
                  </div>
                </div>
              )}

            {/* Stats Grid - Seasonal */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {SEASON_LABELS[selectedSeason]} Statistics
                </h2>
                <span className="text-sm text-muted-foreground">
                  {SEASON_DESCRIPTIONS[selectedSeason]}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Target className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{seasonStats.goals}</p>
                  <p className="text-sm text-muted-foreground">Goals</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Activity className="w-6 h-6 text-secondary mx-auto mb-2" />
                  <p className="text-2xl font-bold">{seasonStats.assists}</p>
                  <p className="text-sm text-muted-foreground">Assists</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {seasonStats.minutesPlayed}
                  </p>
                  <p className="text-sm text-muted-foreground">Minutes</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Shield className="w-6 h-6 text-warning mx-auto mb-2" />
                  <p className="text-2xl font-bold">
                    {seasonStats.matchesPlayed}
                  </p>
                  <p className="text-sm text-muted-foreground">Matches</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground mb-1">
                      Goals per Match
                    </p>
                    <p className="text-xl font-bold">
                      {(
                        seasonStats.goals /
                        Math.max(1, seasonStats.matchesPlayed)
                      ).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground mb-1">
                      Minutes per Goal
                    </p>
                    <p className="text-xl font-bold">
                      {seasonStats.goals > 0
                        ? Math.round(
                            seasonStats.minutesPlayed / seasonStats.goals
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">AI-Powered Insights</h2>
                <AIAnalysisButton
                  player={mergedPlayer}
                  selectedSeason={selectedSeason}
                  onAnalysisComplete={runAnalysis}
                />
              </div>

              {isAnalyzing && !aiAnalysis ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-accent" />
                  <p className="text-sm text-muted-foreground">
                    Analyzing {mergedPlayer.name}'s performance with GPT-4...
                  </p>
                </div>
              ) : aiAnalysis ? (
                <AIAnalysisPanel
                  analysis={aiAnalysis}
                  playerName={mergedPlayer.name}
                />
              ) : isLoadingContract ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading contract data...
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Click "Run Analysis" to get AI insights for{" "}
                  {SEASON_LABELS[selectedSeason]}
                </div>
              )}
            </div>

            {/* Walrus Verification */}
            <div className="glass-card p-6 border border-accent/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold mb-1">Walrus Verified Data</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {SEASON_LABELS[selectedSeason]} performance data is
                    cryptographically verified and stored on Walrus
                    decentralized storage.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted font-mono text-xs break-all">
                    <span className="text-muted-foreground">Blob ID:</span>
                    <span className="text-accent">
                      {seasonWalrusBlobId ||
                        mergedPlayer.walrusProofId ||
                        "Not available"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Buy/Sell Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BuySellWidget
                playerId={mergedPlayer.id}
                onChainPlayerId={mergedPlayer.onChainPlayerId}
                playerName={mergedPlayer.name}
                currentPrice={baseValueSui}
                onTransactionComplete={handleTransactionComplete}
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
