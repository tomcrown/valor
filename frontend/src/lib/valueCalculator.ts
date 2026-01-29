import type { PurePlayerStats } from "../data/apiData.js";
import { SUI_CONFIG } from "../config/sui.config.ts";

/**
 * Calculate position-adjusted performance metrics
 */
function calculatePositionMetrics(
  position: string,
  stats: PurePlayerStats,
): { primaryScore: number; secondaryScore: number } {
  const matchesPlayed = Math.max(1, stats.matchesPlayed);
  const minutesPer90 = stats.minutesPlayed / 90;

  switch (position) {
    case "Attacker":
      // Primary: Goals per 90, Secondary: Assists
      const goalsPer90 =
        minutesPer90 > 0 ? (stats.goals / minutesPer90) * 90 : 0;
      const assistsPer90 =
        minutesPer90 > 0 ? (stats.assists / minutesPer90) * 90 : 0;

      // Elite attackers: 0.8+ goals/90, Good: 0.5+, Average: 0.3+
      const primaryScore = Math.min(100, (goalsPer90 / 0.8) * 100);
      const secondaryScore = Math.min(100, (assistsPer90 / 0.5) * 100);

      return { primaryScore, secondaryScore };

    case "Midfielder":
      // Primary: Assists + Goal contribution, Secondary: Consistency
      const goalContribution = stats.goals + stats.assists;
      const contributionPer90 =
        minutesPer90 > 0 ? (goalContribution / minutesPer90) * 90 : 0;

      // Elite midfielders: 0.6+ G+A/90, Good: 0.3+, Average: 0.15+
      const primary = Math.min(100, (contributionPer90 / 0.6) * 100);
      const secondary = Math.min(100, (matchesPlayed / 20) * 100);

      return { primaryScore: primary, secondaryScore: secondary };

    case "Defender":
      // For defenders, we weight minutes played heavily + any attacking contribution
      const attackingBonus = stats.goals * 20 + stats.assists * 10;
      const minutesScore = Math.min(100, (stats.minutesPlayed / 1800) * 100);

      return {
        primaryScore: minutesScore,
        secondaryScore: Math.min(100, attackingBonus),
      };

    case "Goalkeeper":
      // Minutes played is key for goalkeepers
      const gkScore = Math.min(100, (stats.minutesPlayed / 2000) * 100);
      return { primaryScore: gkScore, secondaryScore: 50 };

    default:
      return { primaryScore: 50, secondaryScore: 50 };
  }
}

/**
 * Normalize AI score to be more realistic based on actual stats
 * This prevents the AI from being too generous or too harsh
 */
function normalizeAIScore(
  rawAIScore: number,
  position: string,
  stats: PurePlayerStats,
): number {
  // Calculate objective performance score from stats
  const { primaryScore, secondaryScore } = calculatePositionMetrics(
    position,
    stats,
  );
  const objectiveScore = primaryScore * 0.7 + secondaryScore * 0.3;

  // Blend AI score with objective score (60% AI, 40% objective)
  // This prevents AI from being wildly off from reality
  const blendedScore = rawAIScore * 0.6 + objectiveScore * 0.4;

  // Apply position-specific adjustments
  let finalScore = blendedScore;

  // Bonus for consistency (playing regularly)
  const matchesPlayed = stats.matchesPlayed;
  if (matchesPlayed >= 15) {
    finalScore += 5; // Consistency bonus
  } else if (matchesPlayed <= 5) {
    finalScore -= 10; // Penalize low game time
  }

  // Clamp between 40-95 (reserve 95+ for truly exceptional seasons)
  return Math.max(40, Math.min(95, Math.round(finalScore)));
}

