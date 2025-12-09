#!/usr/bin/env ts-node
// ============================================================================
// FILE: scripts/registerPlayers.ts
// Register players on-chain from dummyData.ts
// Usage: ts-node scripts/registerPlayers.ts --season early|mid|current
// ============================================================================

import { Transaction } from "@mysten/sui/transactions";
import { DUMMY_PLAYERS, type SeasonPeriod } from "../data/dummyData.ts";
import { SUI_CONFIG, suiToMist } from "../config/sui.config.ts";
import {
  rpcClient,
  loadAdminKeypair,
  executeTransaction,
  getClockObjectId,
} from "../lib/suiClient.ts";
import { walrusClient } from "../lib/walrusClient.ts";
import { analyzePlayer, type AIAnalysis } from "../lib/openai.ts";
import { createHash } from "crypto";

// ============================================================================
// Parse CLI Arguments
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  let season: SeasonPeriod = "current";
  let playersToRegister: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--season" && args[i + 1]) {
      season = args[i + 1] as SeasonPeriod;
      i++;
    } else if (args[i] === "--players" && args[i + 1]) {
      playersToRegister = args[i + 1].split(",");
      i++;
    }
  }

  return { season, playersToRegister };
}

// ============================================================================
// Calculate Data Hash (matches Move contract)
// ============================================================================

function calculateDataHash(
  playerId: string,
  performanceScore: number,
  goals: number,
  assists: number,
  rating: number,
  timestamp: number
): string {
  const data = Buffer.concat([
    Buffer.from(playerId),
    Buffer.from(performanceScore.toString()),
    Buffer.from(goals.toString()),
    Buffer.from(assists.toString()),
    Buffer.from(rating.toString()),
    Buffer.from(timestamp.toString()),
  ]);

  return "0x" + createHash("sha3-256").update(data).digest("hex");
}

// ============================================================================
// Calculate Base Value from AI Score
// ============================================================================

function calculateBaseValue(aiScore: number, currentValue: number): bigint {
  // Convert current frontend value to base value
  // Your frontend values are in the 1000-3000 range
  // Convert to MIST (multiply by 1M for proper on-chain value)
  const baseInSui = currentValue / 1000; // Normalize
  const adjustedForAI = baseInSui * (aiScore / 100);

  // Ensure within contract limits
  const finalValue = Math.max(
    Number(SUI_CONFIG.market.minBaseValue),
    Math.min(
      adjustedForAI * 1_000_000_000, // Convert to MIST
      Number(SUI_CONFIG.market.maxBaseValue)
    )
  );

  return BigInt(Math.floor(finalValue));
}

// ============================================================================
// Register Single Player
// ============================================================================

async function registerPlayer(
  playerData: (typeof DUMMY_PLAYERS)[0],
  season: SeasonPeriod,
  keypair: ReturnType<typeof loadAdminKeypair>
): Promise<{ success: boolean; playerId?: string; blobId?: string }> {
  try {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`🏃 Registering: ${playerData.name}`);
    console.log("=".repeat(70));

    // Get stats for the selected season
    const seasonStats = playerData.seasonalStats[season];

    console.log(`📊 Season: ${season.toUpperCase()}`);
    console.log(`   Goals: ${seasonStats.goals}`);
    console.log(`   Assists: ${seasonStats.assists}`);
    console.log(`   Matches: ${seasonStats.matchesPlayed}`);

    // Step 1: Run AI Analysis
    console.log("\n🤖 Running AI analysis...");
    const aiAnalysis: AIAnalysis = await analyzePlayer({
      name: playerData.name,
      position: playerData.position,
      team: playerData.club,
      goals: seasonStats.goals,
      assists: seasonStats.assists,
      minutesPlayed: seasonStats.minutesPlayed,
      matchesPlayed: seasonStats.matchesPlayed,
      currentValue: playerData.currentValue,
      weeklyChange: playerData.weeklyChange,
      season: season,
    });

    console.log(`   AI Score: ${aiAnalysis.performance_score}/100`);
    console.log(`   Trend: ${aiAnalysis.performance_trend}`);

    // Step 2: Calculate base value
    const baseValue = calculateBaseValue(
      aiAnalysis.performance_score,
      playerData.currentValue
    );

    console.log(
      `\n💰 Calculated base value: ${Number(baseValue) / 1_000_000_000} SUI`
    );

    // Step 3: Create data hash
    const timestamp = Date.now();
    const dataHash = calculateDataHash(
      playerData.id,
      aiAnalysis.performance_score,
      seasonStats.goals,
      seasonStats.assists,
      Math.round((aiAnalysis.recent_form?.goals_per_90 || 0) * 100), // Convert to integer
      timestamp
    );

    console.log(`\n🔐 Data hash: ${dataHash}`);

    // Step 4: Upload to Walrus
    console.log("\n📦 Uploading to Walrus...");
    const blobId = await walrusClient.uploadPlayerPerformance(
      playerData.id,
      playerData.name,
      playerData.club,
      playerData.position,
      playerData.nationality ?? "Unknown",
      season,
      {
        goals: seasonStats.goals,
        assists: seasonStats.assists,
        minutes_played: seasonStats.minutesPlayed,
        matches_played: seasonStats.matchesPlayed,
        rating: aiAnalysis.recent_form?.goals_per_90,
        clean_sheets: 0,
      },
      aiAnalysis,
      Number(baseValue),
      dataHash
    );

    console.log(`   ✅ Walrus Blob ID: ${blobId}`);

    // Step 5: Register on-chain
    console.log("\n⛓️  Registering on Sui blockchain...");

    const tx = new Transaction();
    const clockId = await getClockObjectId();

    tx.moveCall({
      target: `${SUI_CONFIG.contracts.packageId}::valor::register_player`,
      arguments: [
        tx.object(SUI_CONFIG.contracts.adminCapId),
        tx.object(SUI_CONFIG.contracts.platformObjectId),
        tx.pure.string(playerData.name),
        tx.pure.string(playerData.club),
        tx.pure.string(playerData.position),
        tx.pure.u64(baseValue),
        tx.pure.u64(SUI_CONFIG.market.defaultShares),
        tx.object(clockId),
      ],
    });

    tx.setGasBudget(SUI_CONFIG.gas.budget);

    const result = await executeTransaction(tx, keypair);

    if (result.success) {
      console.log(`   ✅ Transaction successful!`);
      console.log(`   📝 Digest: ${result.digest}`);

      // Extract player ID from events
      const playerRegisteredEvent = result.events?.find((e) =>
        e.type.includes("PlayerRegistered")
      );

      const playerId = (
        playerRegisteredEvent?.parsedJson as { player_id?: string }
      )?.player_id;

      if (playerId) {
        console.log(`   🆔 Player ID: ${playerId}`);
      }

      return { success: true, playerId, blobId };
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error: any) {
    console.error(`\n❌ Failed to register ${playerData.name}:`, error.message);
    return { success: false };
  }
}

