import { useParams, Link, useLocation } from "react-router-dom";
import { SwapModal } from "@/components/SwapModal";
import { useState, useEffect } from "react";
import { PremiumAIPanelEnhanced } from "@/components/PremiumAIPanel";
import { useUserPoints } from "@/hooks/useUserPoints";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useOnChainPlayer } from "@/hooks/useOnChainPlayers";
import {
  downloadEncryptedAI,
  validateEncryptedBlob,
} from "@/lib/encryptAIAnalysis";
import { checkPlayerNFTOwnership } from "@/lib/checkNFTOwnership";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import {
  getSeasonBaseValue,
  getSeasonPerformanceScore,
  getSeasonWalrusBlobId,
  getCurrentSeasonBaseValue,
} from "@/lib/suiDataFetcher";
import type { SeasonPeriod } from "@/data/apiData";
import type { EncryptedAIBlob } from "@/lib/sealClient";
import {
  ArrowLeft,
  Shield,
  Clock,
  Target,
  Activity,
  Calendar,
  Loader2,
  RefreshCw,
  AlertCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import Chart from "@/components/Chart";
import BuySellWidget from "@/components/BuySellWidget";
import { cn } from "@/lib/utils";
import { usePoints } from "@/context/PointsContext";

const SEASON_LABELS = {
  early: "Early Season",
  mid: "Mid Season",
  current: "Current Season",
};

const SEASON_DESCRIPTIONS = {
  early: "Initial Performance (Matches 1-3)",
  mid: "Mid-Season Form (Matches 4-9)",
  current: "Latest Performance (All Matches)",
};

const PlayerDetailPage = () => {
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const account = useCurrentAccount();
  const { pointsData, optimisticAddPoints, refetch } = usePoints();


  const [selectedSeason, setSelectedSeason] = useState<SeasonPeriod>(
    (location.state?.selectedSeason as SeasonPeriod) || "current",
  );

  const [encryptedAIBlobs, setEncryptedAIBlobs] = useState<{
    early: EncryptedAIBlob | null;
    mid: EncryptedAIBlob | null;
    current: EncryptedAIBlob | null;
  }>({
    early: null,
    mid: null,
    current: null,
  });

  const [isLoadingAI, setIsLoadingAI] = useState<{
    early: boolean;
    mid: boolean;
    current: boolean;
  }>({
    early: false,
    mid: false,
    current: false,
  });

  const [aiLoadError, setAiLoadError] = useState<{
    early: string | null;
    mid: string | null;
    current: string | null;
  }>({
    early: null,
    mid: null,
    current: null,
  });

  const [retryCount, setRetryCount] = useState(0);
  const [userOwnsNFT, setUserOwnsNFT] = useState(false);
  const [userShares, setUserShares] = useState(0);
  const [isCheckingOwnership, setIsCheckingOwnership] = useState(false);

  const {
    player: mergedPlayer,
    isLoading: isLoadingContract,
    error: contractError,
    refetch: refetchPlayer,
  } = useOnChainPlayer({
    playerId: id || "",
    autoFetch: true,
  });

  // Load encrypted AI from Walrus for a specific season
  const loadEncryptedAIForSeason = async (season: SeasonPeriod) => {
    if (!mergedPlayer) {
      return;
    }

    // Get the season-specific Walrus blob ID
    const seasonBlobId = getSeasonWalrusBlobId(mergedPlayer as any, season);

    if (!seasonBlobId) {
      setEncryptedAIBlobs((prev) => ({ ...prev, [season]: null }));
      setIsLoadingAI((prev) => ({ ...prev, [season]: false }));
      setAiLoadError((prev) => ({
        ...prev,
        [season]: `No AI data available for ${SEASON_LABELS[season]}`,
      }));
      return;
    }

    setIsLoadingAI((prev) => ({ ...prev, [season]: true }));
    setAiLoadError((prev) => ({ ...prev, [season]: null }));

    try {

      const blob = await downloadEncryptedAI(seasonBlobId, {
        maxRetries: 5,
        silent: false,
      });

      if (blob && validateEncryptedBlob(blob)) {
        setEncryptedAIBlobs((prev) => ({ ...prev, [season]: blob }));
        setAiLoadError((prev) => ({ ...prev, [season]: null }));
      } else {
        setEncryptedAIBlobs((prev) => ({ ...prev, [season]: null }));
        setAiLoadError((prev) => ({
          ...prev,
          [season]: "Invalid blob format",
        }));
      }
    } catch (error: any) {
      setEncryptedAIBlobs((prev) => ({ ...prev, [season]: null }));

      // Provide user-friendly error messages
      if (error.message.includes("404")) {
        setAiLoadError((prev) => ({
          ...prev,
          [season]:
            "AI data not found. The blob may not have been uploaded yet.",
        }));
      } else if (error.message.includes("timeout")) {
        setAiLoadError((prev) => ({
          ...prev,
          [season]:
            "Connection timeout. Please check your network and try again.",
        }));
      } else {
        setAiLoadError((prev) => ({
          ...prev,
          [season]: "Failed to load AI insights. Please try again later.",
        }));
      }
    } finally {
      setIsLoadingAI((prev) => ({ ...prev, [season]: false }));
    }
  };

  // Load AI data for all seasons when player data is available
  useEffect(() => {
    if (!mergedPlayer) return;

    // Load AI data for all three seasons
    (async () => {
      await Promise.all([
        loadEncryptedAIForSeason("early"),
        loadEncryptedAIForSeason("mid"),
        loadEncryptedAIForSeason("current"),
      ]);
    })();
  }, [mergedPlayer, retryCount]);

  // Check NFT ownership
  useEffect(() => {
    async function checkOwnership() {
      if (!account?.address || !mergedPlayer?.onChainPlayerId) {
        setUserOwnsNFT(false);
        setUserShares(0);
        return;
      }

      setIsCheckingOwnership(true);

      try {
        const suiClient = new SuiClient({
          url: getFullnodeUrl(import.meta.env.VITE_SUI_NETWORK || "testnet"),
        });

        const packageId = import.meta.env.VITE_PACKAGE_ID;

        if (!packageId) {
          throw new Error("Missing VITE_PACKAGE_ID");
        }

        const result = await checkPlayerNFTOwnership(
          suiClient,
          account.address,
          mergedPlayer.onChainPlayerId,
          packageId,
        );

        setUserOwnsNFT(result.ownsNFT);
        setUserShares(result.shareCount);
      } catch (error) {
        setUserOwnsNFT(false);
        setUserShares(0);
      } finally {
        setIsCheckingOwnership(false);
      }
    }

    checkOwnership();
  }, [account?.address, mergedPlayer?.onChainPlayerId]);

  const handleTransactionComplete = (earnedPoints: number = 0) => {
    if (earnedPoints > 0) {
      optimisticAddPoints(earnedPoints);
    }

    refetchPlayer();
    // Re-check ownership after transaction
    if (account?.address && mergedPlayer?.id) {
      setTimeout(() => {
        if (!mergedPlayer.onChainPlayerId) return;

        checkPlayerNFTOwnership(
          new SuiClient({ url: getFullnodeUrl("testnet") }),
          account.address,
          mergedPlayer.onChainPlayerId,
          import.meta.env.VITE_PACKAGE_ID,
        ).then((result) => {
          setUserOwnsNFT(result.ownsNFT);
          setUserShares(result.shareCount);
        });
      }, 2000);
    }
  };

  const handleRetryAILoad = () => {
    setRetryCount((prev) => prev + 1);
  };

  const handleSeasonChange = (season: SeasonPeriod) => {
    setSelectedSeason(season);
  };

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
    selectedSeason,
  );
  if (!displayBaseValueSui || displayBaseValueSui <= 0) {
    displayBaseValueSui = mergedPlayer.currentValue ?? 0.001;
  }

  const currentSeasonPrice = getCurrentSeasonBaseValue(mergedPlayer as any);
  const seasonPerformanceScore = getSeasonPerformanceScore(
    mergedPlayer as any,
    selectedSeason,
  );
  const seasonWalrusBlobId = getSeasonWalrusBlobId(
    mergedPlayer as any,
    selectedSeason,
  );

  // Get current season's encrypted AI blob for display
  const currentEncryptedAIBlob = encryptedAIBlobs[selectedSeason];
  const currentIsLoadingAI = isLoadingAI[selectedSeason];
  const currentAiLoadError = aiLoadError[selectedSeason];

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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player Header */}
            <div className="glass-card overflow-hidden">
              <div className="relative h-56 sm:h-64 md:h-80">
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent z-10" />
                <img
                  src={mergedPlayer.imageUrl}
                  alt={mergedPlayer.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-4 sm:p-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">
                  {mergedPlayer.name}
                </h1>
                <p className="text-sm sm:text-lg text-muted-foreground">
                  {mergedPlayer.club}
                </p>
              </div>
            </div>

            {/* SEASON TOGGLE TABS */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-accent" />
                <h3 className="font-semibold">Select Season Period</h3>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(["early", "mid", "current"] as SeasonPeriod[]).map(
                  (season) => {
                    const hasData = !!encryptedAIBlobs[season];
                    const isLoading = isLoadingAI[season];

                    return (
                      <button
                        key={season}
                        onClick={() => handleSeasonChange(season)}
                        disabled={isLoading}
                        className={cn(
                          "px-4 py-3 rounded-xl font-medium transition-all relative",
                          "flex flex-col items-center gap-1",
                          selectedSeason === season
                            ? "bg-accent text-accent-foreground shadow-lg scale-105"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:scale-102",
                          isLoading && "opacity-50 cursor-wait",
                        )}
                      >
                        <span className="text-sm font-bold">
                          {SEASON_LABELS[season]}
                        </span>
                        <span className="text-xs opacity-80">
                          {SEASON_DESCRIPTIONS[season]
                            .split("(")[1]
                            ?.replace(")", "")}
                        </span>
                        {hasData && !isLoading && (
                          <span className="absolute top-2 right-2 w-2 h-2 bg-success rounded-full" />
                        )}
                      </button>
                    );
                  },
                )}
              </div>

              {/* Season info banner */}
              <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-accent">
                    {SEASON_LABELS[selectedSeason]}:
                  </span>{" "}
                  {SEASON_DESCRIPTIONS[selectedSeason]}
                  {selectedSeason !== "current" && (
                    <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">
                      Historic View
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Stats Grid - now shows selected season */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-bold mb-6">
                {SEASON_LABELS[selectedSeason]} Statistics
              </h2>
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

              {/* Season-specific base value display */}
              <div className="mt-6 p-4 rounded-xl bg-accent/10 border border-accent/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {SEASON_LABELS[selectedSeason]} Base Value
                    </p>
                    <p className="text-2xl font-bold text-accent">
                      {displayBaseValueSui.toFixed(4)} SUI
                    </p>
                  </div>
                  {seasonPerformanceScore && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">AI Score</p>
                      <p className="text-xl font-bold">
                        {seasonPerformanceScore}/100
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* PREMIUM AI SECTION - Now season-aware */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  AI-Powered Insights - {SEASON_LABELS[selectedSeason]}
                </h2>
                {isCheckingOwnership && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {currentIsLoadingAI ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-accent" />
                  <p className="text-sm text-muted-foreground">
                    Loading encrypted AI analysis for{" "}
                    {SEASON_LABELS[selectedSeason].toLowerCase()}...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This may take a few moments if the data is still propagating
                  </p>
                </div>
              ) : currentAiLoadError ? (
                <div className="text-center py-8 space-y-4">
                  <AlertCircle className="w-12 h-12 mx-auto text-warning" />
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-warning">
                      {currentAiLoadError}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      The AI analysis blob may still be propagating on Walrus,
                      or may not have been generated yet for{" "}
                      {SEASON_LABELS[selectedSeason].toLowerCase()}.
                    </p>
                  </div>
                  <Button
                    onClick={handleRetryAILoad}
                    variant="outline"
                    size="sm"
                    className="mt-4"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry Loading
                  </Button>
                </div>
              ) : currentEncryptedAIBlob ? (
                <PremiumAIPanelEnhanced
                  publicData={currentEncryptedAIBlob.public_data}
                  encryptedPremium={currentEncryptedAIBlob.encrypted_premium}
                  playerId={mergedPlayer.onChainPlayerId || mergedPlayer.id}
                  playerName={mergedPlayer.name}
                  season={selectedSeason}
                  userOwnsNFT={userOwnsNFT}
                  userShares={userShares}
                  userPoints={pointsData.currentPoints}
                  userPointsBalanceId={pointsData.balanceObjectId}
                />
              ) : (
                <div className="text-center py-8 space-y-4">
                  <Info className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    AI analysis not available for{" "}
                    {SEASON_LABELS[selectedSeason].toLowerCase()} yet.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Premium insights will be encrypted and stored on Walrus once
                    generated.
                  </p>
                </div>
              )}
            </div>

            {/* Walrus Verification - now season-aware */}
            <div className="glass-card p-6 border border-accent/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">
                    {currentEncryptedAIBlob
                      ? "🔐 Seal Encrypted"
                      : "Walrus Verified"}{" "}
                    Data
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {currentEncryptedAIBlob
                      ? "Premium AI insights are encrypted with Seal. Only NFT holders can decrypt."
                      : `${SEASON_LABELS[selectedSeason]} performance data stored on Walrus.`}
                  </p>
                  {seasonWalrusBlobId ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-muted font-mono text-xs break-all">
                      <span className="text-muted-foreground">Blob ID:</span>
                      <span className="text-accent">{seasonWalrusBlobId}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No Walrus blob ID available for{" "}
                      {SEASON_LABELS[selectedSeason].toLowerCase()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BuySellWidget
                playerId={mergedPlayer.id}
                onChainPlayerId={mergedPlayer.onChainPlayerId}
                playerName={mergedPlayer.name}
                currentPrice={currentSeasonPrice}
                onTransactionComplete={(pointsEarned: number) =>
                  handleTransactionComplete(pointsEarned)
                }
              />
              <div className="mt-4">
                <button
                  onClick={() => setIsSwapModalOpen(true)}
                  className="w-full text-sm text-muted-foreground  transition-colors flex items-center justify-center gap-2 py-2"
                >
                  Not enough SUI?{" "}
                  <span className="font-semibold text-accent underline">
                    Swap now
                  </span>
                </button>
              </div>

              {/* Season comparison card */}
              {selectedSeason !== "current" && (
                <div className="mt-4 glass-card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-accent" />
                    <p className="text-sm font-semibold">Historic View</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You're viewing {SEASON_LABELS[selectedSeason].toLowerCase()}{" "}
                    data. Switch to "Current Season" to see the latest
                    performance and trade at current prices.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <SwapModal open={isSwapModalOpen} onOpenChange={setIsSwapModalOpen} />
    </Layout>
  );
};

export default PlayerDetailPage;
