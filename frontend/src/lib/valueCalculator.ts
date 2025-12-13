import type { PurePlayerStats } from "../data/apiData.js";
import { SUI_CONFIG } from "../config/sui.config.ts";

export function calculateEarlySeasonBaseValue(
  aiScore: number,
  position: string,
  seasonStats: PurePlayerStats
): bigint {
  const MIN_BASE = 0.01;
  const MAX_BASE = 0.1;

  const positionBaselines: Record<string, number> = {
    Attacker: 0.12,
    Midfielder: 0.1,
    Defender: 0.08,
    Goalkeeper: 0.07,
  };

  const baseline = positionBaselines[position] || 0.1;

  const scoreMultiplier = 0.5 + aiScore / 100;

  const performanceBonus =
    seasonStats.goals * 0.005 + seasonStats.assists * 0.003;

  let finalValue = baseline * scoreMultiplier + performanceBonus;

  finalValue = Math.max(MIN_BASE, Math.min(finalValue, MAX_BASE));

  return BigInt(Math.floor(finalValue * 1_000_000_000));
}

export function calculateMidCurrentSeasonValue(
  previousBaseValue: bigint,
  aiScore: number,
  currentStats: PurePlayerStats,
  previousStats: PurePlayerStats
): bigint {
  const previousInSui = Number(previousBaseValue) / 1_000_000_000;

  const aiChangePercent = (aiScore - 50) / 100;

  const goalDelta = currentStats.goals - previousStats.goals;
  const assistDelta = currentStats.assists - previousStats.assists;

  const performanceChange = goalDelta * 0.02 + assistDelta * 0.01;

  const prevMatches = previousStats.matchesPlayed || 1;
  const matchRatio = currentStats.matchesPlayed / prevMatches;
  const consistencyFactor = Math.min(matchRatio, 1.2);

  let totalMultiplier = 1 + aiChangePercent + performanceChange;
  totalMultiplier *= consistencyFactor;

  const MIN_MULTIPLIER = 0.6;
  const MAX_MULTIPLIER = 1.6;

  totalMultiplier = Math.max(
    MIN_MULTIPLIER,
    Math.min(totalMultiplier, MAX_MULTIPLIER)
  );

  let newValue = previousInSui * totalMultiplier;

  const MIN_BASE = 0.01;
  const MAX_BASE = 0.5;

  newValue = Math.max(MIN_BASE, Math.min(newValue, MAX_BASE));

  return BigInt(Math.floor(newValue * 1_000_000_000));
}

export function getPreviousSeasonStats(
  seasonalStats: {
    early: PurePlayerStats;
    mid: PurePlayerStats;
    current: PurePlayerStats;
  },
  currentSeason: "early" | "mid" | "current"
): PurePlayerStats {
  if (currentSeason === "mid") {
    return seasonalStats.early;
  } else if (currentSeason === "current") {
    return seasonalStats.mid;
  }
  return seasonalStats.early;
}

export function suiToMistBigInt(sui: number): bigint {
  return BigInt(Math.floor(sui * 1_000_000_000));
}

export function mistToSui(mist: bigint): number {
  return Number(mist) / 1_000_000_000;
}

export function onChainBaseMistToFrontendCurrentValue(
  baseValueMist: bigint
): number {
  const baseInSui = Number(baseValueMist) / 1_000_000_000;
  return baseInSui * 1000;
}
