// ============================================================================
// FILE: hooks/useUserPortfolio.ts
// Fetch user's real portfolio from blockchain - ENOKI COMPATIBLE
// ============================================================================

import { useState, useEffect } from "react";
import { useCurrentAccount, useCurrentWallet } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { SUI_CONFIG, mistToSui } from "@/config/sui.config";
import { enrichPlayerWithContractData } from "@/lib/suiDataFetcher";
import { FOOTBALL_PLAYERS } from "@/data/dummyData";
import type { Player } from "@/data/dummyData";
import { isEnokiWallet } from "@mysten/enoki";

export interface UserHolding {
  objectId: string; // PlayerSharesNFT object ID
  playerId: string; // On-chain player ID
  playerName: string;
  quantity: number;
  entryPrice: number; // Average entry price in SUI
  purchaseTimestamp: number;
}

export interface EnrichedHolding extends UserHolding {
  currentPrice: number; // Current market price in SUI
  totalValue: number; // quantity * currentPrice
  totalCost: number; // quantity * entryPrice
  pnl: number; // P&L percentage
  pnlAmount: number; // P&L in SUI
  imageUrl: string;
  nftImageUrl: string;
  club: string;
  player?: Player; // Full player data
}

export interface PortfolioSummary {
  totalValue: number; // Total portfolio value in SUI
  totalInvested: number; // Total amount invested in SUI
  totalPnL: number; // Total P&L percentage
  totalPnLAmount: number; // Total P&L in SUI
  positionsCount: number;
  suiBalance: number; // Wallet SUI balance
}

