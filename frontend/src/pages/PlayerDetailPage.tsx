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
  getCurrentSeasonBaseValue,
} from "@/lib/suiDataFetcher";
import type { SeasonPeriod } from "@/data/apiData";
import {
  ArrowLeft,
  Zap,
  Shield,
  Clock,
  Target,
  Activity,
  Calendar,
  Loader2,
  RefreshCw,
  AlertCircle,
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

  let displayBaseValueSui = getSeasonBaseValue(
    mergedPlayer as any,
    selectedSeason
  );

  if (!displayBaseValueSui || displayBaseValueSui <= 0) {
    displayBaseValueSui = mergedPlayer.currentValue ?? 0.001;
  }

  const currentSeasonPrice = getCurrentSeasonBaseValue(mergedPlayer as any);

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
          <div className="mb-6 p-4 rounded-2xl bg-warning/10 border border-warning/20 text-warning text-sm">
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

          {/* Responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
                    {seasonValue.toFixed(4)} SUI
                  </div>
                  {seasonScore > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Score: {seasonScore}/100
                    </div>
                  )}
                  {season === "current" && (
                    <div className="mt-2 text-[10px] font-semibold text-success">
                      ⚡ ACTIVE TRADING PRICE
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Important Notice */}
          {selectedSeason !== "current" && (
            <div className="mt-4 p-3 rounded-2xl bg-info/10 border border-info/20 flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-info font-semibold mb-1">
                  Historical Data View
                </p>
                <p className="text-muted-foreground">
                  You are viewing {SEASON_LABELS[selectedSeason].toLowerCase()}{" "}
                  data. All buy/sell transactions use the{" "}
                  <span className="text-success font-semibold">
                    Current Season
                  </span>{" "}
                  price:
                  <span className="font-mono ml-1">
                    {currentSeasonPrice.toFixed(4)} SUI
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player Header */}
            <div className="glass-card overflow-hidden">
              {/* Player Image */}
              <div className="relative h-56 sm:h-64 md:h-80">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent z-10" />

                <img
                  src={mergedPlayer.imageUrl}
                  alt={mergedPlayer.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Player Info */}
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                {/* Player Details */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="flex flex-wrap items-center gap-2 mb-2 justify-center sm:justify-start">
                    <span className="px-2 py-1 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-semibold">
                      {mergedPlayer.position}
                    </span>
                    <span className="text-muted-foreground text-xs sm:text-sm">
                      {mergedPlayer.nationality}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">
                    {mergedPlayer.name}
                  </h1>
                  <p className="text-sm sm:text-lg text-muted-foreground">
                    {mergedPlayer.club}
                  </p>
                </div>

                {/* AI Score */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 text-sm sm:text-base">
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

              {/* Bottom Stats */}
              <div className="p-4 sm:p-6 border-t border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Price Info */}
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                    {selectedSeason === "current"
                      ? "Current Trading Price"
                      : `${SEASON_LABELS[selectedSeason]} Price`}
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold gradient-text">
                    {displayBaseValueSui.toFixed(4)} SUI
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedSeason === "current"
                      ? "⚡ Active"
                      : `📊 ${selectedSeason}`}
                  </p>
                </div>

                {/* Positive/Negative Indicator */}
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm",
                    isPositive
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  )}
                ></div>
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
                  <div className="bg-muted/30 rounded-2xl p-3">
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
                  <div className="bg-muted/30 rounded-2xl p-3">
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
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-muted font-mono text-xs break-all">
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
                currentPrice={currentSeasonPrice}
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
