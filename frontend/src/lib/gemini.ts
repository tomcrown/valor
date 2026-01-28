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
  const goalsPlus90 =
    (playerStats.goals / Math.max(1, playerStats.minutesPlayed)) * 90;

  const summaryStyle =
    SUMMARY_STYLES[Math.floor(Math.random() * SUMMARY_STYLES.length)];

  const systemInstruction = `You are an expert football analyst writing for Valor's diverse user base - from football fanatics to complete beginners.

CORE PRINCIPLES:
1. Use Google Search to find CURRENT, REAL information about this player
2. Research: injuries, recent matches, team news, manager quotes
3. Focus on position-appropriate metrics (defenders don't need goals!)
4. Write clearly - explain terms like "false nine" or "pressing intensity"
5. Be SPECIFIC - mention actual matches, opponents, dates
6. Make EVERY analysis unique - vary your language, style, and focus
7. Tell a STORY, not just stats
8. If injured/benched, be honest - that's valuable info for traders

For ${playerStats.position}s: ${positionGuidelines.primary_metrics.join(", ")} matter most.

Summary style for this analysis: "${summaryStyle}"

Make it impressive. Make it unique. Make it useful.`;

  const prompt = `You are an elite football analyst for Valor, a fantasy stock market platform. Your audience ranges from die-hard football fans to casual investors who might not know the sport deeply.

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
- Goals/90min: ${goalsPlus90.toFixed(2)}
${minutesPerGoal ? `- Minutes/Goal: ${minutesPerGoal}` : ""}

MARKET SNAPSHOT:
- Current Value: $${playerStats.currentValue}
- Weekly Trend: ${playerStats.weeklyChange.toFixed(1)}%

POSITION CONTEXT:
As a ${playerStats.position}, success is measured by: ${positionGuidelines.primary_metrics.join(", ")}
Role: ${positionGuidelines.role_description}

RESEARCH PRIORITIES (Use Google Search for current season data):

1. AVAILABILITY & FITNESS:
   - Search for: "${playerStats.name} injury news ${new Date().getFullYear()}"
   - Current injury status or suspensions?
   - Recent playing time and rotation patterns?
   - Latest team news and manager comments?

2. RECENT FORM (Last 3-5 Matches):
   - Search for: "${playerStats.name} recent matches stats ${playerStats.team}"
   - Match-by-match performance breakdown
   - Standout moments, goals, assists, defensive contributions
   - Starting XI or substitute appearances?

3. TACTICAL ROLE & EFFECTIVENESS:
   - Search for: "${playerStats.name} tactical role ${playerStats.team}"
   - How integral to team's game plan?
   - Position-specific contributions (not just goals!)
   - Adapting well to manager's system?

4. TEAM & FIXTURE CONTEXT:
   - Search for: "${playerStats.team} upcoming fixtures form"
   - ${playerStats.team}'s current form and league position
   - Upcoming fixture difficulty
   - Team's style favoring this player?

SCORING FRAMEWORK:

**Attackers (90-100)**: Elite goal threat, consistent finishing, creating chaos
**Attackers (75-89)**: Reliable goal contributions, dangerous presence
**Attackers (60-74)**: Decent output, occasional impact
**Attackers (Below 60)**: Struggling for goals and influence

**Midfielders (90-100)**: Dictating games, creating chances, controlling tempo
**Midfielders (75-89)**: Solid contributions, reliable playmaker
**Midfielders (60-74)**: Functional but inconsistent
**Midfielders (Below 60)**: Limited impact on games

**Defenders (90-100)**: Defensive wall, winning duels, organizing backline
**Defenders (75-89)**: Reliable defender, few mistakes
**Defenders (60-74)**: Adequate but vulnerable at times
**Defenders (Below 60)**: Shaky, error-prone

**Goalkeepers (90-100)**: Match-winner with saves, commanding presence
**Goalkeepers (75-89)**: Dependable shot-stopper
**Goalkeepers (60-74)**: Average performances
**Goalkeepers (Below 60)**: Conceding too easily

CRITICAL: MAKE EACH ANALYSIS UNIQUE

For "short_summary", use this style: "${summaryStyle}"
- "performance": Focus on recent match highlights and specific moments
- "momentum": Emphasize trajectory and trend direction  
- "impact": Highlight influence on team results
- "tactical": Explain role importance and system fit
- "clinical": Lead with numbers and efficiency metrics

WRITING GUIDELINES:
✓ Use plain language - explain football terms when you use them
✓ Make it punchy and engaging - traders need quick insights
✓ Be SPECIFIC with details (match scores, opposition, dates you found via search)
✓ Vary sentence structure and vocabulary
✓ Each player should sound different based on their unique situation
✓ Avoid repetitive phrases like "in conclusion", "overall", "currently"
✓ For non-goal scorers, celebrate their actual contributions (saves, tackles, assists)

AVOID:
✗ Generic summaries that could apply to anyone
✗ Overusing "solid", "decent", "overall"
✗ Repeating the same sentence structures
✗ Jargon without explanation
✗ Mentioning the season year repeatedly

IMPORTANT: Use the Google Search tool to find REAL, CURRENT data about ${playerStats.name}. Don't make up stats or news.

RESPONSE FORMAT:
Return ONLY valid JSON with this exact structure (no markdown, no backticks):
{
  "performance_score": 85,
  "performance_trend": "improving",
  "form_status": "excellent",
  "confidence": 90,
  "reasoning": "detailed reasoning here",
  "key_factors": ["factor 1", "factor 2", "factor 3"],
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
    "goals_per_90": 0.85,
    "consistency_rating": 8.5
  },
  "position_specific_analysis": {
    "role_effectiveness": 90,
    "tactical_importance": 95,
    "key_metrics": ["metric 1", "metric 2"]
  }
}`;

  try {
    console.log(`   🤖 Calling Gemini 2.0 Flash with Google Search...`);
    console.log(`   🔍 Researching: ${playerStats.name} (${playerStats.team})`);

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
    console.log(`   ⏱️  Analysis completed in ${duration}s`);

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
      console.error(`   ❌ Failed to parse Gemini JSON:`);
      console.error(`   Raw response:`, responseText.substring(0, 200));
      console.error(`   Cleaned:`, jsonStr.substring(0, 200));
      throw err;
    }

    // Verify we got real data
    if (!analysis.prediction || !analysis.key_factors || !analysis.reasoning) {
      console.warn(`   ⚠️  Warning: AI returned incomplete analysis`);
    } else {
      console.log(
        `   ✅ Full AI analysis received (${analysis.key_factors.length} key factors)`,
      );
    }

    return {
      ...analysis,
      season_context: seasonLabel,
    } as AIAnalysis;
  } catch (error: any) {
    console.error(
      `   ❌ Gemini analysis error:`,
      error.message || JSON.stringify(error),
    );

    // If Gemini fails, throw error instead of returning fallback
    throw new Error(
      `Failed to analyze player: ${error.message || JSON.stringify(error)}`,
    );
  }
}