export function useUserPortfolio() {
  const currentAccount = useCurrentAccount();
  const { currentWallet } = useCurrentWallet();
  const [holdings, setHoldings] = useState<EnrichedHolding[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary>({
    totalValue: 0,
    totalInvested: 0,
    totalPnL: 0,
    totalPnLAmount: 0,
    positionsCount: 0,
    suiBalance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if using Enoki wallet
  const isEnoki = currentWallet && isEnokiWallet(currentWallet);

  useEffect(() => {
    if (!currentAccount?.address) {
      setHoldings([]);
      setSummary({
        totalValue: 0,
        totalInvested: 0,
        totalPnL: 0,
        totalPnLAmount: 0,
        positionsCount: 0,
        suiBalance: 0,
      });
      setIsLoading(false);
      return;
    }

    console.log("📊 Portfolio fetching for:", {
      address: currentAccount.address,
      walletType: isEnoki ? "Enoki (zkLogin)" : "Standard Sui Wallet",
    });

    fetchPortfolio();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchPortfolio, 30000);
    return () => clearInterval(interval);
  }, [currentAccount?.address, isEnoki]);

  async function fetchPortfolio() {
    if (!currentAccount?.address) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log("🔄 Fetching portfolio for address:", currentAccount.address);

      const client = new SuiClient({ url: SUI_CONFIG.rpcUrl });

      // 1. Fetch SUI balance
      const suiBalance = await fetchSuiBalance(client, currentAccount.address);
      console.log("💰 SUI Balance:", suiBalance);

      // 2. Fetch user's PlayerSharesNFT objects with retry logic
      const userHoldings = await fetchUserHoldingsWithRetry(
        client,
        currentAccount.address
      );

      console.log(`📦 Found ${userHoldings.length} holdings`);

      if (userHoldings.length === 0) {
        console.log("ℹ️ No holdings found");
        setSummary({
          totalValue: 0,
          totalInvested: 0,
          totalPnL: 0,
          totalPnLAmount: 0,
          positionsCount: 0,
          suiBalance,
        });
        setHoldings([]);
        setIsLoading(false);
        return;
      }

      // 3. Fetch current prices for each player
      const enrichedHoldings = await enrichHoldingsWithPrices(userHoldings);
      console.log(`✅ Enriched ${enrichedHoldings.length} holdings`);

      // 4. Calculate portfolio summary
      const portfolioSummary = calculatePortfolioSummary(
        enrichedHoldings,
        suiBalance
      );

      console.log("📊 Portfolio Summary:", portfolioSummary);

      setHoldings(enrichedHoldings);
      setSummary(portfolioSummary);
      setIsLoading(false);
    } catch (err: any) {
      console.error("❌ Failed to fetch portfolio:", err);
      setError(err.message);
      setIsLoading(false);
    }
  }

  return {
    holdings,
    summary,
    isLoading,
    error,
    refetch: fetchPortfolio,
    isEnokiWallet: isEnoki,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

async function fetchSuiBalance(
  client: SuiClient,
  address: string
): Promise<number> {
  try {
    const balance = await client.getBalance({
      owner: address,
      coinType: "0x2::sui::SUI",
    });

    return mistToSui(BigInt(balance.totalBalance));
  } catch (error) {
    console.error("Failed to fetch SUI balance:", error);
    return 0;
  }
}

async function fetchUserHoldingsWithRetry(
  client: SuiClient,
  address: string,
  retries = 3
): Promise<UserHolding[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔍 Fetching holdings (attempt ${attempt}/${retries})...`);
      return await fetchUserHoldings(client, address);
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed:`, error);

      if (attempt === retries) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  return [];
}

async function fetchUserHoldings(
  client: SuiClient,
  address: string
): Promise<UserHolding[]> {
  try {
    console.log("🔍 Fetching PlayerSharesNFT objects for:", address);

    // Try with cursor-based pagination for better reliability
    const holdings: UserHolding[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage) {
      const response = await client.getOwnedObjects({
        owner: address,
        filter: {
          StructType: `${SUI_CONFIG.contracts.packageId}::valor::PlayerSharesNFT`,
        },
        options: {
          showContent: true,
          showType: true,
        },
        cursor,
        limit: 50, // Fetch in batches
      });

      console.log(`📦 Batch found ${response.data.length} objects`);

      for (const obj of response.data) {
        if (!obj.data?.content || obj.data.content.dataType !== "moveObject") {
          console.warn("⚠️ Skipping invalid object:", obj.data?.objectId);
          continue;
        }

        try {
          const fields = (obj.data.content as any).fields;

          const holding: UserHolding = {
            objectId: obj.data.objectId,
            playerId: fields.player_id || "",
            playerName: fields.player_name || "Unknown Player",
            quantity: parseInt(fields.shares || "0"),
            entryPrice: mistToSui(BigInt(fields.purchase_price || "0")),
            purchaseTimestamp: parseInt(fields.purchase_timestamp || "0"),
          };

          if (holding.quantity > 0) {
            holdings.push(holding);
            console.log(
              `  ✓ ${holding.playerName}: ${holding.quantity} shares`
            );
          }
        } catch (parseError) {
          console.error("❌ Error parsing object:", parseError);
          continue;
        }
      }

      hasNextPage = response.hasNextPage;
      cursor = response.nextCursor ?? null;

      if (hasNextPage) {
        console.log("📄 Fetching next page...");
      }
    }

    console.log(`✅ Total holdings parsed: ${holdings.length}`);
    return holdings;
  } catch (error) {
    console.error("Failed to fetch user holdings:", error);
    throw error;
  }
}

async function enrichHoldingsWithPrices(
  holdings: UserHolding[]
): Promise<EnrichedHolding[]> {
  const enrichedHoldings: EnrichedHolding[] = [];

  for (const holding of holdings) {
    try {
      // Find matching football player by name
      const footballPlayer = FOOTBALL_PLAYERS.find(
        (p) => p.name.toLowerCase() === holding.playerName.toLowerCase()
      );

      if (!footballPlayer) {
        console.warn(
          `⚠️ Player not found in football data: ${holding.playerName}`
        );

        // Add with default values if player not found
        enrichedHoldings.push({
          ...holding,
          currentPrice: holding.entryPrice, // Use entry price as fallback
          totalValue: holding.quantity * holding.entryPrice,
          totalCost: holding.quantity * holding.entryPrice,
          pnl: 0,
          pnlAmount: 0,
          imageUrl: "",
          nftImageUrl: "",
          club: "Unknown",
        });
        continue;
      }

      // Fetch current price from contract
      const enrichedPlayer = await enrichPlayerWithContractData(footballPlayer);
      const currentPrice = enrichedPlayer.currentValue;

      const totalValue = holding.quantity * currentPrice;
      const totalCost = holding.quantity * holding.entryPrice;
      const pnlAmount = totalValue - totalCost;
      const pnl = totalCost > 0 ? (pnlAmount / totalCost) * 100 : 0;

      enrichedHoldings.push({
        ...holding,
        currentPrice,
        totalValue,
        totalCost,
        pnl,
        pnlAmount,
        imageUrl: footballPlayer.imageUrl,
        nftImageUrl: footballPlayer.nftImageUrl,
        club: footballPlayer.club,
        player: enrichedPlayer,
      });

      console.log(
        `✅ Enriched ${holding.playerName}: ${currentPrice.toFixed(4)} SUI (${
          pnl > 0 ? "+" : ""
        }${pnl.toFixed(2)}%)`
      );
    } catch (error) {
      console.error(`Failed to enrich ${holding.playerName}:`, error);

      // Add with entry price as fallback
      enrichedHoldings.push({
        ...holding,
        currentPrice: holding.entryPrice,
        totalValue: holding.quantity * holding.entryPrice,
        totalCost: holding.quantity * holding.entryPrice,
        pnl: 0,
        pnlAmount: 0,
        imageUrl: "",
        nftImageUrl: "",
        club: "Unknown",
      });
    }
  }

  return enrichedHoldings;
}

function calculatePortfolioSummary(
  holdings: EnrichedHolding[],
  suiBalance: number
): PortfolioSummary {
  const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
  const totalInvested = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalPnLAmount = totalValue - totalInvested;
  const totalPnL =
    totalInvested > 0 ? (totalPnLAmount / totalInvested) * 100 : 0;

  return {
    totalValue,
    totalInvested,
    totalPnL,
    totalPnLAmount,
    positionsCount: holdings.length,
    suiBalance,
  };
}
