import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // For client-side usage
});

export interface AIAnalysis {
  performance_score: number;
  trend: "up" | "stable" | "down";
  confidence: number;
  reasoning: string;
  key_factors: string[];
  prediction: string;
  short_summary: string;
}

export async function analyzePlayer(playerStats: {
  name: string;
  position: string;
  team: string;
  goals: number;
  assists: number;
  minutesPlayed: number;
  matchesPlayed: number;
  currentValue: number;
  weeklyChange: number;
}): Promise<AIAnalysis> {
  const prompt = `Analyze this football player for a fantasy stock market named valor:

PLAYER: ${playerStats.name}
POSITION: ${playerStats.position}
TEAM: ${playerStats.team}

SEASON STATS: 
- Goals: ${playerStats.goals}
- Assists: ${playerStats.assists}
- Matches: ${playerStats.matchesPlayed}
- Minutes: ${playerStats.minutesPlayed}

MARKET DATA:
- Current Value: $${playerStats.currentValue}
- Weekly Change: ${playerStats.weeklyChange.toFixed(1)}%

Provide a JSON response with:
{
  "performance_score": <0-100>,
  "trend": "<up|stable|down>",
  "confidence": <0-100>,
  "reasoning": "<2-3 detailed sentences explaining WHY this score, mentioning specific stats and context>",
  "key_factors": ["factor1", "factor2", "factor3"],
  "prediction": "<prediction for next 2-3 weeks>",
  "short_summary": "<1 sentence punchy summary for traders>"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert football analyst for a fantasy stock market named valor. 
          Be insightful, mention specific stats, and explain context (opponent quality, position expectations, etc.). 
          Make it exciting and useful for traders making investment decisions.`,
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return result as AIAnalysis;
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    throw new Error("Failed to analyze player");
  }
}
