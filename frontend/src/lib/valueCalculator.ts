// ============================================================================
// FILE: lib/valueCalculator.ts
// Decentralized, transparent value calculation system
// ============================================================================

import type { PurePlayerStats } from "../data/dummyData.js";
import { SUI_CONFIG } from "../config/sui.config.ts";

// ============================================================================
// EARLY SEASON: Decentralized Initial Pricing
// ============================================================================

/**
 * Calculate initial base value for early season
 *
 * PHILOSOPHY:
 * - Position matters: Attackers naturally more scarce/valuable
 * - AI score provides objective performance assessment
 * - Early season stats give initial momentum indicator
 * - Capped at 0.20 SUI to ensure decentralization
 *
 * @param aiScore - AI performance score (0-100)
 * @param position - Player position
 * @param seasonStats - Early season statistics
 * @returns Base value in MIST (1 SUI = 1,000,000,000 MIST)
 */
export function calculateEarlySeasonBaseValue(
  aiScore: number,
  position: string,
  seasonStats: PurePlayerStats
): bigint {
  const MIN_BASE = 0.01; // 10,000,000 MIST - minimum viable price
  const MAX_BASE = 0.1; // 100,000,000 MIST - decentralization cap

  // Step 1: Position-based baseline (reflects market scarcity)
  const positionBaselines: Record<string, number> = {
    Attacker: 0.12, // Goal scorers are premium
    Midfielder: 0.1, // Balanced contribution
    Defender: 0.08, // Lower scarcity
    Goalkeeper: 0.07, // Specialized role
  };

  const baseline = positionBaselines[position] || 0.1;

  // Step 2: AI Score multiplier (50 = neutral, 0-100 range)
  // Score 0: 0.5x baseline (50% of baseline)
  // Score 50: 1.0x baseline (exactly baseline)
  // Score 100: 1.5x baseline (150% of baseline)
  const scoreMultiplier = 0.5 + aiScore / 100;

  // Step 3: Performance contribution (direct output bonus)
  // Each goal worth 0.005 SUI (~0.5%)
  // Each assist worth 0.003 SUI (~0.3%)
  const performanceBonus =
    seasonStats.goals * 0.005 + seasonStats.assists * 0.003;

  // Step 4: Calculate final value
  let finalValue = baseline * scoreMultiplier + performanceBonus;

  // Step 5: Apply bounds
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

// ============================================================================
// MID/CURRENT SEASON: Performance-Based Adjustments
// ============================================================================

/**
 * Calculate updated base value for mid/current season
 *
 * PHILOSOPHY:
 * - AI score drives overall trend (improving/declining)
 * - Actual performance changes (goals, assists) provide concrete evidence
 * - Consistency (matches played) matters for reliability
 * - Changes are bounded to prevent manipulation
 *
 * @param previousBaseValue - Previous season's base value in MIST
 * @param aiScore - Current AI performance score (0-100)
 * @param currentStats - Current season statistics
 * @param previousStats - Previous season statistics
 * @returns New base value in MIST
 */
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

  // Step 1: AI-driven base change
  // Score 50 = neutral (0% change)
  // Score 100 = +50% potential
  // Score 0 = -50% potential
  const aiChangePercent = (aiScore - 50) / 100;
  console.log(`   AI change factor: ${(aiChangePercent * 100).toFixed(1)}%`);

  // Step 2: Performance delta analysis
  const goalDelta = currentStats.goals - previousStats.goals;
  const assistDelta = currentStats.assists - previousStats.assists;

  // Each additional goal = +2% bonus
  // Each additional assist = +1% bonus
  // Negative deltas also count (performance decline)
  const performanceChange = goalDelta * 0.02 + assistDelta * 0.01;
  console.log(
    `   Performance Δ: ${goalDelta}G, ${assistDelta}A → ${(
      performanceChange * 100
    ).toFixed(1)}%`
  );

  // Step 3: Consistency factor (match availability)
  const prevMatches = previousStats.matchesPlayed || 1;
  const matchRatio = currentStats.matchesPlayed / prevMatches;
  const consistencyFactor = Math.min(matchRatio, 1.2); // Cap at +20% for playing more
  console.log(
    `   Consistency: ${currentStats.matchesPlayed}/${prevMatches} matches → ${(
      consistencyFactor * 100 -
      100
    ).toFixed(1)}% factor`
  );

  // Step 4: Combine all factors
  let totalMultiplier = 1 + aiChangePercent + performanceChange;
  totalMultiplier *= consistencyFactor;

  // Step 5: Apply safety bounds
  // Maximum increase: +60% per season (prevents pump schemes)
  // Maximum decrease: -40% per season (prevents panic dumps)
  const MIN_MULTIPLIER = 0.6; // -40% max
  const MAX_MULTIPLIER = 1.6; // +60% max

  totalMultiplier = Math.max(
    MIN_MULTIPLIER,
    Math.min(totalMultiplier, MAX_MULTIPLIER)
  );
  console.log(`   Total multiplier: ${totalMultiplier.toFixed(3)}x (capped)`);

  // Step 6: Calculate new value
  let newValue = previousInSui * totalMultiplier;

  // Step 7: Apply absolute bounds
  const MIN_BASE = 0.01; // Floor
  const MAX_BASE = 0.5; // Ceiling (allows growth for exceptional players)

  newValue = Math.max(MIN_BASE, Math.min(newValue, MAX_BASE));
  console.log(`   New base value: ${newValue.toFixed(4)} SUI`);
  console.log(
    `   Change: ${((newValue / previousInSui - 1) * 100).toFixed(2)}%`
  );

  return BigInt(Math.floor(newValue * 1_000_000_000));
}

// ============================================================================
// HELPER: Get Previous Season Stats
// ============================================================================

/**
 * Get the appropriate previous season stats based on current season
 */
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
  // For early season, return the early stats itself (no previous)
  return seasonalStats.early;
}

// ============================================================================
// CONVERSION HELPERS
// ============================================================================

/** Convert SUI number -> MIST bigint */
export function suiToMistBigInt(sui: number): bigint {
  return BigInt(Math.floor(sui * 1_000_000_000));
}

/** Convert MIST bigint -> SUI number */
export function mistToSui(mist: bigint): number {
  return Number(mist) / 1_000_000_000;
}

/** Convert on-chain base_value (MIST) -> frontend "currentValue" */
export function onChainBaseMistToFrontendCurrentValue(
  baseValueMist: bigint
): number {
  const baseInSui = Number(baseValueMist) / 1_000_000_000;
  return baseInSui * 1000;
}
