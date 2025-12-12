// ============================================================================
// FILE 2: src/lib/valorKnowledge.ts
// Updated Knowledge Base with Pulse, Portfolio, NFTs, and Seasonal Data
// ============================================================================

import {
  getTopPerformers,
  getRisingPlayers,
  getFallingPlayers,
  getHighPerformers,
  getUndervaluedPlayers,
  PLATFORM_STATS,
} from "@/data/dummyData";

export const VALOR_KNOWLEDGE = {
  platform: {
    name: "Valor",
    description:
      "A decentralized fantasy football stock market where users trade player shares based on real performance data, AI-driven analysis, and blockchain verification.",
    tagline: "Trade Football Players Like Stocks",
  },

  // ============================================================================
  // ESSENTIAL QUESTIONS - Getting Started & Core Features
  // ============================================================================

  gettingStarted: `To get started on Valor:

1. **Connect Your Wallet or Sign In**
   • Click "Log In" in the top right corner
   • Connect your Sui wallet (like Sui Wallet or Ethos)
   • OR sign in with Google if you don't have a wallet

2. **Get SUI Tokens**
   • You'll need SUI tokens to trade
   • Use the swap feature or deposit from an exchange

3. **Explore Players**
   • Browse players on the "Players" page
   • View AI scores and seasonal performance data
   • Check Early Season, Mid Season, and Current Season stats

4. **Buy Your First Shares**
   • Click on any player to see details
   • Enter the amount you want to buy
   • Confirm the transaction

5. **Track Your Portfolio**
   • View your holdings in the "Portfolio" page
   • Monitor your NFT shares and performance
   • Check your profit/loss in real-time

6. **Join Valor Pulse**
   • Vote on player predictions each week
   • Share your sentiment with the community
   • Help shape the trading conversation

It's that simple! 🚀`,

  whatIsValor: `Valor is a revolutionary fantasy football platform that lets you trade real football players like stocks.

**Core Features:**

📊 **Dynamic Pricing**
• Player values are determined by AI-powered performance analysis
• Market supply and demand affects prices (bonding curve)
• Weekly updates based on real match data

🎯 **Seasonal Data Tracking**
• Early Season (Matches 1-3): Initial performance baseline
• Mid Season (Matches 4-9): Form development
• Current Season (All Matches): Latest performance
• Track how player values evolved throughout the season

🗳️ **Valor Pulse - Community Sentiment**
• Vote YES/NO on weekly player predictions
• See real-time community sentiment
• Influence the trading conversation

🖼️ **NFT Share Certificates**
• Every purchase mints a unique NFT
• NFTs represent your ownership of shares
• View your collection in your portfolio

⛓️ **Blockchain Verified**
• All transactions secured on Sui blockchain
• Performance data stored on Walrus (decentralized storage)
• Complete transparency and verification

You profit when your players perform well and their value increases! 📈`,

  buyFirstShare: `To buy your first player share:

1. **Navigate to Players**
   • Go to the "Players" page
   • Browse all available players

2. **Choose Your Season View**
   • Select Early, Mid, or Current Season
   • View how prices evolved over time
   • Note: All purchases use Current Season price

3. **Select a Player**
   • Click on any player card
   • View detailed stats and AI analysis

4. **Enter Quantity**
   • In the Buy/Sell widget, enter share amount
   • See total cost calculated in real-time

5. **Complete Purchase**
   • Click "Buy Shares"
   • Approve the transaction
   • Receive your NFT share certificate!

6. **View Your NFT**
   • Check your Portfolio
   • See your new NFT with purchase details
   • Track its current value

💡 **Important:** You need SUI tokens in your wallet to trade. If you don't have enough, use the "Swap now" feature! 💰`,

  weeklyUpdate: `Every Monday, Valor's AI system updates player data:

**The Weekly Process:**

1️⃣ **Data Collection**
   • Fetches real match data from football APIs
   • Collects goals, assists, ratings, minutes played
   • Analyzes defensive stats for defenders/goalkeepers

2️⃣ **AI Analysis**
   • GPT-4 analyzes player performance
   • Generates performance scores (0-100)
   • Determines trend: Improving/Stable/Declining

3️⃣ **Seasonal Updates**
   • Updates Mid Season values (after match 3)
   • Updates Current Season values weekly
   • Historical data preserved for comparison

4️⃣ **Blockchain Storage**
   • All data uploaded to Walrus decentralized storage
   • Smart contracts updated on-chain
   • Cryptographic proof generated

5️⃣ **Price Adjustments**
   • Base values update based on AI scores
   • Market prices adjust via bonding curve
   • Trading continues with new values

**Seasonal Periods:**
• Early Season: Matches 1-3 (Initial baseline)
• Mid Season: Matches 4-9 (Form development)  
• Current Season: All matches (Live performance)

Player prices adjust based on BOTH AI scores AND market demand! 🔄`,

  // ============================================================================
  // NEW FEATURES - Valor Pulse & Seasonal Data
  // ============================================================================

  valorPulse: `Valor Pulse is our community sentiment voting feature! 🗳️

**How It Works:**

1️⃣ **Weekly Voting Rounds**
   • New round starts each week
   • Vote on specific player predictions
   • Example: "Will Haaland score 2+ goals this week?"

2️⃣ **Cast Your Vote**
   • Go to the "Pulse" page
   • Choose YES or NO for each player
   • Submit your prediction

3️⃣ **See Community Sentiment**
   • View real-time vote percentages
   • Check if community is BULLISH or BEARISH
   • See total vote counts

4️⃣ **Vote Receipt**
   • You receive a blockchain receipt (NFT)
   • Proves you participated this week
   • Can only vote once per player per week

5️⃣ **Results**
   • Voting closes at end of week
   • See final community predictions
   • Compare with actual performance

**Why Vote?**
• Shape the trading conversation
• Share your football knowledge
• See what other traders think
• Be part of the Valor community

No rewards - just pure community sentiment! 💪`,

  seasonalData: `Valor tracks player performance across three seasonal periods:

**The Three Seasons:**

📅 **Early Season (Matches 1-3)**
   • Initial performance baseline
   • Players finding their form
   • Lower prices, higher potential
   • Historical data - view only

📊 **Mid Season (Matches 4-9)**
   • Form development phase
   • More reliable data points
   • Prices adjust to performance trends
   • Historical data - view only

⚡ **Current Season (All Matches)**
   • Latest live performance
   • Most accurate valuation
   • THIS IS THE ACTIVE TRADING PRICE
   • Used for all buy/sell transactions

**Why This Matters:**

🔍 **Track Price Evolution**
• See how player values changed over time
• Identify when form improved or declined
• Understand valuation history

📈 **Smart Trading Decisions**
• Compare early promise vs current delivery
• Spot trends before others
• Better entry/exit timing

💡 **Important:**
When viewing player details, you can switch between seasons to see historical data, BUT all trading happens at Current Season prices. The seasonal view helps you understand the journey, not change the trading price!

Example: You view "Mid Season" to see Haaland had 8 goals by match 6, but if you buy shares, you pay the Current Season price (reflects all 15 matches played).`,

  // ============================================================================
  // PORTFOLIO & NFT FEATURES
  // ============================================================================

  portfolioView: `Your portfolio is your command center! 📊

**What You'll See:**

💰 **Wallet Assets Section**
   • Your SUI balance for trading
   • All your Player Shares NFTs
   • Each NFT shows:
     - Player name and club
     - Number of shares owned
     - Current price per share
     - Total value
     - Profit/Loss %

📈 **Portfolio Summary**
   • Total portfolio value in SUI
   • Overall profit/loss percentage
   • Number of positions held
   • Total amount invested

📊 **Positions Table**
   • Detailed view of each holding
   • Entry price vs current price
   • Quick links to trade more
   • Sell directly from portfolio

**How to Access:**
1. Click "Portfolio" in the navigation
2. Make sure your wallet is connected
3. View all your assets and performance

**Selling from Portfolio:**
• Enter quantity you want to sell
• Click "Sell" button
• Confirm transaction
• Receive SUI instantly

Your portfolio updates in real-time as prices change! 🔄`,

  nftShares: `When you buy player shares, you receive an NFT! 🖼️

**What is the NFT?**
• A blockchain certificate of ownership
• Represents your shares of a specific player
• Stored in your wallet permanently
• Shows purchase details and current value

**NFT Details Include:**
✅ Player name and image
✅ Number of shares owned
✅ Purchase price per share
✅ Purchase timestamp
✅ Current market value

**Why NFTs?**
• Proof of ownership on blockchain
• Tradeable and transferable
• Visual representation of your holdings
• Can be viewed in any NFT marketplace

**How to View Your NFTs:**
1. Go to Portfolio page
2. Check "Player Shares NFTs" section
3. See all your holdings with images
4. Click any player to view details

Each NFT is unique to your purchase and shows the exact moment you bought those shares! 🎨`,

  googleLogin: `Don't have a crypto wallet? No problem! 🔐

**Sign In with Google:**

Instead of connecting a traditional crypto wallet, you can use your Google account to access Valor.

**How It Works:**
1. Click "Log In"
2. Select "Sign in with Google"
3. Authenticate with your Google account
4. Start trading immediately!

**Benefits:**
✅ No need to download wallet extensions
✅ Familiar login experience
✅ Sign transactions with Google
✅ Full platform access
✅ Secure and easy

You can always switch to a traditional wallet later if you want more control over your assets.

Get started in seconds! ⚡`,

  // ============================================================================
  // EXISTING FEATURES - Updated
  // ============================================================================

  depositSwap: `To get SUI tokens for trading:

**Option 1: Swap Other Tokens**
1. Click "Not enough SUI? Swap now" on any player page
2. Opens the Swap Modal
3. Exchange other tokens (USDC, USDT, etc.) for SUI
4. Your balance updates automatically ✅

**Option 2: Deposit from Exchange**
1. Buy SUI on any exchange (Binance, OKX, etc.)
2. Withdraw to your Sui wallet address
3. Wait for confirmation
4. Start trading!

Once you have SUI, you're ready to buy player shares! 💰`,

  sellShare: `To sell a player share:

**Option 1: From Portfolio**
1. Go to your Portfolio page
2. Find the player in "Player Shares NFTs"
3. Enter quantity to sell
4. Click "Sell" button
5. Confirm transaction
6. Receive SUI instantly 💸

**Option 2: From Player Detail Page**
1. Click on any player you own
2. Use the Buy/Sell widget
3. Switch to "Sell" tab
4. Enter quantity
5. Click "Sell Shares"
6. Confirm and receive SUI

**Important Notes:**
• You can sell partial amounts
• Price is based on current market value
• If you sell all shares, NFT is burned
• If partial sale, remaining shares stay in NFT`,

  playerShares: `Player shares are tokenized ownership units! 📊

**How They Work:**

🎯 **Fractional Ownership**
• Each share = fractional ownership of player value
• Buy any amount you want
• No minimum (except transaction fees)

💰 **Bonding Curve Pricing**
• Price increases as more shares are bought
• Formula: base_value × (1 + circulating/total)
• More demand = higher price
• Less demand = lower price

📈 **Value Appreciation**
• Profit from price increases
• Two factors drive price:
  1. AI score improvements (base value ↑)
  2. Market demand (more buyers ↑)

🔄 **Buy & Sell Anytime**
• Trade 24/7
• Instant liquidity
• No lock-up periods
• Market always open

🖼️ **NFT Representation**
• Every purchase = NFT minted
• NFT shows your shares
• Tradeable on secondary markets

Example: Haaland has 1M total shares. If 500K are bought (50% utilization), price is 50% above base value. If he scores a hat-trick, AI updates base value +20%, and demand increases price another 30% = +50% total gain! 🚀`,

  dataSource: `Player data comes from trusted sources:

📡 **API-Football**
• Official football statistics API
• Real match data from all major leagues
• Updated within hours of match completion
• Includes: goals, assists, minutes, ratings

⚡ **Real-Time Updates**
• Data collected after every match week
• Weekly AI analysis runs Monday
• Smart contracts updated on-chain
• Historical data preserved

🔐 **Walrus Storage**
• All raw data uploaded to Walrus
• Decentralized storage network
• Permanent and tamper-proof
• Cryptographic verification

📊 **What We Track:**
• Goals scored
• Assists provided
• Minutes played
• Match ratings (0-10)
• Clean sheets (defenders/goalkeepers)
• Plus more positional stats

All data is verifiable on-chain! ✅`,

  aiScoring: `Our AI scoring system uses GPT-4! 🤖

**How It Works:**

1️⃣ **Data Collection**
   • Gathers 10+ performance metrics
   • Analyzes seasonal progression
   • Considers position-specific expectations

2️⃣ **Position-Adjusted Analysis**
   • Forwards: Goals, assists, shots
   • Midfielders: Assists, passes, ratings
   • Defenders: Clean sheets, tackles, interceptions
   • Goalkeepers: Saves, clean sheets, distribution

3️⃣ **Trend Detection**
   • Compares Early → Mid → Current performance
   • Identifies improving/stable/declining trends
   • Weights recent form more heavily

4️⃣ **GPT-4 Evaluation**
   • Natural language insights
   • Context-aware analysis
   • Confidence scoring (0-100%)
   • Performance prediction

5️⃣ **Score Output (0-100)**
   • 90-100: Elite performance
   • 80-89: Excellent
   • 70-79: Good
   • 60-69: Average
   • Below 60: Poor form

Updated weekly with full transparency! 📈`,

  dataStorage: `Performance data lives on Walrus! 🔐

**What is Walrus?**
• Sui's decentralized storage network
• Like IPFS but built for Sui
• Permanent data retention
• Censorship-resistant

**What Gets Stored:**
✅ Raw match statistics
✅ AI performance analysis
✅ Historical seasonal data
✅ Weekly update reports
✅ Player metadata

**How It Works:**
1. Data uploaded to Walrus network
2. Receives unique Blob ID (proof)
3. Blob ID stored in smart contract
4. Anyone can verify using Blob ID

**Why Walrus?**
• Decentralized (no single point of failure)
• Permanent (can't be deleted)
• Verifiable (cryptographic proofs)
• Affordable (cheaper than on-chain storage)
• Sui-native (seamless integration)

Every player detail page shows their Walrus Proof ID! 🛡️`,

  priceCalculation: `Player prices use a hybrid bonding curve model! 📐

**The Formula:**
\`actual_price = base_value × (1 + circulating_shares / total_shares)\`

**Components:**

1️⃣ **Base Value**
   • Set by AI performance score
   • Updated weekly
   • Reflects football ability
   • Different for each season

2️⃣ **Circulating Shares**
   • Number of shares already bought
   • Increases with purchases
   • Decreases with sales

3️⃣ **Market Multiplier**
   • Based on utilization %
   • More shares sold = higher multiplier
   • Creates organic price discovery

**Example:**
• Base value: 1.0 SUI
• Total shares: 1,000
• Circulating: 500 (50% utilization)
• Price = 1.0 × (1 + 500/1000) = 1.5 SUI

**Price Changes When:**
📈 AI updates base value (weekly)
📈 More people buy shares (demand)
📉 People sell shares (supply)

Real-time price discovery! ⚡`,

  injuryHandling: `If a player gets injured, here's what happens:

**During Injury:**
📉 AI score decreases (0 minutes played)
📉 Base value adjusted downward weekly
📉 Market may panic sell → price drops further
📊 Severity matters (1 week vs 2 months)

**Weekly Updates:**
• Missed matches = lower performance score
• 0 goals/assists/minutes recorded
• AI factors in games missed
• Historical data preserved

**Recovery Phase:**
📈 Player returns to matches
📈 AI score gradually improves
📈 Base value increases again
📈 Market confidence returns

**Trading Strategy:**
💡 Long injuries = bigger drops
💡 Minor injuries = quick recovery
💡 Some traders buy the dip
💡 Others wait for return confirmation

All changes are transparent and verifiable on Walrus! 🏥`,

  aiModelDetails: `Our AI model combines data analysis with GPT-4! 🧠

**The Process:**

1️⃣ **Data Preparation**
   • Collect raw stats from API-Football
   • Normalize by position and league
   • Calculate season averages
   • Generate trend data

2️⃣ **Performance Scoring**
   • Weight goals, assists, ratings by position
   • Apply recency bias (recent matches matter more)
   • Compare to historical performance
   • Calculate 0-100 score

3️⃣ **GPT-4 Analysis**
   • Sends structured data to GPT-4
   • Asks for performance evaluation
   • Generates natural language insights
   • Predicts 2-3 week trend

4️⃣ **Confidence Rating**
   • Model outputs confidence (0-100%)
   • Based on data quality and sample size
   • More matches = higher confidence

5️⃣ **Storage & Verification**
   • Results uploaded to Walrus
   • Blob ID stored on-chain
   • Fully auditable and transparent

Runs automatically every Monday! ⚡`,

  weeklyAnalysis: `Weekly AI analysis includes comprehensive insights:

📊 **Performance Score (0-100)**
• Overall evaluation of player performance
• Position-adjusted metrics
• Trend-aware calculation

📈 **Trend Prediction**
• Improving: Form is getting better
• Stable: Consistent performance  
• Declining: Form is dropping

🎯 **Detailed Reasoning**
• Why the score was assigned
• Key performance factors
• Standout moments
• Areas of concern

⚡ **Key Performance Highlights**
• 3-5 specific achievements
• Goals, assists, ratings
• Defensive contributions
• Match-winning moments

🔮 **2-3 Week Prediction**
• Expected short-term performance
• Upcoming fixtures considered
• Form trajectory analyzed

📝 **Natural Language Summary**
• Easy-to-read analysis
• Written by GPT-4
• Trader-friendly insights

💯 **Confidence Level**
• How certain is the AI?
• Based on data quality
• Sample size matters

Access by clicking "AI Analysis" on any player card! 🤖`,

  walrusUsage: `Valor uses Walrus for decentralized storage! 🔒

**Why Walrus?**

✅ **Decentralization**
• No single server controls data
• Network of storage nodes
• Redundancy and reliability

✅ **Permanence**
• Data can't be deleted
• Stored forever on network
• Historical records preserved

✅ **Verification**
• Cryptographic proofs (Blob IDs)
• Anyone can verify data
• Complete transparency

✅ **Cost-Effective**
• Cheaper than on-chain storage
• Scales better for large data
• Perfect for AI reports

✅ **Sui Integration**
• Built specifically for Sui
• Seamless smart contract integration
• Native compatibility

**What Lives on Walrus:**
• Match statistics
• AI analysis reports
• Performance history
• Seasonal data
• Verification proofs

Every player has a Walrus Proof ID you can check! 🛡️`,

  dataVerification: `Verify all data yourself! ✅

**The Verification Process:**

1️⃣ **Data Upload to Walrus**
   • Weekly stats uploaded
   • Receives unique Blob ID
   • Permanently stored

2️⃣ **Blob ID Stored On-Chain**
   • Smart contract records Blob ID
   • Immutable blockchain record
   • Public and transparent

3️⃣ **Fetch & Compare**
   • Anyone can fetch blob using ID
   • Compare with on-chain record
   • Verify cryptographic hash

4️⃣ **Check Player Pages**
   • Every player shows "Walrus Verified Data"
   • Click to see Blob ID
   • Verify independently

**How to Verify:**
1. Go to any player detail page
2. Find "Walrus Verified Data" section
3. Copy the Blob ID
4. Use Walrus explorer to fetch data
5. Compare hash with on-chain record

**What This Proves:**
✅ Data hasn't been tampered with
✅ Performance scores are authentic
✅ Historical records are accurate
✅ AI analysis is legitimate

Complete transparency and trust! 🔐`,

  pulseVoting: `Cast your vote on Valor Pulse! 🗳️

**How to Vote:**

1️⃣ **Navigate to Pulse Page**
   • Click "Pulse" in the navigation
   • See this week's active players

2️⃣ **Read the Prediction**
   • Each player has a specific question
   • Example: "Will Salah score 2+ goals?"
   • Voting period shown with countdown

3️⃣ **Cast Your Vote**
   • Click YES if you believe it will happen
   • Click NO if you think it won't
   • Confirm the transaction

4️⃣ **Receive Vote Receipt**
   • You get a blockchain receipt (NFT)
   • Proves you voted this week
   • Stored in your wallet

5️⃣ **View Results**
   • See real-time vote percentages
   • Check community sentiment
   • 🔥 BULLISH or 📉 BEARISH indicators

**Rules:**
• One vote per player per week
• Cannot change vote after submission
• Voting closes at week end
• Free to participate

**Why Participate?**
Share your football knowledge and see what the community thinks! 💪`,
};