// ============================================================================
// Main Script
// ============================================================================

async function main() {
  console.log("🚀 Valor Player Registration Script");
  console.log("=".repeat(70));

  const { season, playersToRegister } = parseArgs();

  console.log(`\n📅 Season Period: ${season.toUpperCase()}`);
  console.log(`🌐 Network: ${SUI_CONFIG.network}`);
  console.log(`📦 Package ID: ${SUI_CONFIG.contracts.packageId}`);
  console.log(`🏛️  Platform ID: ${SUI_CONFIG.contracts.platformObjectId}`);

  // Load admin keypair
  console.log("\n🔑 Loading admin keypair...");
  const keypair = loadAdminKeypair();
  const address = keypair.getPublicKey().toSuiAddress();
  console.log(`   Admin address: ${address}`);

  // Check balance
  const balance = await rpcClient.getBalance({ owner: address });
  console.log(
    `   Balance: ${Number(balance.totalBalance) / 1_000_000_000} SUI`
  );

  if (Number(balance.totalBalance) < 100_000_000) {
    throw new Error("Insufficient balance. Need at least 0.1 SUI for gas.");
  }

  // Filter players to register
  let playersToProcess = DUMMY_PLAYERS;
  if (playersToRegister.length > 0) {
    playersToProcess = DUMMY_PLAYERS.filter(
      (p) =>
        playersToRegister.includes(p.name) || playersToRegister.includes(p.id)
    );
    console.log(`\n📋 Registering ${playersToProcess.length} specific players`);
  } else {
    console.log(`\n📋 Registering all ${playersToProcess.length} players`);
  }

  // Process each player
  const results: Array<{
    player: string;
    success: boolean;
    playerId?: string;
    blobId?: string;
  }> = [];

  for (const player of playersToProcess) {
    const result = await registerPlayer(player, season, keypair);
    results.push({
      player: player.name,
      success: result.success,
      playerId: result.playerId,
      blobId: result.blobId,
    });

    // Rate limiting: wait 2 seconds between registrations
    if (playersToProcess.indexOf(player) < playersToProcess.length - 1) {
      console.log("\n⏳ Waiting 2s before next registration...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("📊 REGISTRATION SUMMARY");
  console.log("=".repeat(70));

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`\n✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);

  console.log("\n📋 Details:");
  results.forEach((r) => {
    const status = r.success ? "✅" : "❌";
    console.log(`   ${status} ${r.player}`);
    if (r.playerId) console.log(`      Player ID: ${r.playerId}`);
    if (r.blobId) console.log(`      Walrus: ${r.blobId}`);
  });

  console.log("\n✨ Registration complete!\n");
}

// Run script
if (require.main === module) {
  main().catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
}

export { registerPlayer, calculateBaseValue, calculateDataHash };
