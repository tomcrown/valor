// Nautilus service for frontend - fetch verified data
import type { SeasonPeriod } from "@/data/apiData";

export interface NautilusPlayerData {
  player_id: string;
  player_name: string;
  season: string;
  stats: {
    goals: number;
    assists: number;
    minutes_played: number;
    matches_played: number;
  };
  ai_analysis: {
    performance_score: number;
    performance_trend: string;
    form_status: string;
    confidence: number;
    reasoning: string;
    key_factors: string[];
    prediction: string;
    short_summary: string;
  };
  base_value_recommendation: number; // in MIST
  attestation: {
    signature: string;
    publicKey: string;
    timestamp: number;
  };
}

class NautilusService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_NAUTILUS_URL || "http://localhost:3000";
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async getPlayerAnalysis(
    playerId: string,
    playerName: string,
    position: string,
    team: string,
    season: SeasonPeriod,
    stats: {
      goals: number;
      assists: number;
      minutesPlayed: number;
      matchesPlayed: number;
    },
  ): Promise<NautilusPlayerData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/process_data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payload: {
            player_id: playerId,
            player_name: playerName,
            position,
            team,
            season,
            stats: {
              goals: stats.goals,
              assists: stats.assists,
              minutes_played: stats.minutesPlayed,
              matches_played: stats.matchesPlayed,
            },
          },
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      return {
        ...data.intent_message.intent_payload,
        attestation: {
          signature: data.signature,
          publicKey: data.public_key,
          timestamp: data.intent_message.timestamp,
        },
      };
    } catch (error) {
      return null;
    }
  }
}

export const nautilusService = new NautilusService();
