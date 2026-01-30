export const VALOR_KNOWLEDGE = {
  platform: {
    name: "Valor",
    description:
      "A fully on-chain football stock market where players are traded as NFT-backed shares, priced by hardware-verified AI, with encrypted premium insights and instant liquidity.",
    tagline:
      "Trade Football Players Like Stocks - Provably Fair, Fully On-Chain",
  },

  gettingStarted: `To get started on Valor:

1. **Sign In (No Wallet Required!)**
   • Click "Log In" in the top right corner
   • Sign in with Google via zkLogin (no wallet setup needed!)
   • OR connect your Sui wallet if you prefer
   • Your account is created instantly - fully non-custodial

2. **Get SUI Tokens**
   • You'll need SUI tokens to trade
   • Use the built-in swap feature on any player page
   • OR deposit from an exchange

3. **Explore Players**
   • Browse 8 active players on the "Players" page
   • View AI scores (verified by Nautilus hardware attestation)
   • Check Early Season, Mid Season, and Current Season performance
   • See Walrus-verified data and Nautilus signatures

4. **Buy Your First Shares**
   • Click on any player to see details
   • Enter the amount you want to buy
   • NFT is minted instantly - you own real shares!
   • Earn +3 Pulse Points per share purchased

5. **Unlock Premium AI Insights**
   • Public data is free for everyone
   • Premium insights are encrypted with Seal
   • Unlock by owning NFT shares OR spending 10 Pulse Points
   • See detailed predictions, key factors, and reasoning

6. **Track Your Portfolio**
   • View all your holdings in the "Portfolio" page
   • See your Pulse Points balance
   • Monitor profit/loss in real-time
   • Your SuiNS name appears on the leaderboard!

7. **Join Valor Pulse**
   • Vote on weekly player predictions
   • Earn 1 point per vote, 5 points for correct predictions
   • Results stored permanently on Walrus
   • Climb the leaderboard!

It's that simple! 🚀`,

  whatIsValor: `Valor is a revolutionary on-chain football market with provable fairness.

**What Makes Valor Different:**

🔐 **Hardware-Verified AI Pricing**
• Player valuations run inside AWS Nitro Enclaves (Nautilus)
• AI analysis is cryptographically signed
• Smart contracts verify signatures before updating prices
• Even Valor admins can't manipulate pricing - it's mathematically provable

🎯 **Three-Season Tracking**
• Early Season (Matches 1-3): Initial baseline performance
• Mid Season (Matches 4-9): Form development
• Current Season (All Matches): Live performance
• View price evolution over time, but always trade at Current Season price

🔒 **Encrypted Premium Insights (Seal + Walrus)**
• Premium AI analysis encrypted with Seal
• Stored permanently on Walrus (decentralized storage)
• Only NFT holders or Pulse Points spenders can decrypt
• New content monetization model - no paywalls, just cryptography

🖼️ **NFT Share Ownership**
• Every purchase mints a unique NFT
• Represents your ownership of player shares
• Trade anytime with instant liquidity (bonding curve)
• Burn NFT when you sell all shares

⛓️ **Full Sui Stack Integration**
• zkLogin: Sign in with Google (no wallet setup)
• SuiNS: Human-readable names on leaderboards
• Walrus: Permanent decentralized storage
• Seal: Cryptographic access control
• Nautilus: Verifiable AI computation
• Sui Move: Trading logic and bonding curves

💰 **Pulse Points Economy**
• Earn points by voting and trading
• Spend 10 points to unlock premium AI without buying NFTs
• Climb the leaderboard with your SuiNS name
• All voting history stored on Walrus

You profit when players perform well and their value increases! 📈`,

  buyFirstShare: `To buy your first player share:

1. **Navigate to Players**
   • Go to the "Players" page
   • Browse all 8 available players

2. **Choose Season View (Optional)**
   • Toggle between Early, Mid, or Current Season
   • View how prices evolved over time
   • **Important:** All purchases happen at Current Season price

3. **Select a Player**
   • Click on any player card
   • View detailed stats, AI analysis, and Nautilus signature

4. **See Premium AI (If You Want)**
   • Public AI data is always visible (score, trend, form, summary)
   • Premium insights are locked 🔒
   • You'll need NFT shares OR 10 Pulse Points to unlock

5. **Enter Quantity**
   • In the Buy/Sell widget, enter share amount
   • See total cost calculated in real-time
   • Price includes bonding curve (more demand = higher price)

6. **Complete Purchase**
   • Click "Buy Shares"
   • Sign with Google (zkLogin) or wallet
   • NFT minted instantly!
   • +3 Pulse Points earned per share

7. **View Your NFT**
   • Check your Portfolio
   • See your new NFT with purchase details
   • Track its current value
   • Now you can decrypt premium AI insights!

💡 **Not enough SUI?** Click "Swap now" on any player page! 💰`,

  weeklyUpdate: `Every week, Valor's AI system updates player data using Nautilus:

**The Nautilus-Verified Process:**

1️⃣ **Data Collection Inside Secure Enclave**
   • Nautilus enclave (AWS Nitro) fetches real match data
   • Collects goals, assists, ratings, minutes from AllSportsAPI
   • Runs entirely inside hardware-secured environment
   • NO ONE can access or manipulate this process

2️⃣ **AI Analysis (Gemini + Google Search)**
   • Gemini AI runs INSIDE the enclave
   • Uses Google Search to check injuries, team news, form
   • Analyzes performance with position-specific metrics
   • Generates scores (0-100), trends, predictions

3️⃣ **Cryptographic Signing**
   • Enclave signs the output with its private key
   • Creates hardware attestation signature
   • Signature proves: computation happened in secure environment
   • Impossible to forge - even by Valor admins

4️⃣ **On-Chain Verification**
   • Smart contract receives AI output + signature
   • Verifies signature against enclave public key
   • ONLY updates price if signature is valid
   • Signature stored on-chain (visible on SuiScan)

5️⃣ **Seal Encryption + Walrus Storage**
   • Premium AI fields encrypted with Seal
   • Full data blob uploaded to Walrus
   • Blob ID stored in smart contract
   • Nautilus signature stored separately for transparency

6️⃣ **Price Adjustments**
   • Season-specific base values update
   • Early Season: Set once during registration
   • Mid Season: Updated after match 3
   • Current Season: Updated weekly
   • Market prices adjust via bonding curve

**Seasonal Periods:**
• Early Season: Matches 1-3 (Initial baseline - view only)
• Mid Season: Matches 4-9 (Form development - view only)  
• Current Season: All matches (ACTIVE TRADING PRICE)

**Why This Matters:**
Player prices are PROVABLY FAIR. You can verify Nautilus signatures on every player's page. Even Valor can't manipulate the AI! 🔒`,

  valorPulse: `Valor Pulse is our community prediction and points system! 🗳️

**How It Works:**

1️⃣ **Weekly Prediction Rounds**
   • Vote on specific player predictions
   • Example: "Will Haaland score 3+ goals this week?"
   • Voting period shown with countdown

2️⃣ **Cast Your Vote**
   • Go to the "Pulse" page
   • Choose YES or NO for each player
   • Transaction records your vote on-chain

3️⃣ **Earn Pulse Points**
   • +1 point just for voting
   • +5 points if your prediction is CORRECT
   • Points stored in your on-chain Points Balance

4️⃣ **See Community Sentiment**
   • View real-time vote percentages
   • Check if community is BULLISH or BEARISH
   • See total vote counts

5️⃣ **Results Stored on Walrus**
   • All votes uploaded to Walrus after week ends
   • Permanent record of predictions
   • Blob ID stored on-chain for verification

6️⃣ **Spend Your Points**
   • 10 points = unlock premium AI insights (no NFT needed!)
   • Future: Custom badges, boosted listings, more perks

**Additional Ways to Earn Points:**
• Buy NFT shares: +3 points per share
• Correct predictions: +5 points each
• Achievement milestones: bonus points
• Voting streaks: bonus points

**Why Participate?**
• Build your reputation on the leaderboard (SuiNS name displayed!)
• Unlock premium AI without buying NFTs
• Share your football knowledge
• See what other traders think
• Create a permanent prediction track record

Pulse Points align incentives around ACCURACY, not hype! 💪`,

  seasonalData: `Valor tracks player performance across three seasonal periods:

**The Three Seasons:**

📅 **Early Season (Matches 1-3)**
   • Initial performance baseline
   • Set once during player registration
   • Players finding their rhythm
   • Used for historical comparison
   • **VIEW ONLY** - not for trading

📊 **Mid Season (Matches 4-9)**
   • Form development phase
   • Updated once after match 3 completes
   • More reliable data (larger sample size)
   • Shows trend development
   • **VIEW ONLY** - not for trading

⚡ **Current Season (All Matches)**
   • Latest live performance
   • Updated every week
   • **THIS IS THE ACTIVE TRADING PRICE**
   • Used for all buy/sell transactions
   • Most accurate valuation

**How Season Data is Stored:**

🔐 **Separate Walrus Blobs:**
• early_season_walrus_blob_id
• mid_season_walrus_blob_id  
• current_season_walrus_blob_id

🔒 **Separate Nautilus Signatures:**
• early_season_nautilus_signature
• mid_season_nautilus_signature
• current_season_nautilus_signature

Each season has its own verified AI analysis and cryptographic proof!

**Why This Matters:**

🔍 **Track Price Evolution**
• See how player values changed over time
• Identify when form improved or declined
• Understand the valuation journey
• Compare early potential vs current delivery

📈 **Make Smarter Trades**
• Spot trends before others
• See if a player is improving or declining
• Better entry/exit timing
• Historical context helps decision-making

💡 **Important:**
You can SWITCH between seasons on player detail pages to view historical data, BUT all trading happens at Current Season prices. The seasonal view helps you understand performance progression - it doesn't change the trading price.

**Example:** 
View "Mid Season" to see Haaland had 8 goals by match 6, but if you buy shares NOW, you pay the Current Season price (reflects all 23 matches played).

Each season's data is permanently stored on Walrus with its own Nautilus signature for verification! ✅`,

  portfolioView: `Your portfolio is your trading dashboard! 📊

**What You'll See:**

💰 **Wallet Balance**
   • Your SUI balance for trading
   • Pulse Points balance (earn by voting and trading)
   • Quick access to swap feature

📊 **Player Shares NFTs**
   • All your positions in one place
   • Each NFT shows:
     - Player name, image, and club
     - Number of shares owned
     - Current price per share
     - Total position value
     - Purchase details

💡 **Your Stats**
   • Total portfolio value in SUI
   • Current Pulse Points balance
   • Lifetime Points earned
   • Votes cast
   • Correct predictions count
   • NFT shares owned

🏆 **Leaderboard Position**
   • See your rank (if you have a SuiNS name)
   • Compare with other traders
   • Track your reputation

**How to Access:**
1. Click "Portfolio" in the navigation
2. Make sure you're signed in (Google or wallet)
3. View all your assets and stats
4. Your SuiNS name appears if you have one!

**Selling from Portfolio:**
• Click on any player NFT
• Go to player detail page
• Use the Buy/Sell widget
• Enter quantity to sell
• Receive SUI instantly

**NFT Behavior:**
• Buying shares: NFT is minted or updated
• Selling partial shares: NFT keeps remaining shares
• Selling all shares: NFT is burned
• Each NFT is unique to your purchases

Your portfolio updates in real-time as prices change! 🔄`,

  nftShares: `When you buy player shares, you receive an NFT! 🖼️

**What is the NFT?**
• A blockchain certificate of ownership
• Represents your shares of a specific player
• Stored in your wallet permanently (until you sell)
• Shows purchase details and current value
• ALSO: Key to unlocking premium AI insights!

**NFT Details Include:**
✅ Player name and image
✅ Number of shares owned
✅ Player ID (on-chain reference)
✅ Unique NFT ID
✅ Stored in NFT Registry contract

**Why NFTs?**
• Proof of ownership on blockchain
• Enable Seal decryption (premium AI access)
• Tradeable and transferable
• Visual representation of your holdings
• Can be viewed in any NFT marketplace

**How NFT Ownership Works:**

**Buying Shares:**
1. First purchase → NFT is minted
2. Additional purchases → existing NFT updated (shares added)
3. Each player has ONE NFT per user

**Selling Shares:**
1. Sell partial amount → NFT keeps remaining shares
2. Sell ALL shares → NFT is burned (removed)

**Premium AI Unlock:**
The smart contract checks: "Does this user own an NFT for this player?"
If YES → Seal allows decryption of premium insights
If NO → premium stays encrypted (or spend 10 Pulse Points)

**How to View Your NFTs:**
1. Go to Portfolio page
2. Check "Player Shares NFTs" section
3. See all your holdings with images
4. Click any player to view details and trade

Each NFT is your key to both ownership AND premium content! 🎨`,

  googleLogin: `Sign in with Google - no crypto wallet needed! 🔐

**Powered by zkLogin:**

Valor uses Sui's zkLogin technology, allowing you to sign in with your Google account instead of managing a crypto wallet.

**How It Works:**
1. Click "Log In"
2. Select "Sign in with Google"
3. Authenticate with your Google account
4. zkLogin creates a non-custodial Sui account for you
5. Start trading immediately!

**Benefits:**
✅ No wallet extensions to download
✅ No seed phrases to remember
✅ Familiar Google login experience
✅ Sign transactions easily
✅ Full platform access
✅ Your account is still non-custodial (you control it)
✅ Secure and easy

**What is zkLogin?**
• Zero-knowledge proof technology
• Your Google OAuth token creates a Sui address
• Private key derived from your Google login
• Only YOU can access your account
• Valor never sees your private keys

**Important:**
• Your account is tied to your Google account
• Recovery uses Google account (no seed phrase needed)
• You can always switch to a traditional wallet later
• All your assets are on-chain (truly yours)

**Can I Still Use a Regular Wallet?**
Yes! You can connect traditional Sui wallets like:
• Sui Wallet
• Ethos Wallet
• Suiet
• Or any Sui-compatible wallet

zkLogin makes Valor accessible to EVERYONE - not just crypto users! ⚡`,

  depositSwap: `To get SUI tokens for trading:

**Option 1: Built-in Swap (Easiest!)**
1. Click "Not enough SUI? Swap now" on any player page
2. Opens the Swap Modal
3. Select token to swap (USDC, USDT, etc.)
4. Enter amount
5. Swap for SUI instantly
6. Start trading! ✅

**Option 2: Deposit from Exchange**
1. Buy SUI on any exchange (Binance, OKX, KuCoin, etc.)
2. Withdraw to your Sui wallet address
3. Wait for confirmation (usually 1-2 minutes)
4. Your balance updates automatically
5. Ready to trade!

**How Much SUI Do I Need?**
• Player shares start around 0.001-0.02 SUI each
• You can start trading with just 0.1 SUI (~$0.10)
• Gas fees are very low on Sui (fractions of a cent)

**Pro Tip:**
Keep a small SUI balance in your wallet for gas fees, even if you swap other tokens for your main trading capital.

Once you have SUI, you're ready to buy player shares! 💰`,

  sellShare: `To sell a player share:

**From Player Detail Page (Recommended):**
1. Go to any player page
2. Use the Buy/Sell widget on the right
3. Switch to "Sell" tab
4. Enter quantity to sell
5. See total SUI you'll receive
6. Click "Sell Shares"
7. Confirm transaction
8. SUI credited to your wallet instantly! 💸

**From Portfolio:**
1. Go to your Portfolio page
2. Click on any player NFT you own
3. Redirects to player detail page
4. Follow steps above

**Important Notes:**

**Partial Sales:**
• You can sell any amount (don't have to sell all)
• Your NFT keeps the remaining shares
• NFT updates automatically with new share count

**Full Sales:**
• If you sell ALL shares, the NFT is BURNED
• NFT is removed from your wallet
• You lose premium AI access for that player (unless you buy again)

**Pricing:**
• Price is based on current market value (bonding curve)
• More circulating shares = higher price
• Less circulating shares = lower price
• Price updates in real-time

**Example:**
You own 50 shares of Haaland
Current price: 0.02 SUI per share

Sell 20 shares → Keep NFT with 30 shares remaining
Sell 50 shares → NFT burned, receive ~1.0 SUI

Selling is instant - no waiting for buyers! 🚀`,

  playerShares: `Player shares are fractional NFT-backed ownership! 📊

**How They Work:**

🎯 **NFT-Backed Shares**
• Each share = fractional ownership
• Shares are tracked in your NFT
• Buy any amount you want (no minimum except gas)
• One NFT per player per user

💰 **Bonding Curve Pricing**
• Price increases as more shares are bought
• Formula: \`price = base_value × (1 + circulating/total)\`
• More demand = higher price
• Instant buy/sell liquidity (no order books)

📈 **Value Drivers**

**1. AI Performance Score (Base Value)**
• Updated weekly by Nautilus-verified AI
• Scores 0-100 based on real match data
• Higher score → higher base value

**2. Market Demand (Multiplier)**
• More people buying → price increases
• More people selling → price decreases
• Supply and demand work in real-time

🔄 **Trade Anytime**
• Buy 24/7
• Sell 24/7
• No lock-up periods
• No waiting for order matches
• Instant liquidity via bonding curve

🖼️ **NFT Representation**
• Every purchase mints or updates your NFT
• NFT shows total shares owned
• Burn NFT when all shares sold
• NFT unlocks premium AI insights (Seal)

**Example:**

**Starting State:**
• Haaland base value: 0.01 SUI
• Total shares: 1,000,000
• Circulating: 0 (no one bought yet)
• Price: 0.01 SUI

**After 500,000 Shares Sold (50% utilization):**
• Price = 0.01 × (1 + 500,000/1,000,000)
• Price = 0.01 × 1.5 = 0.015 SUI

**After AI Update (+20% base value):**
• New base: 0.012 SUI
• Price = 0.012 × 1.5 = 0.018 SUI

**After More Buying (700,000 circulating):**
• Price = 0.012 × (1 + 700,000/1,000,000)
• Price = 0.012 × 1.7 = 0.0204 SUI

You profit from BOTH AI improvements AND market demand! 🚀`,

  dataSource: `Player data comes from AllSportsAPI and is verified by Nautilus:

📡 **AllSportsAPI**
• Professional football statistics provider
• Real match data from all major leagues
• Updated within hours of match completion
• Includes: goals, assists, minutes, ratings, team performance

🔐 **Nautilus Verification Process**

**Step 1: Data Fetching (Inside Enclave)**
• Nautilus enclave runs on AWS Nitro (hardware-secured)
• Enclave fetches data from AllSportsAPI
• NO external access to this process

**Step 2: AI Analysis (Inside Enclave)**
• Gemini AI processes data INSIDE the enclave
• Uses Google Search for injury/team news
• Position-specific evaluation
• Generates performance score (0-100)

**Step 3: Cryptographic Signing**
• Enclave signs output with private key
• Creates hardware attestation signature
• Signature = proof of computation integrity

**Step 4: On-Chain Verification**
• Smart contract receives AI output + signature
• Verifies signature against enclave public key
• ONLY updates if signature is valid
• Signature stored on-chain (visible to everyone)

⚡ **Update Frequency**
• Data collected after every match week
• AI analysis runs weekly (usually Monday)
• Smart contracts updated on-chain
• Historical data preserved on Walrus

📊 **What We Track:**

**For All Players:**
• Goals scored
• Assists provided
• Minutes played
• Match ratings (0-10)

**Position-Specific:**
• Attackers: Shots on target, conversion rate
• Midfielders: Key passes, pass completion
• Defenders: Tackles, interceptions, clean sheets
• Goalkeepers: Saves, save percentage, clean sheets

🛡️ **Verification**
• Every player page shows Nautilus signature
• Walrus Blob ID for full data
• Anyone can verify independently
• Complete transparency

All data is PROVABLY FAIR - you can verify it yourself! ✅`,

  aiScoring: `Our AI uses Gemini inside Nautilus for provable fairness! 🤖

**The Verified AI Process:**

1️⃣ **Hardware-Secured Environment**
   • AI runs inside AWS Nitro Enclave
   • Trusted Execution Environment (TEE)
   • Isolated from all external access
   • Even Valor admins can't interfere

2️⃣ **Data Collection**
   • Fetches 10+ performance metrics
   • Analyzes seasonal progression
   • Uses Google Search for current context (injuries, news)
   • Position-specific data weighting

3️⃣ **Position-Adjusted Analysis**
   • **Attackers:** Goals, shots, conversion rate (0.8 goals/90 = elite)
   • **Midfielders:** Assists, key passes, goal contributions
   • **Defenders:** Clean sheets, tackles, interceptions
   • **Goalkeepers:** Saves, save percentage, distribution

4️⃣ **Trend Detection**
   • Compares Early → Mid → Current performance
   • Identifies trends: Improving/Stable/Declining
   • Weights recent form more heavily
   • Form status: Excellent/Good/Average/Poor

5️⃣ **Gemini AI Evaluation**
   • Receives structured data
   • Generates natural language insights
   • Context-aware analysis (injuries, fixtures, team form)
   • Confidence scoring (0-100%)

6️⃣ **Cryptographic Signing**
   • Enclave signs AI output
   • Hardware attestation signature
   • Stored on-chain for verification
   • Impossible to forge

**Score Output (0-100):**
   • 90-100: Elite performance (world-class)
   • 80-89: Excellent (top-tier)
   • 70-79: Good (solid contributor)
   • 60-69: Average (functional)
   • Below 60: Poor form (struggling)

**Additional AI Outputs:**

**Public (Always Visible):**
• Performance score
• Trend (improving/stable/declining)
• Form status (excellent/good/average/poor)
• Short summary
• Confidence percentage

**Premium (Seal Encrypted):**
• Future predictions (2-3 week outlook)
• Key factors (3-5 specific insights)
• Detailed reasoning (full analysis)

**Why This Matters:**
The AI is PROVABLY FAIR. The Nautilus signature proves:
✅ AI ran inside secure enclave
✅ No manipulation by anyone
✅ Output is authentic
✅ Process is transparent

You can verify every signature yourself! 🔒`,

  dataStorage: `All performance data lives on Walrus! 🔐

**What is Walrus?**
• Sui's decentralized storage network
• Permanent data retention (can't be deleted)
• Redundant across multiple nodes
• Cryptographic verification via Blob IDs

**What Gets Stored on Walrus:**

✅ **Full Player Performance Blobs:**
• Player info (name, team, position)
• Season stats (goals, assists, minutes, matches)
• Public AI data (score, trend, form, summary)
• Encrypted premium AI data (Seal encrypted)
• Valuation info (base value in SUI and MIST)
• Timestamps and metadata

✅ **Pulse Voting Records:**
• Week number and date range
• Player predictions
• Individual votes (address, choice, timestamp)
• Aggregated results (yes %, no %, total votes)
• Complete vote history

✅ **Historical Data:**
• Early season blob
• Mid season blob
• Current season blob
• All seasonal progressions preserved

**How Walrus Integration Works:**

1️⃣ **Upload Process:**
   • AI analysis completed (via Nautilus)
   • Encrypted with Seal
   • Uploaded to Walrus network
   • Receives unique Blob ID

2️⃣ **On-Chain Storage:**
   • Blob ID stored in smart contract
   • Separate IDs for each season:
     - early_season_walrus_blob_id
     - mid_season_walrus_blob_id
     - current_season_walrus_blob_id

3️⃣ **Retrieval:**
   • Frontend fetches Blob ID from contract
   • Downloads data from Walrus using Blob ID
   • Public data displayed immediately
   • Premium data decrypted via Seal (if authorized)

**Why Walrus?**

✅ **Decentralization**
• No single server controls data
• Network of distributed storage nodes
• Redundancy and reliability

✅ **Permanence**
• Data can't be deleted
• Survives even if Valor shuts down
• Historical records preserved forever

✅ **Verification**
• Cryptographic proofs (Blob IDs)
• Anyone can verify data
• Complete transparency

✅ **Cost-Effective**
• Cheaper than pure on-chain storage
• Scales for large data (AI reports, voting)
• Perfect for sports analytics

✅ **Sui Native**
• Built specifically for Sui ecosystem
• Seamless smart contract integration
• Native compatibility with Move

**Where to See Walrus Data:**
• Every player detail page shows Blob ID
• Click to view verification details
• Historical season data includes separate Blob IDs
• Pulse voting results have dedicated Blob IDs

All Valor data is permanent and verifiable! 🛡️`,

  priceCalculation: `Player prices use a bonding curve + AI base value! 📐

**The Formula:**
\`\`\`
actual_price = base_value × (1 + circulating_shares / total_shares)
\`\`\`

**Components:**

1️⃣ **Base Value (AI-Driven)**
   • Set by Nautilus-verified AI performance score
   • Updated weekly (except Early Season - set once)
   • Reflects football ability and form
   • Different for each season period
   • Hardware-attested (can't be manipulated)

2️⃣ **Circulating Shares (Market-Driven)**
   • Number of shares already bought
   • Increases when users buy
   • Decreases when users sell
   • Real-time market activity

3️⃣ **Total Shares (Fixed Supply)**
   • Default: 1,000,000 per player
   • Set during player registration
   • Never changes

4️⃣ **Market Multiplier**
   • Based on utilization % (circulating / total)
   • More shares bought = higher multiplier
   • Creates organic price discovery
   • Instant liquidity (no order books)

**Example Calculation:**

**Starting Point:**
• Base value: 0.01 SUI
• Total shares: 1,000,000
• Circulating: 0
• Price = 0.01 × (1 + 0/1,000,000) = 0.01 SUI

**After 250,000 Shares Bought (25% utilization):**
• Price = 0.01 × (1 + 250,000/1,000,000)
• Price = 0.01 × 1.25 = 0.0125 SUI (+25%)

**After AI Update (base value +30%):**
• New base: 0.013 SUI
• Circulating still: 250,000
• Price = 0.013 × 1.25 = 0.01625 SUI (+62.5% from start!)

**After More Demand (500,000 circulating):**
• Price = 0.013 × (1 + 500,000/1,000,000)
• Price = 0.013 × 1.5 = 0.0195 SUI (+95% from start!)

**Price Changes When:**
📈 AI updates base value (weekly via Nautilus)
📈 More people buy shares (demand increases)
📉 People sell shares (supply increases)
📉 AI score decreases (base value drops)

**Why This Model?**

✅ **Instant Liquidity:**
• No waiting for order matches
• Always able to buy/sell
• Price adjusts automatically

✅ **Fair Price Discovery:**
• Mathematical formula (no manipulation)
• Supply and demand balance
• Transparent calculation

✅ **AI + Market Combo:**
• Base value = objective performance
• Multiplier = market sentiment
• Best of both worlds

✅ **Circuit Breakers:**
• Prevents >50% swings in one update
• Protects against manipulation
• Smart contract enforced

Real-time price discovery you can trust! ⚡`,

  injuryHandling: `If a player gets injured, here's what happens:

**Immediate Impact:**

📉 **Zero Match Performance:**
• 0 goals scored
• 0 assists
• 0 minutes played
• Match rating: N/A
• No contribution to team

**Weekly AI Update (Nautilus):**

🤖 **AI Recognizes Absence:**
• Gemini AI checks Google Search for injury news
• Detects: "Player X ruled out for 4 weeks"
• Factors injury into analysis
• Adjusts availability status
• Lowers performance expectations

📊 **Score Adjustment:**
• Performance score decreases
• Confidence rating drops
• Trend marked as "declining"
• Form status: "injured" or "poor"
• Season stats diluted (fewer matches played)

**Base Value Impact:**

📉 **Price Drops:**
• AI lowers base value (reflects 0 output)
• Severity matters: 1 week vs 3 months
• Longer injury = bigger drop
• Bonding curve may amplify (panic selling)

**Example:**
• Pre-injury: 85/100 score, 0.02 SUI base
• 6-week injury: 60/100 score, 0.012 SUI base (-40%)
• Market panic: More users sell → price drops further via bonding curve

**Recovery Phase:**

📈 **Player Returns:**
• Starts playing matches again
• Minutes, goals, assists accumulate
• AI recognizes return (Google Search)
• Performance score gradually improves

📈 **Base Value Increases:**
• Week 1 back: Partial recovery
• Week 2-3: Score normalizes
• Full form: Returns to pre-injury level (or better)

📈 **Market Confidence:**
• Early buyers may profit (bought the dip)
• Price recovers with performance
• May exceed pre-injury if form improves

**Trading Strategies:**

💡 **Short-term injury (1-2 weeks):**
• Minor drop
• Quick recovery
• Some traders buy the dip

💡 **Long-term injury (2+ months):**
• Significant drop
• Slow recovery
• Risky to hold
• Some cut losses and sell

💡 **Season-ending injury:**
• Massive drop
• Likely stays low
• Portfolio rebalancing recommended

**Transparency:**

🔍 **All Changes Verified:**
• Nautilus signature proves AI decision
• Walrus stores injury-adjusted data
• Historical record preserved
• You can see the exact week injury occurred

**Premium AI Insights:**

If you own shares (or spend 10 Pulse Points), premium AI might say:
• "Player ruled out 6 weeks with hamstring injury"
• "Expected return: early March"
• "Historical recovery: typically 2-3 weeks to regain form"
• "Recommendation: Monitor closely"

All changes are transparent and cryptographically verified! 🏥`,

  aiModelDetails: `Our AI combines Gemini + Nautilus for provable fairness! 🧠

**The Complete Process:**

**1️⃣ Secure Environment Setup**
   • Nautilus enclave runs on AWS Nitro
   • Trusted Execution Environment (hardware-secured)
   • Isolated from all external access
   • Private key stored in enclave (inaccessible)

**2️⃣ Data Collection (Inside Enclave)**
   • Fetch player stats from AllSportsAPI
   • Real match data: goals, assists, minutes, ratings
   • Team performance context
   • League standings

**3️⃣ Position-Specific Normalization**
   • **Attackers:** Goals, shots, conversion rate
   • **Midfielders:** Assists, key passes, goal contributions
   • **Defenders:** Clean sheets, tackles, interceptions
   • **Goalkeepers:** Saves, save %, distribution

**4️⃣ Seasonal Comparison**
   • Compare Early → Mid → Current performance
   • Calculate trends (improving/stable/declining)
   • Weight recent matches more heavily
   • Identify form patterns

**5️⃣ Gemini AI Analysis (Inside Enclave)**
   • Structured data sent to Gemini API
   • Uses Google Search for real-time context:
     - Injury reports
     - Team news
     - Tactical changes
     - Upcoming fixtures
   • Generates performance score (0-100)
   • Creates trend prediction
   • Writes natural language insights

**6️⃣ Value Calculation**

**For Early Season (matches 1-3):**
\`\`\`
baseline = position_baseline (0.08 for Attacker, 0.06 for Midfielder, etc.)
score_multiplier = 0.3 + (ai_score / 100)
performance_bonus = (goals × 0.008) + (assists × 0.004)
final_value = (baseline × score_multiplier + performance_bonus) × 0.85
\`\`\`
Early season gets 15% discount (uncertainty)

**For Mid/Current Season:**
\`\`\`
ai_multiplier = 1.0 + ((ai_score - 50) / 50) × 0.8
performance_delta = goal_improvement + assist_improvement
consistency_factor = matches_played_bonus
new_value = previous_value × ai_multiplier × performance_delta × consistency_factor
\`\`\`
Value adjusts based on improvement

**7️⃣ Cryptographic Signing**
   • Enclave signs output with private key
   • Signature includes:
     - Player ID
     - AI score
     - Base value recommendation
     - Timestamp
   • Creates hardware attestation

**8️⃣ Seal Encryption**
   • Public fields: score, trend, form, summary
   • Premium fields encrypted:
     - Prediction (2-3 week outlook)
     - Key factors (3-5 insights)
     - Reasoning (full analysis)
   • Encrypted with Seal
   • Only NFT holders can decrypt

**9️⃣ Walrus Storage**
   • Complete blob uploaded to Walrus
   • Includes encrypted premium data
   • Permanent decentralized storage
   • Blob ID returned

**🔟 On-Chain Verification & Update**
   • Smart contract receives:
     - Base value recommendation
     - AI score
     - Nautilus signature
     - Walrus Blob ID
   • Contract verifies signature
   • ONLY updates if signature valid
   • Stores signature on-chain (transparent)

**Output Structure:**

\`\`\`typescript
{
  // Public (always visible)
  performance_score: 87,
  performance_trend: "improving",
  form_status: "excellent",
  confidence: 92,
  short_summary: "Elite form with 20 goals...",
  
  // Premium (Seal encrypted)
  prediction: "Elite form continues. Expect 5+ goals next month...",
  key_factors: [
    "Clinical finishing: 0.8 goals per 90",
    "Team in excellent form",
    "Favorable upcoming fixtures",
    "Peak fitness"
  ],
  reasoning: "Player demonstrates world-class finishing..."
}
\`\`\`

**Why This Model is Revolutionary:**

✅ **Provably Fair:** Nautilus signature proves integrity
✅ **Transparent:** Anyone can verify computation
✅ **Automated:** Runs weekly without human intervention
✅ **Context-Aware:** Google Search adds real-time data
✅ **Monetized:** Premium content via Seal (no paywalls)

Runs automatically every Monday with full cryptographic verification! ⚡`,

  weeklyAnalysis: `Weekly AI analysis includes comprehensive insights:

**Public Data (Always Free):**

📊 **Performance Score (0-100)**
• Overall player evaluation
• Position-adjusted metrics
• Trend-aware calculation
• Updated weekly via Nautilus

📈 **Trend Prediction**
• **Improving:** Form is getting better
• **Stable:** Consistent performance  
• **Declining:** Form is dropping

🎯 **Form Status**
• **Excellent:** Top-tier performance
• **Good:** Solid contributor
• **Average:** Adequate
• **Poor:** Struggling

💯 **Confidence Level (0-100%)**
• How certain is the AI?
• Based on data quality
• Sample size matters
• More matches = higher confidence

📝 **Short Summary**
• 2-3 sentence overview
• Easy-to-read analysis
• Written by Gemini AI
• Trader-friendly insights

**Premium Data (Encrypted with Seal):**

🔮 **2-3 Week Prediction**
• Expected short-term performance
• Upcoming fixtures considered
• Form trajectory analyzed
• Example: "Elite form continues. Expect 5+ goals next month given favorable fixtures and current scoring rate."

🔑 **Key Performance Factors (3-5 insights)**
• Specific achievements and stats
• Tactical importance
• Team context
• Examples:
  - "Clinical finishing: 0.8 goals per 90 minutes"
  - "Team in excellent form: 5 wins in last 6"
  - "Favorable fixtures: 3 home games vs bottom-half teams"
  - "Peak fitness: Playing full 90 minutes consistently"

🧠 **Detailed Reasoning**
• Full AI analysis explanation
• Why the score was assigned
• Performance deep dive
• Standout moments
• Areas of concern
• Example: "Player demonstrates world-class finishing with xG overperformance of 1.8, indicating sustainable quality. Team's attacking style heavily favors continued output..."

**How to Access Premium Insights:**

1️⃣ **Own NFT Shares**
   • Buy any amount of player shares
   • NFT minted to your wallet
   • Automatically unlocks premium AI

2️⃣ **Spend 10 Pulse Points**
   • Don't own shares? Use points!
   • 10 points = decrypt premium for one player
   • Points earned via voting and trading

**Verification:**

🔒 **Walrus Blob ID**
• Every analysis stored on Walrus
• Blob ID visible on player page
• Anyone can verify data

🔐 **Nautilus Signature**
• Hardware attestation displayed
• Proves AI ran in secure enclave
• Impossible to fake
• Visible on SuiScan events

**Example Analysis:**

**Public (Free):**
• Score: 87/100
• Trend: Improving
• Form: Excellent
• Confidence: 92%
• Summary: "Exceptional form with 20 goals in 23 matches. Clinical finishing and consistent output."

**Premium (Locked 🔒):**
• Prediction: "Elite form continues. Expect 5+ goals next month with high confidence given current tactical setup and upcoming fixtures against weaker defenses."
• Key Factors: [4 detailed insights]
• Reasoning: [Full paragraph analysis]

Access by clicking "Unlock Premium Insights" on any player page! 🤖`,

  walrusUsage: `Valor uses Walrus for all data storage! 🔒

**What is Walrus?**
• Sui's decentralized storage network
• Like IPFS but built specifically for Sui
• Permanent data retention (can't be deleted)
• Redundant across multiple storage nodes
• Censorship-resistant

**Why Walrus Instead of Centralized Databases?**

✅ **Decentralization**
• No single server controls data
• Network of distributed nodes
• Survives even if Valor shuts down
• True data ownership

✅ **Permanence**
• Data stored forever
• Can't be deleted or modified
• Historical records preserved
• Complete audit trail

✅ **Verification**
• Cryptographic proofs via Blob IDs
• Anyone can verify data authenticity
• Compare on-chain Blob ID with fetched data
• Complete transparency

✅ **Cost-Effective**
• Much cheaper than pure on-chain storage
• Scales for large data (AI reports, voting)
• Storage epochs (~200 days per upload)
• Economical for sports analytics

✅ **Sui Native Integration**
• Built specifically for Sui ecosystem
• Seamless smart contract integration
• Native Move compatibility
• Perfect for on-chain apps

**What Valor Stores on Walrus:**

📊 **Player Performance Blobs:**
\`\`\`typescript
{
  version: "1.0.0",
  player_id: "0x7f8e9d...",
  player_name: "Erling Haaland",
  team: "Manchester City",
  season_period: "current",
  
  stats: {
    goals: 20,
    assists: 4,
    minutes_played: 1924,
    matches_played: 23
  },
  
  ai_analysis: {
    public_data: { score: 87, trend: "improving", ... },
    encrypted_premium: Uint8Array([...])  // Seal encrypted
  },
  
  valuation: {
    base_value_sui: 0.0167,
    performance_score: 87
  },
  
  verified: true,
  created_at: "2026-01-30T12:00:00Z"
}
\`\`\`

🗳️ **Pulse Voting Records:**
\`\`\`typescript
{
  week_number: 42,
  player_id: "0x7f8e9d...",
  player_name: "Erling Haaland",
  
  summary: {
    yes_count: 847,
    no_count: 153,
    total_votes: 1000,
    yes_percentage: 85
  },
  
  votes: [
    { voter: "0x1a2b...", vote: "yes", timestamp: "..." },
    // ... all individual votes
  ]
}
\`\`\`

**How Walrus Integration Works:**

**1️⃣ Upload:**
   • AI analysis completed (Nautilus)
   • Data encrypted (Seal for premium)
   • Uploaded to Walrus network
   • Returns unique Blob ID

**2️⃣ On-Chain Storage:**
   • Blob ID stored in smart contract
   • Separate for each season:
     - early_season_walrus_blob_id
     - mid_season_walrus_blob_id
     - current_season_walrus_blob_id

**3️⃣ Retrieval:**
   • Frontend fetches Blob ID from contract
   • Downloads from Walrus using Blob ID
   • Public data displayed immediately
   • Premium decrypted via Seal (if authorized)

**Where to See Walrus in Action:**

🔍 **Player Detail Pages:**
• Every player shows Blob ID
• Click to see verification details
• Each season has separate Blob ID

📊 **Pulse Page:**
• Voting results have Blob IDs
• Historical votes preserved forever

**Verification Example:**

1. Go to player page
2. See "Walrus Blob ID: XkJ9mP2nQ7rW..."
3. Copy Blob ID
4. Fetch from Walrus aggregator
5. Compare data with what's displayed
6. Verify it matches!

**Data Lifecycle:**

\`\`\`
Match Week Ends
    ↓
Nautilus fetches data & runs AI (inside enclave)
    ↓
Output signed with attestation
    ↓
Premium fields encrypted with Seal
    ↓
Full blob uploaded to Walrus → Blob ID
    ↓
Smart contract stores Blob ID on-chain
    ↓
Anyone can verify forever ✅
\`\`\`

All Valor data is permanent, verifiable, and decentralized! 🛡️`,

  dataVerification: `Verify all Valor data yourself - complete transparency! ✅

**The Multi-Layer Verification System:**

**Layer 1: Nautilus Signature Verification**

🔐 **What Gets Signed:**
• Player ID
• AI performance score
• Base value recommendation  
• Season period
• Timestamp

🔍 **How to Verify:**
1. Go to any player detail page
2. Scroll to "Verified & Attested Data" section
3. See Nautilus signature (hex string)
4. Signature is also emitted in on-chain events
5. Check SuiScan for transaction events
6. Verify signature matches enclave's public key

**What This Proves:**
✅ AI analysis ran inside secure enclave
✅ Computation hasn't been tampered with
✅ Even Valor can't manipulate pricing
✅ Hardware-level proof of integrity

**Layer 2: Walrus Blob Verification**

📦 **What Gets Stored:**
• Complete player performance data
• Public + encrypted premium AI
• Valuation details
• Metadata and timestamps

🔍 **How to Verify:**
1. Player page shows Walrus Blob ID
2. Copy the Blob ID (e.g., "XkJ9mP2nQ7rW...")
3. Fetch from Walrus aggregator:
   \`https://aggregator.walrus-testnet.walrus.space/v1/blobs/{BLOB_ID}\`
4. Download the JSON data
5. Compare with what's displayed on Valor
6. Verify it matches exactly

**What This Proves:**
✅ Data is stored permanently
✅ Can't be deleted or modified
✅ Complete historical record
✅ Platform-independent verification

**Layer 3: Seal Encryption Verification**

🔒 **What Gets Encrypted:**
• Premium AI predictions
• Key performance factors
• Detailed reasoning

🔍 **How to Verify Access Control:**
1. Try to decrypt premium without NFT → Fails
2. Buy shares → NFT minted
3. Try to decrypt again → Succeeds
4. Sell all shares → NFT burned
5. Try to decrypt → Fails again

**What This Proves:**
✅ Access truly controlled by NFT ownership
✅ Cryptography enforces rules (not server permissions)
✅ No backdoors for admins
✅ Decentralized content gating

**Layer 4: On-Chain Contract Verification**

⛓️ **What's On-Chain:**
• Player registration records
• Base value updates with signatures
• Blob ID references
• NFT ownership records
• Trading history

🔍 **How to Verify:**
1. Check smart contract on SuiScan
2. See all state changes in events
3. Verify signatures in update transactions
4. Confirm Blob IDs match Walrus data

**What This Proves:**
✅ All state changes are public
✅ Complete transaction history
✅ Immutable audit trail
✅ Open-source contract logic

**Complete Verification Workflow:**

**Example: Verifying Haaland's Latest Update**

**Step 1: Check Nautilus Signature**
\`\`\`
1. Visit Haaland's player page
2. See signature: "8a7f4e2d9c1b..."
3. Go to SuiScan, find latest update transaction
4. Check event: BaseValueUpdated
5. Event shows same signature
6. Verify against enclave public key ✅
\`\`\`

**Step 2: Verify Walrus Data**
\`\`\`
1. Copy Blob ID: "XkJ9mP2nQ7rW..."
2. Fetch from Walrus:
   curl https://aggregator.walrus-testnet.walrus.space/v1/blobs/XkJ9mP2nQ7rW...
3. Check data matches what Valor displays
4. Verify AI score, stats, timestamps ✅
\`\`\`

**Step 3: Test Seal Encryption**
\`\`\`
1. Without NFT: Premium shows "🔒 Locked"
2. Buy 1 share
3. Premium unlocks with full predictions
4. Sell share
5. Premium locks again ✅
\`\`\`

**Step 4: Verify On-Chain State**
\`\`\`
1. Check contract on SuiScan
2. See base_value field updated
3. See nautilus_signature field stored
4. See walrus_blob_id field stored
5. All match what Valor displays ✅
\`\`\`

**What Makes Valor Different:**

Most platforms say "trust us" → Valor says "verify yourself"

❌ **Traditional Platforms:**
• Hidden algorithms
• Centralized databases
• No way to verify
• Just trust the platform

✅ **Valor:**
• Open-source contracts
• Hardware attestation (Nautilus)
• Permanent storage (Walrus)
• Cryptographic access (Seal)
• Everything verifiable on-chain

**Try It Yourself:**

1. Pick any player
2. Follow verification steps above
3. See that everything checks out
4. Become confident in the system

Complete transparency and trust through cryptography! 🔐`,

  pulseVoting: `Cast your vote and earn Pulse Points! 🗳️

**How Pulse Voting Works:**

**1️⃣ Navigate to Pulse Page**
   • Click "Pulse" in the navigation
   • See this week's active predictions
   • Each player has a specific question
   • Example: "Will Haaland score 3+ goals this week?"

**2️⃣ View Current Sentiment**
   • See real-time vote percentages
   • YES vs NO breakdown
   • Total votes cast
   • Bullish 🔥 or Bearish 📉 indicators

**3️⃣ Cast Your Vote**
   • Choose YES or NO
   • Click to submit
   • Sign transaction (Google or wallet)
   • Vote recorded on-chain

**4️⃣ Earn Immediate Points**
   • +1 Pulse Point just for voting
   • Points added to your balance instantly
   • Stored in on-chain PointsBalance object

**5️⃣ Week Closes**
   • Voting period ends
   • Admin settles results based on actual performance
   • All votes uploaded to Walrus (permanent record)

**6️⃣ Bonus Points for Accuracy**
   • Correct predictions: +5 bonus points
   • Your prediction compared to actual result
   • Points credited automatically
   • Example: Voted YES, Haaland scored 4 goals → +5 points!

**Pulse Points Economy:**

**Ways to Earn:**
• Vote on predictions: +1 point
• Correct prediction: +5 points
• Buy NFT shares: +3 points per share
• Achievement milestones: bonus points
• Voting streaks: bonus points

**Ways to Spend:**
• 10 points: Unlock premium AI (no NFT needed!)
• Future: Custom badges, boosted listings, exclusive features

**Rules:**
• One vote per player per week
• Cannot change vote after submission
• Voting closes when week ends
• Free to participate (just gas fees)

**Verification:**

🔗 **On-Chain Vote Record:**
• Every vote is a blockchain transaction
• Stored in Pulse smart contract
• Immutable and transparent

📦 **Walrus Storage:**
• After week closes, all votes uploaded
• Permanent record on Walrus
• Blob ID stored on-chain
• Anyone can verify results

**Example Week:**

**Monday:**
• New week starts
• Question: "Will Salah score 2+ goals?"
• You vote: YES (+1 point)

**Tuesday-Sunday:**
• Watch matches
• See how community voted
• 65% said YES, 35% said NO

**Monday Next Week:**
• Results in: Salah scored 3 goals!
• Your prediction was CORRECT
• +5 bonus points awarded
• New week begins

**Leaderboard Impact:**

🏆 **Your Stats:**
• Total Pulse Points
• Votes cast
• Correct predictions count
• Your rank (if you have SuiNS name)

📊 **Displayed on Leaderboard:**
• Shows your prediction accuracy
• Compares with other traders
• Builds your reputation

**Why Vote?**

✅ **Build Reputation:** Show your football knowledge
✅ **Earn Points:** Unlock premium AI without buying
✅ **Community Insight:** See what others think
✅ **Permanent Record:** Prove your prediction accuracy
✅ **Engage Daily:** Stay active in Valor community

**Pro Tips:**

💡 Research players before voting
💡 Check upcoming fixtures
💡 Review recent form
💡 Use public AI data to inform decision
💡 Build voting streak for consistency bonus

Vote smart, earn points, climb the leaderboard! 💪`,

  suinsIntegration: `Valor integrates SuiNS for human-readable identity! 🏷️

**What is SuiNS?**
• Sui Name Service (like ENS for Ethereum)
• Maps wallet addresses to readable names
• Example: "alice.sui" instead of "0x7f8e9d3c..."
• Decentralized naming system on Sui

**How Valor Uses SuiNS:**

**1️⃣ Leaderboard Display**
• Every user with a SuiNS name appears
• Shows "tomcrown.sui" not "0x7f8e..."
• Makes competition personal
• Builds community identity

**2️⃣ Portfolio Identification**
• Your name shows in your portfolio
• Other traders see your name
• Creates recognizable identity
• Professional appearance

**3️⃣ Social Features**
• Pulse voting shows voter names
• Transaction history more readable
• Community recognition
• Reputation building

**How It Works:**

**Reverse Lookup (Address → Name):**
\`\`\`typescript
// Valor queries SuiNS reverse registry
const name = await resolveAddressToName("0x7f8e9d...")
// Returns: "alice.sui" or null

// Display on leaderboard
{ name: "alice.sui", points: 1250, rank: 47 }
\`\`\`

**Bulk Resolution:**
\`\`\`typescript
// For leaderboards with many users
const addresses = [...100 addresses...]
const names = await resolveBulkNames(addresses)

// Maps addresses to names efficiently
// Cached to minimize RPC calls
\`\`\`

**Automatic Integration:**

✅ **You Don't Need to Do Anything**
• Already have SuiNS name? It shows automatically
• No setup required in Valor
• Just connect your wallet
• Your name appears everywhere

❌ **Don't Have SuiNS Name?**
• Valor shows shortened address: "0x7f8e...3c2b"
• You can still use everything
• Get a name at: https://suins.io
• Your name will appear once registered

**Where Your SuiNS Name Shows:**

📊 **Leaderboards:**
• All-Time Points
• Most Engaged
• Top Investors
• Your rank with your name

💼 **Portfolio:**
• Your profile header
• Transaction history
• NFT ownership records

🗳️ **Pulse Voting:**
• Voter list (if public)
• Prediction history
• Community stats

**Benefits:**

✅ **Recognition:**
• Build reputation with memorable name
• Others remember you
• Professional identity

✅ **Competition:**
• Personal rivalry on leaderboards
• Track friends' performance
• Community challenges

✅ **Trust:**
• Established names = credibility
• History tied to identity
• Accountability

**Privacy Note:**

🔒 **You Control Your Name:**
• SuiNS is optional (not required)
• You can use Valor without a name
• Names are public by design (that's the point)
• Connect different wallet if you want privacy

**Example Leaderboard:**

\`\`\`
Rank | Name           | Points | NFTs
  1  | tomcrown.sui   | 5,250  | 42
  2  | alice.sui      | 4,890  | 38
  3  | crypto_king.sui| 4,120  | 35
  4  | 0x7f8e...3c2b  | 3,950  | 32  ← No SuiNS name
  5  | trader99.sui   | 3,840  | 31
\`\`\`

Make your mark on Valor with a memorable name! 🏆`,
};
