import { GoogleGenAI } from "@google/genai";

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey =
      typeof process !== "undefined" && process.env
        ? process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY
        : (import.meta as any).env?.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Missing Gemini API key. Please set GEMINI_API_KEY in your .env file",
      );
    }

    geminiClient = new GoogleGenAI({ apiKey });
  }

  return geminiClient;
}

export interface AIAnalysis {
  performance_score: number;
  performance_trend: "improving" | "stable" | "declining";
  form_status: "excellent" | "good" | "average" | "poor";
  confidence: number;
  reasoning: string;
  key_factors: string[];
  prediction: string;
  short_summary: string;
  season_context?: string;
  availability_status: {
    is_playing: boolean;
    injury_risk: "low" | "medium" | "high";
    playing_time: "regular" | "rotation" | "bench" | "unknown";
    notes: string;
  };
  recent_form: {
    last_5_games: string;
    goals_per_90: number;
    consistency_rating: number;
  };
  position_specific_analysis: {
    role_effectiveness: number;
    tactical_importance: number;
    key_metrics: string[];
  };
}

export type SeasonPeriod = "early" | "mid" | "current";

interface SeasonalPlayerStats {
  name: string;
  position: string;
  team: string;
  goals: number;
  assists: number;
  minutesPlayed: number;
  matchesPlayed: number;
  currentValue: number;
  weeklyChange: number;
  season: SeasonPeriod;
}

const SEASON_LABELS = {
  early: "Early Season (Matches 1-3)",
  mid: "Mid Season (Matches 4-9)",
  current: "Current Season (All Matches)",
};

const SEASON_CONTEXT = {
  early:
    "Early in the campaign where players are finding rhythm. Initial performances often signal the season ahead.",
  mid: "Mid-season where form patterns become clear. Consistency and tactical fit are now evident.",
  current:
    "Full season view showing accumulated impact. Recent form weighs heavily in current valuation.",
};

const POSITION_GUIDELINES = {
  Attacker: {
    primary_metrics: ["goals", "shots on target", "conversion rate", "xG"],
    secondary_metrics: ["assists", "key passes", "dribbles"],
    good_goals_per_match: 0.5,
    excellent_goals_per_match: 0.8,
    role_description: "Goal-scoring threat and attacking catalyst",
  },
  Midfielder: {
    primary_metrics: [
      "assists",
      "key passes",
      "pass completion",
      "chances created",
    ],
    secondary_metrics: ["goals", "tackles", "interceptions"],
    good_goals_per_match: 0.2,
    excellent_goals_per_match: 0.4,
    role_description: "Creative engine and midfield controller",
  },
  Defender: {
    primary_metrics: ["tackles", "interceptions", "clearances", "clean sheets"],
    secondary_metrics: ["pass completion", "aerial duels", "blocks"],
    good_goals_per_match: 0.05,
    excellent_goals_per_match: 0.15,
    role_description: "Defensive anchor and last line of defense",
  },
  Goalkeeper: {
    primary_metrics: [
      "saves",
      "clean sheets",
      "save percentage",
      "goals conceded",
    ],
    secondary_metrics: ["distribution", "sweeper actions", "penalties saved"],
    good_goals_per_match: 0,
    excellent_goals_per_match: 0,
    role_description: "Shot-stopper and defensive commander",
  },
};

const SUMMARY_STYLES = [
  "performance",
  "momentum",
  "impact",
  "tactical",
  "clinical",
];

