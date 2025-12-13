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

  console.log(`\n📊 Early Season Calculation for ${position}:`);
  console.log(`   Position baseline: ${baseline} SUI`);
  console.log(
    `   AI Score: ${aiScore} → Multiplier: ${scoreMultiplier.toFixed(2)}x`
  );
  console.log(`   Stats: ${seasonStats.goals}G, ${seasonStats.assists}A`);
  console.log(`   Performance bonus: +${performanceBonus.toFixed(4)} SUI`);
  console.log(`   Final value: ${finalValue.toFixed(4)} SUI`);

  return BigInt(Math.floor(finalValue * 1_000_000_000));
}

export function calculateMidCurrentSeasonValue(
  previousBaseValue: bigint,
  aiScore: number,
  currentStats: PurePlayerStats,
  previousStats: PurePlayerStats
): bigint {
  const previousInSui = Number(previousBaseValue) / 1_000_000_000;

  console.log(`\n📊 Mid/Current Season Calculation:`);
  console.log(`   Previous base: ${previousInSui.toFixed(4)} SUI`);
  console.log(`   AI Score: ${aiScore}`);

  const aiChangePercent = (aiScore - 50) / 100;
  console.log(`   AI change factor: ${(aiChangePercent * 100).toFixed(1)}%`);

  const goalDelta = currentStats.goals - previousStats.goals;
  const assistDelta = currentStats.assists - previousStats.assists;

  const performanceChange = goalDelta * 0.02 + assistDelta * 0.01;
  console.log(
    `   Performance Δ: ${goalDelta}G, ${assistDelta}A → ${(
      performanceChange * 100
    ).toFixed(1)}%`
  );

  const prevMatches = previousStats.matchesPlayed || 1;
  const matchRatio = currentStats.matchesPlayed / prevMatches;
  const consistencyFactor = Math.min(matchRatio, 1.2);
  console.log(
    `   Consistency: ${currentStats.matchesPlayed}/${prevMatches} matches → ${(
      consistencyFactor * 100 -
      100
    ).toFixed(1)}% factor`
  );

  let totalMultiplier = 1 + aiChangePercent + performanceChange;
  totalMultiplier *= consistencyFactor;

  const MIN_MULTIPLIER = 0.6;
  const MAX_MULTIPLIER = 1.6;

  totalMultiplier = Math.max(
    MIN_MULTIPLIER,
    Math.min(totalMultiplier, MAX_MULTIPLIER)
  );
  console.log(`   Total multiplier: ${totalMultiplier.toFixed(3)}x (capped)`);

  let newValue = previousInSui * totalMultiplier;

  const MIN_BASE = 0.01;
  const MAX_BASE = 0.5;

  newValue = Math.max(MIN_BASE, Math.min(newValue, MAX_BASE));
  console.log(`   New base value: ${newValue.toFixed(4)} SUI`);
  console.log(
    `   Change: ${((newValue / previousInSui - 1) * 100).toFixed(2)}%`
  );

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
