import {
  DUMMY_PLAYERS,
  getTopPerformers,
  getRisingPlayers,
  getFallingPlayers,
  PLATFORM_STATS,
} from "@/data/dummyData";

export const VALOR_KNOWLEDGE = {
  platform: {
    name: "Valor",
    description:
      "A decentralized fantasy football stock market where users trade player shares based on real performance data, AI-driven analysis, and blockchain verification.",
    tagline: "Trade Football Players Like Stocks",
  },

  // Essential Questions
  gettingStarted: `To get started on Valor:

1. Click "Log In" in the top right corner
2. Choose to connect your Sui wallet or sign in with Google if you don't have a wallet 
3. Once connected, browse players and their AI scores
4. Buy player shares using SUI tokens
5. Track your portfolio and compete on leaderboards!

It's that simple! 🚀`,

  whatIsValor: `Valor is a revolutionary fantasy football platform that lets you trade real football players like stocks. 

Player values are determined by:
• AI-powered performance scoring analyzing real match data
• Market supply and demand (bonding curve pricing)
• Weekly performance updates verified on Walrus storage
• All transactions secured on the Sui blockchain

You profit when your players perform well and their value increases! 📈`,

  buyFirstShare: `To buy your first player share:

1. Go to the "Players" page
2. Browse players or use filters (Top Performers, Rising, etc.)
3. Click on a player to view details
4. In the Buy/Sell widget on the right, enter quantity
5. Click "Buy Shares" and confirm the transaction
6. Your shares appear in your Portfolio!

Note: You need SUI tokens in your wallet to trade. 💰`,

  weeklyUpdate: `Every Monday, Valor's AI system:

1. Fetches real match data from football APIs
2. Analyzes player performance (goals, assists, ratings, etc.)
3. Generates AI performance scores (0-100)
4. Uploads all data to Walrus decentralized storage
5. Updates player base values on-chain via smart contracts

Player prices adjust based on both AI scores AND market demand! 🔄`,

  // Additional Questions
  depositSwap: `To get SUI tokens for trading:

1. Click "Not enough SUI? Swap now" on any player detail page
2. This opens the Swap Modal where you can exchange other tokens for SUI
3. Or deposit SUI directly from an exchange to your wallet address
4. Your balance updates automatically once confirmed ✅`,

  sellShare: `To sell a player share:

1. Go to your Portfolio page
2. Click on the player you want to sell
3. In the Buy/Sell widget, switch to the "Sell" tab
4. Enter the quantity you want to sell
5. Click "Sell Shares" and confirm
6. You'll receive SUI tokens at the current market price 💸`,

  playerShares: `Player shares are tokenized ownership units of a player's value:

• Each share represents fractional ownership
• Shares trade on a bonding curve (price increases as more are bought)
• You can buy, sell, or transfer shares anytime
• Profits come from price appreciation when players perform well
• AI analysis + market demand determine share price 📊`,

  dataSource: `Player data comes from:

• API-Football (official football statistics API)
• Real match data: goals, assists, minutes, ratings
• Updated weekly after match weeks
• All raw data uploaded to Walrus for verification
• Cryptographic proofs ensure data hasn't been tampered with ✅`,

  aiScoring: `The AI scoring system:

• Analyzes 10+ performance metrics per player
• Considers position-specific expectations
• Weighs recent form more heavily
• Factors in opponent quality and match importance
• Outputs a 0-100 performance score
• Determines trend (up/stable/down)
• GPT-4 provides natural language insights 🤖`,

  dataStorage: `Performance data is stored on Walrus:

• Walrus is Sui's decentralized storage network
• All match stats, AI analysis, and scoring are uploaded weekly
• Each upload gets a unique blob ID (proof)
• Data is permanent, verifiable, and censorship-resistant
• You can verify any player's data using their Walrus Proof ID 🔐`,

  priceCalculation: `Player prices use a hybrid model:

Formula: actual_price = base_value × (1 + shares_issued / 1000)

• Base value = Set by AI performance score weekly
• Shares issued = Market demand (more buyers = higher price)
• Example: 100 shares bought → 10% price increase
• Price adjusts in real-time with each trade
• Weekly AI updates shift the entire curve up/down 📈`,

  injuryHandling: `If a player gets injured:

• AI score decreases based on missed matches
• Base value adjusts downward in weekly update
• Market may sell off shares, further lowering price
• Long-term injuries have bigger impact
• Recovery updates restore value gradually
• All changes are transparent and verifiable 🏥`,

  aiModelDetails: `The AI model works by:

1. Collecting raw stats (goals, assists, passes, tackles)
2. Normalizing by position (defenders judged differently)
3. Calculating weighted performance score
4. GPT-4 analyzes context and generates insights
5. Predicts short-term trend (2-3 weeks)
6. Outputs confidence level (0-100%)

Runs weekly and stores results on Walrus for verification. 🧠`,

  weeklyAnalysis: `Weekly AI analysis includes:

• Performance score (0-100)
• Trend prediction (up/stable/down)
• Detailed reasoning explaining the score
• Key performance factors (3-5 highlights)
• 2-3 week prediction
• Natural language summary for traders
• Confidence percentage

All accessible by clicking "AI Analysis" on any player card. 📊`,

  walrusUsage: `Valor uses Walrus because:

• Decentralized storage ensures no single point of failure
• Permanent data retention (can't be deleted)
• Cryptographic verification prevents tampering
• Cheaper than storing large data on-chain
• Perfect for AI analysis reports and match statistics
• Sui integration makes it seamless

Every player has a Walrus Proof ID you can verify! 🔒`,

  dataVerification: `Data verification works through:

1. Weekly data uploaded to Walrus → receives blob ID
2. Blob ID stored on-chain with smart contract
3. Anyone can fetch blob using the ID
4. Compare on-chain blob ID with Walrus data
5. Cryptographic hash proves data integrity
6. Check player detail pages for "Walrus Verified Data" section

This ensures all performance data is authentic and unmodified. ✅`,
};