export function calculateEarlySeasonBaseValue(
  rawAIScore: number,
  position: string,
  seasonStats: PurePlayerStats,
): bigint {
  // Normalize the AI score first
  const aiScore = normalizeAIScore(rawAIScore, position, seasonStats);

  const MIN_BASE = 0.01;
  const MAX_BASE = 0.1;

  // More aggressive position baselines to create differentiation
  const positionBaselines: Record<string, number> = {
    Attacker: 0.08, // Reduced from 0.12
    Midfielder: 0.06, // Reduced from 0.10
    Defender: 0.04, // Reduced from 0.08
    Goalkeeper: 0.035, // Reduced from 0.07
  };

  const baseline = positionBaselines[position] || 0.06;

  // More dynamic score multiplier (0.3x to 1.3x based on score)
  const scoreMultiplier = 0.3 + aiScore / 100;

  // Position-specific performance bonuses
  let performanceBonus = 0;
  const { primaryScore } = calculatePositionMetrics(position, seasonStats);

  if (position === "Attacker") {
    // Heavy goal bonus for attackers
    performanceBonus = seasonStats.goals * 0.008 + seasonStats.assists * 0.004;
  } else if (position === "Midfielder") {
    // Balanced goal/assist for midfielders
    performanceBonus = seasonStats.goals * 0.006 + seasonStats.assists * 0.006;
  } else if (position === "Defender") {
    // Huge bonus for defensive goals/assists (rare)
    performanceBonus = seasonStats.goals * 0.015 + seasonStats.assists * 0.008;
  } else {
    // Goalkeeper - minimal attacking bonus
    performanceBonus = seasonStats.goals * 0.02 + seasonStats.assists * 0.01;
  }

  let finalValue = baseline * scoreMultiplier + performanceBonus;

  // Apply early season uncertainty discount (15% reduction)
  finalValue *= 0.85;

  finalValue = Math.max(MIN_BASE, Math.min(finalValue, MAX_BASE));

  return BigInt(Math.floor(finalValue * 1_000_000_000));
}

export function calculateMidCurrentSeasonValue(
  previousBaseValue: bigint,
  rawAIScore: number,
  currentStats: PurePlayerStats,
  previousStats: PurePlayerStats,
  position?: string,
): bigint {
  const previousInSui = Number(previousBaseValue) / 1_000_000_000;

  // Normalize AI score if position is provided
  const aiScore = position
    ? normalizeAIScore(rawAIScore, position, currentStats)
    : rawAIScore;

  // More nuanced AI-based multiplier
  // Score 50 = neutral (1.0x), Score 40 = 0.8x, Score 70 = 1.4x, Score 90 = 2.0x
  const aiScoreEffect = (aiScore - 50) / 50; // -0.2 to +0.8 range
  const aiMultiplier = 1 + aiScoreEffect * 0.8; // 0.84x to 1.64x range

  // Calculate performance delta with diminishing returns
  const goalDelta = currentStats.goals - previousStats.goals;
  const assistDelta = currentStats.assists - previousStats.assists;

  // Diminishing returns on high goal counts
  const goalEffect =
    goalDelta > 0
      ? Math.log(1 + goalDelta) * 0.08 // ~8% per goal early, diminishing
      : goalDelta * 0.1; // Steeper penalty for fewer goals

  const assistEffect =
    assistDelta > 0
      ? Math.log(1 + assistDelta) * 0.05 // ~5% per assist early
      : assistDelta * 0.08;

  const performanceMultiplier = 1 + goalEffect + assistEffect;

  // Consistency factor with more granular scaling
  const prevMatches = Math.max(1, previousStats.matchesPlayed);
  const matchIncrease = currentStats.matchesPlayed - prevMatches;

  let consistencyFactor = 1.0;
  if (matchIncrease >= 10) {
    consistencyFactor = 1.15; // Played lots of games
  } else if (matchIncrease >= 5) {
    consistencyFactor = 1.08; // Regular starter
  } else if (matchIncrease >= 2) {
    consistencyFactor = 1.02; // Some games
  } else if (matchIncrease <= 0) {
    consistencyFactor = 0.85; // Not playing much
  }

  // Combine all factors
  let totalMultiplier =
    aiMultiplier * performanceMultiplier * consistencyFactor;

  // More realistic bounds: -40% to +50% per season
  const MIN_MULTIPLIER = 0.6;
  const MAX_MULTIPLIER = 1.5;

  totalMultiplier = Math.max(
    MIN_MULTIPLIER,
    Math.min(totalMultiplier, MAX_MULTIPLIER),
  );

  let newValue = previousInSui * totalMultiplier;

  // Expanded max range for top performers
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
  currentSeason: "early" | "mid" | "current",
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
  baseValueMist: bigint,
): number {
  const baseInSui = Number(baseValueMist) / 1_000_000_000;
  return baseInSui * 1000;
}