function cleanJSON(text: string | undefined): string {
  if (!text) return "";
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

export async function analyzePlayer(
  playerStats: SeasonalPlayerStats,
): Promise<AIAnalysis> {
  const ai = getGeminiClient();
  const seasonLabel = SEASON_LABELS[playerStats.season];
  const seasonContext = SEASON_CONTEXT[playerStats.season];
  const positionGuidelines =
    POSITION_GUIDELINES[
    playerStats.position as keyof typeof POSITION_GUIDELINES
    ] || POSITION_GUIDELINES.Attacker;

  const goalsPerMatch =
    playerStats.goals / Math.max(1, playerStats.matchesPlayed);
  const minutesPerGoal =
    playerStats.goals > 0
      ? Math.round(playerStats.minutesPlayed / playerStats.goals)
      : null;
  const goalsPer90 =
    (playerStats.goals / Math.max(1, playerStats.minutesPlayed)) * 90;
  const assistsPer90 =
    (playerStats.assists / Math.max(1, playerStats.minutesPlayed)) * 90;

  const summaryStyle =
    SUMMARY_STYLES[Math.floor(Math.random() * SUMMARY_STYLES.length)];

  const systemInstruction = `You are an expert football analyst writing for Valor's fantasy stock market platform.

CRITICAL: You must be STRICT and REALISTIC with scoring. Most players are NOT elite (85+). The average professional player should score 60-70.

CORE PRINCIPLES:
1. Use Google Search to find CURRENT, REAL information about this player
2. Research: injuries, recent matches, team news, manager quotes
3. Focus on position-appropriate metrics (defenders don't need goals!)
4. Be HONEST - if a player has 4 goals in 15 games, they're average at best
5. DIFFERENTIATE - Don't give everyone 80-85. Use the full 40-95 range!
6. Make EVERY analysis unique - vary your language, style, and focus
7. If injured/benched, that's a LOW score (50-60 range)

For ${playerStats.position}s: ${positionGuidelines.primary_metrics.join(", ")} matter most.`;

  const prompt = `You are an elite football analyst for Valor, a fantasy stock market platform.

PLAYER PROFILE:
Name: ${playerStats.name}
Position: ${playerStats.position} (${positionGuidelines.role_description})
Team: ${playerStats.team}
Analysis Period: ${seasonLabel}

${seasonContext}

CURRENT SEASON STATS:
- Goals: ${playerStats.goals}
- Assists: ${playerStats.assists}
- Matches: ${playerStats.matchesPlayed}
- Minutes: ${playerStats.minutesPlayed}
- Goals/Match: ${goalsPerMatch.toFixed(2)}
- Goals/90min: ${goalsPer90.toFixed(2)}
- Assists/90min: ${assistsPer90.toFixed(2)}
${minutesPerGoal ? `- Minutes/Goal: ${minutesPerGoal}` : ""}

MARKET SNAPSHOT:
- Current Value: $${playerStats.currentValue}
- Weekly Trend: ${playerStats.weeklyChange.toFixed(1)}%

CRITICAL SCORING FRAMEWORK - BE STRICT:

**ATTACKERS:**
- 90-95: Elite (0.8+ goals/90, 20+ goals/season, world-class finishing)
  - Examples: Haaland with 30+ goals, elite strikers
- 80-89: Excellent (0.6-0.8 goals/90, 15-20 goals/season, consistent threat)
  - Examples: Top club strikers, reliable goal scorers
- 70-79: Good (0.4-0.6 goals/90, 10-15 goals/season, solid contributor)
  - Examples: Mid-table team top scorers
- 60-69: Average (0.2-0.4 goals/90, 5-10 goals/season, inconsistent)
  - Examples: Rotation players, struggling strikers
- 50-59: Below Average (0.1-0.2 goals/90, <5 goals/season, poor form)
  - Examples: Bench players, out of form attackers
- 40-49: Poor (minimal output, serious issues)

**MIDFIELDERS:**
- 90-95: Elite (0.5+ G+A/90, dictating games, world-class)
- 80-89: Excellent (0.3-0.5 G+A/90, key playmaker)
- 70-79: Good (0.15-0.3 G+A/90, solid contributor)
- 60-69: Average (0.1-0.15 G+A/90, functional)
- 50-59: Below Average (<0.1 G+A/90, limited impact)
- 40-49: Poor (minimal contribution)

**DEFENDERS:**
- 90-95: Elite (ever-present, team leader, clean sheet machine)
- 80-89: Excellent (regular starter, strong defensively)
- 70-79: Good (reliable, few errors)
- 60-69: Average (adequate performances)
- 50-59: Below Average (making mistakes, rotation)
- 40-49: Poor (serious issues, dropped)

**GOALKEEPERS:**
- 90-95: Elite (golden glove contender, match-winner)
- 80-89: Excellent (regular starter, few errors)
- 70-79: Good (dependable shot-stopper)
- 60-69: Average (adequate performances)
- 50-59: Below Average (errors creeping in)
- 40-49: Poor (serious confidence issues)

IMPORTANT MODIFIERS:
- NOT PLAYING: -15 points (injured/benched)
- LOW MINUTES: -10 points (rotation/substitute)
- POOR TEAM FORM: -5 points
- INJURY PRONE: -5 points
- NEW TO TEAM: -5 points (adaptation period)
- EXCELLENT TEAM FORM: +5 points
- CAPTAIN/KEY PLAYER: +5 points

RESEARCH PRIORITIES (Use Google Search):

1. AVAILABILITY & FITNESS:
   - Search: "${playerStats.name} injury news ${new Date().getFullYear()}"
   - Current injury status or suspensions?
   - Playing time and rotation?

2. RECENT FORM (Last 3-5 Matches):
   - Search: "${playerStats.name} recent matches stats ${playerStats.team}"
   - Match-by-match performance
   - Starting or substitute?

3. TACTICAL ROLE:
   - Search: "${playerStats.name} tactical role ${playerStats.team}"
   - Integral to game plan?
   - Position-specific contributions

4. TEAM CONTEXT:
   - Search: "${playerStats.team} form upcoming fixtures"
   - Team's current form
   - Upcoming difficulty

CRITICAL EXAMPLES FOR REFERENCE:

**Attacker with 21 goals in 20 games:** 90-92 (elite)
**Attacker with 7 goals in 6 games:** 82-85 (excellent but small sample)
**Attacker with 4 goals in 15 games:** 62-68 (average, not elite!)
**Attacker with 3 goals in 3 games:** 70-75 (early season, promising)

**Midfielder with 10 G+A in 20 games:** 80-85 (excellent)
**Midfielder with 4 G+A in 15 games:** 65-70 (average)
**Midfielder with 2 G+A in 6 games:** 68-72 (decent)

WRITING GUIDELINES:
✓ Be SPECIFIC with actual match details you find
✓ Vary your language - don't repeat phrases
✓ Make each player unique based on their situation
✓ Celebrate position-appropriate contributions
✓ Be honest about weaknesses

AVOID:
✗ Giving everyone 80-85 scores!
✗ Being too generous
✗ Generic summaries
✗ Overusing "solid", "decent"
✗ Ignoring the actual statistics

RESPONSE FORMAT (no markdown, no backticks):
{
  "performance_score": 72,
  "performance_trend": "stable",
  "form_status": "good",
  "confidence": 85,
  "reasoning": "detailed reasoning here",
  "key_factors": ["factor 1", "factor 2", "factor 3", "factor 4"],
  "prediction": "prediction here",
  "short_summary": "summary here",
  "availability_status": {
    "is_playing": true,
    "injury_risk": "low",
    "playing_time": "regular",
    "notes": "notes here"
  },
  "recent_form": {
    "last_5_games": "form description",
    "goals_per_90": ${goalsPer90.toFixed(2)},
    "consistency_rating": 7.5
  },
  "position_specific_analysis": {
    "role_effectiveness": 75,
    "tactical_importance": 80,
    "key_metrics": ["metric 1", "metric 2", "metric 3"]
  }
}`;

  try {

    const startTime = Date.now();

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        tools: [{ googleSearch: {} }],
      },
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Handle different response formats
    let responseText: string;
    if (typeof response.text === "function") {
      responseText = response.text;
    } else if (typeof response.text === "string") {
      responseText = response.text;
    } else if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
      responseText = response.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Unable to extract text from Gemini response");
    }

    const cleanedText = cleanJSON(responseText);

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = cleanedText;
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    let analysis: AIAnalysis;
    try {
      analysis = JSON.parse(jsonStr);
    } catch (err) {
      throw err;
    }

    // Verify we got real data
    if (!analysis.prediction || !analysis.key_factors || !analysis.reasoning) {
    } else {

    }

    return {
      ...analysis,
      season_context: seasonLabel,
    } as AIAnalysis;
  } catch (error: any) {


    // If Gemini fails, throw error instead of returning fallback
    throw new Error(
      `Failed to analyze player: ${error.message || JSON.stringify(error)}`,
    );
  }
}