// Dynamic data functions
export function getTopPerformerInfo() {
  const topPerformers = getTopPerformers();
  if (topPerformers.length === 0)
    return "No top performers available at the moment.";

  const top = topPerformers[0];
  return `This week's top performer is ${top.name} from ${top.club}! 🏆

• AI Score: ${top.aiScore}/100
• Weekly Change: ${top.weeklyChange >= 0 ? "+" : ""}${top.weeklyChange.toFixed(
    1
  )}%
• Current Value: $${top.currentValue}
• Stats: ${top.stats.goals} goals, ${top.stats.assists} assists in ${
    top.stats.matchesPlayed
  } matches

${top.name} is performing exceptionally with strong ${
    top.stats.goals > 0 ? "goal-scoring" : "playmaking"
  } form. Consider buying shares while the momentum continues! 📈`;
}

export function getRisingPlayersInfo() {
  const rising = getRisingPlayers();
  if (rising.length === 0)
    return "No players are currently rising significantly. Check back after the weekly update!";

  return `Rising players this week: 📈\n\n${rising
    .slice(0, 3)
    .map(
      (p) =>
        `• ${p.name} (${p.club})\n  +${p.weeklyChange.toFixed(
          1
        )}% | AI Score: ${p.aiScore}/100 | $${p.currentValue}`
    )
    .join(
      "\n\n"
    )}\n\nThese players show strong momentum. Early investment could yield good returns! 💰`;
}

export function getFallingPlayersInfo() {
  const falling = getFallingPlayers();
  if (falling.length === 0)
    return "No players are dropping significantly this week.";

  return `Falling players this week: 📉\n\n${falling
    .slice(0, 3)
    .map(
      (p) =>
        `• ${p.name} (${p.club})\n  ${p.weeklyChange.toFixed(1)}% | AI Score: ${
          p.aiScore
        }/100 | $${p.currentValue}`
    )
    .join(
      "\n\n"
    )}\n\nThese players are losing value. Consider selling if you hold shares, or wait for potential recovery opportunities. ⚠️`;
}

export function getPlatformStats() {
  return `Current Valor Platform Stats: 📊

• Total Trading Volume: $${PLATFORM_STATS.totalVolume.toLocaleString()}
• Listed Players: ${PLATFORM_STATS.totalPlayers}
• Active Traders: ${PLATFORM_STATS.activeTraders.toLocaleString()}
• Average Daily Trades: ${PLATFORM_STATS.avgDailyTrades.toLocaleString()}

The platform is growing rapidly with active trading across all major leagues! 🚀`;
}
