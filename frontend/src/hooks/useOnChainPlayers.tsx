import { useState, useEffect } from "react";
import type { Player } from "@/data/apiData";
import {
  enrichAllPlayersWithContractData,
  enrichPlayerWithContractData,
} from "@/lib/suiDataFetcher";
import { FOOTBALL_PLAYERS, getFootballPlayerById } from "@/data/apiData";

interface UseOnChainPlayersOptions {
  autoFetch?: boolean;
  refetchInterval?: number;
}

interface EnrichedPlayer extends Player {
  onChainSeasonData?: any;
  onChainError?: string;
  onChainPlayerId?: string;
}

export function useOnChainPlayers({
  autoFetch = true,
  refetchInterval,
}: UseOnChainPlayersOptions = {}) {
  const [enrichedPlayers, setEnrichedPlayers] = useState<EnrichedPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [loadingProgress, setLoadingProgress] = useState({
    current: 0,
    total: 0,
  });

  const fetchPlayers = async () => {
    setIsLoading(true);
    setError(null);
    setLoadingProgress({ current: 0, total: FOOTBALL_PLAYERS.length });

    try {
      const enriched = await enrichAllPlayersWithContractData();

      const successful = enriched.filter((p) => !p.onChainError).length;
      const failed = enriched.filter((p) => p.onChainError).length;

      if (failed > 0) {
        enriched.forEach((p) => {
          if (p.onChainError) {
          }
        });
      }

      setEnrichedPlayers(enriched);
      setLastFetched(new Date());
    } catch (err) {
      setError(err as Error);

      const fallbackPlayers = FOOTBALL_PLAYERS.map((player) => ({
        ...player,
        currentValue: 1000,
        weeklyChange: 0,
        valueHistory: [],
        walrusProofId: "",
        onChainError: "Contract data unavailable",
      }));

      setEnrichedPlayers(fallbackPlayers);
    } finally {
      setIsLoading(false);
      setLoadingProgress({ current: 0, total: 0 });
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchPlayers();
    }
  }, []);

  useEffect(() => {
    if (!refetchInterval) return;

    const interval = setInterval(() => {
      fetchPlayers();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval]);

  const getEnrichmentStats = () => {
    const withData = enrichedPlayers.filter(
      (p) => p.onChainSeasonData && !p.onChainError
    ).length;
    const withErrors = enrichedPlayers.filter((p) => p.onChainError).length;
    const total = enrichedPlayers.length;

    return {
      enriched: withData,
      failed: withErrors,
      unenriched: total - withData - withErrors,
      total,
      percentage: total > 0 ? Math.round((withData / total) * 100) : 0,
    };
  };

  return {
    players: enrichedPlayers,
    isLoading,
    error,
    lastFetched,
    loadingProgress,
    stats: getEnrichmentStats(),
    refetch: fetchPlayers,
  };
}

interface UseOnChainPlayerOptions {
  playerId: string;
  autoFetch?: boolean;
}

export function useOnChainPlayer({
  playerId,
  autoFetch = true,
}: UseOnChainPlayerOptions) {
  const [enrichedPlayer, setEnrichedPlayer] = useState<EnrichedPlayer | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchPlayer = async () => {
    const footballPlayer = getFootballPlayerById(playerId);

    if (!footballPlayer) {
      setError(new Error(`Player with ID ${playerId} not found`));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const enriched = await enrichPlayerWithContractData(footballPlayer);

      if (enriched.onChainError) {
      } else {
      }

      setEnrichedPlayer(enriched);
      setLastFetched(new Date());
    } catch (err) {
      setError(err as Error);

      setEnrichedPlayer({
        ...footballPlayer,
        currentValue: 1000,
        weeklyChange: 0,
        valueHistory: [],
        walrusProofId: "",
        onChainError: (err as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && playerId) {
      fetchPlayer();
    }
  }, [playerId]);

  return {
    player: enrichedPlayer,
    isLoading,
    error,
    lastFetched,
    hasOnChainData:
      !!enrichedPlayer?.onChainSeasonData && !enrichedPlayer?.onChainError,
    refetch: fetchPlayer,
  };
}
