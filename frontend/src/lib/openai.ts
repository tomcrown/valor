import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey =
      typeof process !== "undefined" && process.env
        ? process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY
        : (import.meta as any).env?.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "Missing OpenAI API key. Please set OPENAI_API_KEY in your .env file"
      );
    }

    openaiClient = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
  }

  return openaiClient;
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

export async function analyzePlayer(
  playerStats: SeasonalPlayerStats
): Promise<AIAnalysis> {
  const openai = getOpenAIClient();
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
As a ${
    playerStats.position
  }, success is measured by: ${positionGuidelines.primary_metrics.join(", ")}
Role: ${positionGuidelines.role_description}

RESEARCH PRIORITIES (Search current season data):

1. AVAILABILITY & FITNESS:
   - Current injury status or suspensions?
   - Recent playing time and rotation patterns?
   - Latest team news and manager comments?

2. RECENT FORM (Last 3-5 Matches):
   - Match-by-match performance breakdown
   - Standout moments, goals, assists, defensive contributions
   - Starting XI or substitute appearances?

3. TACTICAL ROLE & EFFECTIVENESS:
   - How integral to team's game plan?
   - Position-specific contributions (not just goals!)
   - Adapting well to manager's system?

4. TEAM & FIXTURE CONTEXT:
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
✓ Be SPECIFIC with details (match scores, opposition, dates)
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

Provide JSON:
{
  "performance_score": <0-100, position-appropriate>,
  "performance_trend": "<improving|stable|declining>",
  "form_status": "<excellent|good|average|poor>",
  "confidence": <0-100>,
  "reasoning": "<4-5 varied sentences mixing stats with storytelling. Make it readable for everyone. Explain WHY the score makes sense for THIS specific player.>",
  "key_factors": [
    "<5 unique insights about THIS player - mix tactical, physical, and statistical observations>",
    "<Each factor should tell me something I couldn't get from stats alone>",
    "<Use varied language and avoid templated phrases>",
    "<Make it conversational but informative>",
    "<Include upcoming context or opportunities>"
  ],
  "prediction": "<Looking ahead 2-4 weeks, what's the trajectory? Be specific about fixtures, form, or challenges. Make it actionable for investors.>",
  "short_summary": "<ONE punchy sentence that captures THIS player's current story. Style: ${summaryStyle}. Examples: 'Haunting defenses with 4 goals in 3 games' / 'Struggling for minutes after tactical shift' / 'Quietly bossing midfield with 87% pass accuracy' / 'Shot-stopping heroics keeping team afloat'>",
  "availability_status": {
    "is_playing": <boolean>,
    "injury_risk": "<low|medium|high>",
    "playing_time": "<regular|rotation|bench|unknown>",
    "notes": "<Latest fitness/availability intel in plain English>"
  },
  "recent_form": {
    "last_5_games": "<Match-by-match narrative with specific details and outcomes>",
    "goals_per_90": <number>,
    "consistency_rating": <0-100>
  },
  "position_specific_analysis": {
    "role_effectiveness": <0-100>,
    "tactical_importance": <0-100>,
    "key_metrics": ["<3-4 metrics that actually matter for THIS position>"]
  }
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert football analyst writing for Valor's diverse user base - from football fanatics to complete beginners.

CORE PRINCIPLES:
1. Use web search for CURRENT, REAL information about this player
2. Research: injuries, recent matches, team news, manager quotes
3. Focus on position-appropriate metrics (defenders don't need goals!)
4. Write clearly - explain terms like "false nine" or "pressing intensity"
5. Be SPECIFIC - mention actual matches, opponents, dates
6. Make EVERY analysis unique - vary your language, style, and focus
7. Tell a STORY, not just stats
8. If injured/benched, be honest - that's valuable info for traders

For ${playerStats.position}s: ${positionGuidelines.primary_metrics.join(
            ", "
          )} matter most.

Summary style for this analysis: "${summaryStyle}"

Make it impressive. Make it unique. Make it useful.`,
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return {
      ...result,
      season_context: seasonLabel,
    } as AIAnalysis;
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    throw new Error("Failed to analyze player");
  }
}
