use serde::{Deserialize, Serialize};
use reqwest;
use std::env;
use anyhow::{Result, anyhow};

/// AllSportsAPI player response structure
#[derive(Debug, Deserialize)]
struct AllSportsPlayer {
    player_key: u64,
    player_name: String,
    player_goals: String,
    player_assists: String,
    player_minutes: String,
    player_match_played: String,
    team_name: String,
}

/// OpenAI analysis structure (simplified)
#[derive(Debug, Serialize, Deserialize)]
struct AIAnalysis {
    performance_score: u32,
    performance_trend: String,
    form_status: String,
    confidence: u32,
    reasoning: String,
    key_factors: Vec<String>,
    prediction: String,
    short_summary: String,
}

/// The response we'll sign and return
#[derive(Debug, Serialize)]
pub struct ValorOracleResponse {
    pub player_id: String,
    pub player_name: String,
    pub season: String,
    pub stats: PlayerStats,
    pub ai_analysis: AIAnalysis,
    pub base_value_recommendation: u64,
    pub timestamp: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PlayerStats {
    pub goals: u32,
    pub assists: u32,
    pub minutes_played: u32,
    pub matches_played: u32,
}

/// Input payload for process_data
#[derive(Debug, Deserialize)]
pub struct ProcessDataPayload {
    pub player_name: String,
    pub player_id: String,
    pub season: String, // "early" | "mid" | "current"
    pub league_id: u32,
}

/// Fetch player data from AllSportsAPI
async fn fetch_allsports_data(
    player_name: &str,
    league_id: u32,
) -> Result<AllSportsPlayer> {
    let api_key = env::var("ALLSPORTS_API_KEY")
        .map_err(|_| anyhow!("ALLSPORTS_API_KEY not set"))?;
    
    let url = format!(
        "https://apiv2.allsportsapi.com/football?met=Players&playerName={}&leagueId={}&APIkey={}",
        urlencoding::encode(player_name),
        league_id,
        api_key
    );
    
    let response = reqwest::get(&url).await?;
    let json: serde_json::Value = response.json().await?;
    
    if json["success"] != true {
        return Err(anyhow!("AllSportsAPI request failed"));
    }
    
    let results = json["result"]
        .as_array()
        .ok_or_else(|| anyhow!("No results found"))?;
    
    if results.is_empty() {
        return Err(anyhow!("Player not found"));
    }
    
    let player: AllSportsPlayer = serde_json::from_value(results[0].clone())?;
    Ok(player)
}

/// Run OpenAI analysis inside the enclave
async fn run_openai_analysis(
    player_name: &str,
    position: &str,
    team: &str,
    stats: &PlayerStats,
    season: &str,
) -> Result<AIAnalysis> {
    let api_key = env::var("OPENAI_API_KEY")
        .map_err(|_| anyhow!("OPENAI_API_KEY not set"))?;
    
    let client = reqwest::Client::new();
    
    let prompt = format!(
        r#"Analyze this football player's performance:

Player: {}
Position: {}
Team: {}
Season Period: {}

Stats:
- Goals: {}
- Assists: {}
- Minutes: {}
- Matches: {}

Provide a JSON response with:
{{
  "performance_score": <0-100>,
  "performance_trend": "<improving|stable|declining>",
  "form_status": "<excellent|good|average|poor>",
  "confidence": <0-100>,
  "reasoning": "<brief explanation>",
  "key_factors": ["factor1", "factor2", "factor3"],
  "prediction": "<future outlook>",
  "short_summary": "<one sentence>"
}}
"#,
        player_name,
        position,
        team,
        season,
        stats.goals,
        stats.assists,
        stats.minutes_played,
        stats.matches_played
    );
    
    let request_body = serde_json::json!({
        "model": "gpt-4o-mini",
        "messages": [
            {
                "role": "system",
                "content": "You are a football analytics expert. Respond only with valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "response_format": { "type": "json_object" },
        "temperature": 0.7
    });
    
    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request_body)
        .send()
        .await?;
    
    let json: serde_json::Value = response.json().await?;
    
    let content = json["choices"][0]["message"]["content"]
        .as_str()
        .ok_or_else(|| anyhow!("No content in response"))?;
    
    let analysis: AIAnalysis = serde_json::from_str(content)?;
    Ok(analysis)
}

/// Calculate base value recommendation based on AI score
fn calculate_base_value(
    ai_score: u32,
    position: &str,
    stats: &PlayerStats,
) -> u64 {
    // Base value in MIST (1 SUI = 1_000_000_000 MIST)
    let base = 0.001 * 1_000_000_000.0; // 0.001 SUI minimum
    let max_value = 0.2 * 1_000_000_000.0; // 0.20 SUI max (decentralization cap)
    
    // AI score contributes 70% of the value
    let ai_factor = (ai_score as f64 / 100.0) * 0.7;
    
    // Stats contribute 30%
    let goals_per_match = stats.goals as f64 / stats.matches_played.max(1) as f64;
    let stats_factor = goals_per_match.min(1.0) * 0.3;
    
    // Position multiplier
    let position_multiplier = match position {
        "Attacker" => 1.2,
        "Midfielder" => 1.0,
        "Defender" => 0.9,
        "Goalkeeper" => 0.85,
        _ => 1.0,
    };
    
    let total_factor = (ai_factor + stats_factor) * position_multiplier;
    let calculated_value = base + (max_value - base) * total_factor;
    
    calculated_value.round() as u64
}

/// Main processing function - called by the enclave HTTP server
pub async fn process_data(payload: ProcessDataPayload) -> Result<ValorOracleResponse> {
    println!("Processing data for player: {}", payload.player_name);
    
    // Step 1: Fetch data from AllSportsAPI
    let player_data = fetch_allsports_data(&payload.player_name, payload.league_id).await?;
    
    // Step 2: Parse stats
    let stats = PlayerStats {
        goals: player_data.player_goals.parse().unwrap_or(0),
        assists: player_data.player_assists.parse().unwrap_or(0),
        minutes_played: player_data.player_minutes.parse().unwrap_or(0),
        matches_played: player_data.player_match_played.parse().unwrap_or(0),
    };
    
    // Step 3: Run AI analysis
    let position = infer_position(&player_data.player_name); // Simplified
    let ai_analysis = run_openai_analysis(
        &payload.player_name,
        position,
        &player_data.team_name,
        &stats,
        &payload.season,
    ).await?;
    
    // Step 4: Calculate recommended base value
    let base_value = calculate_base_value(
        ai_analysis.performance_score,
        position,
        &stats,
    );
    
    // Step 5: Create response
    let response = ValorOracleResponse {
        player_id: payload.player_id,
        player_name: payload.player_name,
        season: payload.season,
        stats,
        ai_analysis,
        base_value_recommendation: base_value,
        timestamp: std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs(),
    };
    
    Ok(response)
}

/// Helper: Infer position from name (simplified - in production, fetch from API)
fn infer_position(player_name: &str) -> &'static str {
    // This is simplified - in production, you'd get this from the API
    match player_name {
        name if name.contains("Haaland") => "Attacker",
        name if name.contains("Mbappe") => "Attacker",
        name if name.contains("Salah") => "Attacker",
        name if name.contains("Saka") => "Attacker",
        name if name.contains("Bellingham") => "Midfielder",
        name if name.contains("Szoboszlai") => "Midfielder",
        name if name.contains("Maguire") => "Defender",
        name if name.contains("Raya") => "Goalkeeper",
        _ => "Midfielder",
    }
}