import { useParams, Link, useLocation } from "react-router-dom";
import { SwapModal } from "@/components/SwapModal";
import { useState, useEffect } from "react";
import { PremiumAIPanel } from "@/components/PremiumAIPanel";
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
  const account = useCurrentAccount();

  const [selectedSeason, setSelectedSeason] = useState<SeasonPeriod>(
    (location.state?.selectedSeason as SeasonPeriod) || "current",
  );

  // Seal integration state
  const [encryptedAIBlob, setEncryptedAIBlob] =
    useState<EncryptedAIBlob | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiLoadError, setAiLoadError] = useState<string | null>(null);
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

  // Load encrypted AI from Walrus with improved error handling
  // Load encrypted AI from Walrus with improved error handling
  useEffect(() => {
    async function loadEncryptedAI() {
      if (!mergedPlayer) {
        setEncryptedAIBlob(null);
        setIsLoadingAI(false);
        setAiLoadError(null);
        return;
      }

      // Get the season-specific Walrus blob ID
      const seasonBlobId = getSeasonWalrusBlobId(
        mergedPlayer as any,
        selectedSeason,
      );

      if (!seasonBlobId) {
        console.log(`ℹ️ No Walrus blob ID for ${selectedSeason} season`);
        setEncryptedAIBlob(null);
        setIsLoadingAI(false);
        setAiLoadError(null);
        return;
      }

      setIsLoadingAI(true);
      setAiLoadError(null);

      try {
        console.log(`📥 Loading encrypted AI from Walrus`);
        console.log(`   Season: ${selectedSeason}`);
        console.log(`   Blob ID: ${seasonBlobId}`);

        // 🔍 ADD DEBUG CODE HERE (after seasonBlobId is defined):
        console.log("🔍 Debug Info:");
        console.log("   Player ID:", mergedPlayer.id);
        console.log("   Season:", selectedSeason);
        console.log("   Blob ID:", seasonBlobId); // ✅ Use seasonBlobId, not seasonWalrusBlobId
        console.log(
          "   Aggregator URL:",
          `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${seasonBlobId}`,
        );

        // Test the blob directly
        fetch(
          `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${seasonBlobId}`,
        )
          .then((r) => {
            console.log("   HTTP Status:", r.status);
            return r.text();
          })
          .then((text) =>
            console.log("   Response preview:", text.substring(0, 200)),
          )
          .catch((e) => console.log("   Fetch Error:", e));

        // Download with retry logic (up to 5 attempts with exponential backoff)
        const blob = await downloadEncryptedAI(seasonBlobId, {
          maxRetries: 5,
          silent: false,
        });

        if (blob && validateEncryptedBlob(blob)) {
          setEncryptedAIBlob(blob);
          setAiLoadError(null);
          console.log("✅ Encrypted AI loaded from Walrus");
          console.log(`   Public score: ${blob.public_data.performance_score}`);
          console.log(`   Trend: ${blob.public_data.performance_trend}`);
        } else {
          console.warn("⚠️ Invalid or missing encrypted AI blob");
          setEncryptedAIBlob(null);
          setAiLoadError("Invalid blob format");
        }
      } catch (error: any) {
        console.error("❌ Failed to load encrypted AI:", error);
        setEncryptedAIBlob(null);

        // Provide user-friendly error messages
        if (error.message.includes("404")) {
          setAiLoadError(
            "AI data not found. The blob may not have been uploaded yet.",
          );
        } else if (error.message.includes("timeout")) {
          setAiLoadError(
            "Connection timeout. Please check your network and try again.",
          );
        } else {
          setAiLoadError("Failed to load AI insights. Please try again later.");
        }
      } finally {
        setIsLoadingAI(false);
      }
    }

    loadEncryptedAI();
  }, [mergedPlayer, selectedSeason, retryCount]);

  // Check NFT ownership
  useEffect(() => {
    async function checkOwnership() {
      if (!account?.address || !mergedPlayer?.id) {
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
        const result = await checkPlayerNFTOwnership(
          suiClient,
          account.address,
          mergedPlayer.onChainPlayerId || mergedPlayer.id,
          packageId,
        );

        setUserOwnsNFT(result.ownsNFT);
        setUserShares(result.shareCount);

        if (result.ownsNFT) {
          console.log(`✅ User owns ${result.shareCount} shares`);
        }
      } catch (error) {
        console.error("❌ Failed to check NFT ownership:", error);
        setUserOwnsNFT(false);
        setUserShares(0);
      } finally {
        setIsCheckingOwnership(false);
      }
    }

    checkOwnership();
  }, [account?.address, mergedPlayer?.id]);

  const handleTransactionComplete = () => {
    refetchPlayer();
    // Re-check ownership after transaction
    if (account?.address && mergedPlayer?.id) {
      setTimeout(() => {
        checkPlayerNFTOwnership(
          new SuiClient({ url: getFullnodeUrl("testnet") }),
          account.address,
          mergedPlayer.id,
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

            {/* Stats Grid */}
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
            </div>

            {/* 🔥 PREMIUM AI SECTION - SEAL INTEGRATION */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  AI-Powered Insights
                </h2>
                {isCheckingOwnership && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {isLoadingAI ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-accent" />
                  <p className="text-sm text-muted-foreground">
                    Loading encrypted AI analysis...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This may take a few moments if the data is still propagating
                  </p>
                </div>
              ) : aiLoadError ? (
                <div className="text-center py-8 space-y-4">
                  <AlertCircle className="w-12 h-12 mx-auto text-warning" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-warning">
                      {aiLoadError}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      The AI analysis blob may still be propagating on Walrus.
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
              ) : encryptedAIBlob ? (
                <PremiumAIPanel
                  publicData={encryptedAIBlob.public_data}
                  encryptedPremium={encryptedAIBlob.encrypted_premium}
                  playerId={mergedPlayer.onChainPlayerId || mergedPlayer.id}
                  playerName={mergedPlayer.name}
                  season={selectedSeason}
                  userOwnsNFT={userOwnsNFT}
                  userShares={userShares}
                />
              ) : (
                <div className="text-center py-8 space-y-4">
                  <Info className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    AI analysis not available for this season yet.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Premium insights will be encrypted and stored on Walrus once
                    generated.
                  </p>
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
                  <h3 className="font-bold mb-1">
                    {encryptedAIBlob ? "🔐 Seal Encrypted" : "Walrus Verified"}{" "}
                    Data
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {encryptedAIBlob
                      ? "Premium AI insights are encrypted with Seal. Only NFT holders can decrypt."
                      : `${SEASON_LABELS[selectedSeason]} performance data stored on Walrus.`}
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

          {/* Sidebar */}
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
