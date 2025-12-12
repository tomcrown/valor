#!/usr/bin/env ts-node
// ============================================================================
// FILE: scripts/registerPlayers.ts (UPDATED with Decentralized Pricing)
// Register players on-chain from dummyData.ts
// Usage:
//   ts-node scripts/registerPlayers.ts --season early
//   ts-node scripts/registerPlayers.ts --season early --players "Haaland,Salah"
//   ts-node scripts/registerPlayers.ts --season early --baseValues "Haaland=0.15" (optional override)
// ============================================================================
import dotenv from "dotenv";
dotenv.config();
import { Transaction } from "@mysten/sui/transactions";
import { FOOTBALL_PLAYERS, type SeasonPeriod } from "../data/dummyData.ts";
import { SUI_CONFIG } from "../config/sui.config.ts";
import {
  rpcClient,
  loadAdminKeypair,
  executeTransaction,
  getClockObjectId,
} from "../lib/suiClient.ts";
import { walrusClient } from "../lib/walrusClient.ts";
import { analyzePlayer, type AIAnalysis } from "../lib/openai.ts";
import {
  calculateEarlySeasonBaseValue,
  suiToMistBigInt,
} from "../lib/valueCalculator.ts";

// ============================================================================
// Parse CLI Arguments
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  let season: SeasonPeriod = "early";
  let playersToRegister: string[] = [];
  let baseValuesRaw: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--season" && args[i + 1]) {
      season = args[i + 1] as SeasonPeriod;
      i++;
    } else if (args[i] === "--players" && args[i + 1]) {
      playersToRegister = args[i + 1].split(",");
      i++;
    } else if (args[i] === "--baseValues" && args[i + 1]) {
      baseValuesRaw = args[i + 1];
      i++;
    }
  }

  const manualBaseValues = baseValuesRaw
    ? parseBaseValuesString(baseValuesRaw)
    : {};

  return { season, playersToRegister, manualBaseValues };
}

function parseBaseValuesString(s: string): Record<string, number> {
  const out: Record<string, number> = {};
  const pairs = s
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  for (const pair of pairs) {
    const [rawName, rawVal] = pair.split("=");
    if (!rawName || !rawVal) continue;

    const name = rawName.trim().toLowerCase();
    const val = Number(rawVal.trim());

    if (isNaN(val)) {
      console.warn(`⚠️  Invalid base value for ${rawName}: ${rawVal}`);
      continue;
    }

    if (val > 0.2) {
      console.warn(
        `⚠️  ${rawName}: ${val} exceeds 0.20 SUI cap, capping at 0.20`
      );
      out[name] = 0.2;
    } else {
      out[name] = val;
    }
  }

  return out;
}

function findBaseValueForPlayer(
  playerName: string,
  manualBaseValues: Record<string, number>
): number | null {
  const lowerPlayerName = playerName.toLowerCase();

  if (manualBaseValues[lowerPlayerName] != null) {
    return manualBaseValues[lowerPlayerName];
  }

  for (const [key, value] of Object.entries(manualBaseValues)) {
    if (lowerPlayerName.includes(key)) {
      return value;
    }
  }

  return null;
}

// ============================================================================
// Register Single Player (EARLY SEASON ONLY)
// ============================================================================

async function registerPlayer(
  playerData: (typeof FOOTBALL_PLAYERS)[0],
  season: SeasonPeriod,
  keypair: ReturnType<typeof loadAdminKeypair>,
  manualBaseValues: Record<string, number>
): Promise<{ success: boolean; playerId?: string; blobId?: string }> {
  try {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`🏃 Registering: ${playerData.name}`);
    console.log("=".repeat(70));

    if (season !== "early") {
      console.error(`\n❌ Registration only allowed for early season!`);
      console.log(`   For ${season} season, use updateBaseValues.ts instead`);
      return { success: false };
    }

    const seasonStats = playerData.seasonalStats[season];

    console.log(`📊 Season: ${season.toUpperCase()}`);
    console.log(`   Position: ${playerData.position}`);
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
      currentValue: playerData.aiScore,
      weeklyChange: 0,
      season: season,
    });

    console.log(`   ✅ AI Score: ${aiAnalysis.performance_score}/100`);
    console.log(`   📈 Trend: ${aiAnalysis.performance_trend}`);

    // Step 2: Calculate base value (decentralized or manual override)
    let baseValueMist: bigint;

    const manualValue = findBaseValueForPlayer(
      playerData.name,
      manualBaseValues
    );

    if (manualValue != null) {
      // Manual override (still capped at 0.20)
      baseValueMist = suiToMistBigInt(Math.min(manualValue, 0.2));
      console.log(
        `\n💰 Using MANUAL override: ${Math.min(manualValue, 0.2)} SUI`
      );
      if (manualValue > 0.2) {
        console.log(
          `   ⚠️  Capped from ${manualValue} to 0.20 SUI for decentralization`
        );
      }
    } else {
      // Decentralized calculation
      console.log(`\n💰 Using DECENTRALIZED calculation:`);
      baseValueMist = calculateEarlySeasonBaseValue(
        aiAnalysis.performance_score,
        playerData.position,
        seasonStats
      );
    }

    const finalSuiValue = Number(baseValueMist) / 1_000_000_000;
    console.log(
      `\n✅ Final early season base: ${finalSuiValue.toFixed(
        4
      )} SUI (${baseValueMist} MIST)`
    );

    // Step 3: Upload to Walrus
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
      Number(baseValueMist)
    );

    console.log(`   ✅ Walrus Blob ID: ${blobId}`);

    // Step 4: Register on-chain
    console.log("\n⛓️  Registering on Sui blockchain...");

    const tx = new Transaction();
    const clockId = await getClockObjectId();
    const imageUrl = playerData.imageUrl ?? "";
    const nftImageUrl = playerData.nftImageUrl;

    tx.moveCall({
      target: `${SUI_CONFIG.contracts.packageId}::valor::register_player`,
      arguments: [
        tx.object(SUI_CONFIG.contracts.adminCapId),
        tx.object(SUI_CONFIG.contracts.platformObjectId),
        tx.pure.string(playerData.name),
        tx.pure.string(playerData.club),
        tx.pure.string(playerData.position),
        tx.pure.string(imageUrl),
        tx.pure.string(nftImageUrl),
        tx.pure.u64(baseValueMist),
        tx.pure.u64(SUI_CONFIG.market.defaultShares),
        tx.object(clockId),
      ],
    });

    tx.setGasBudget(SUI_CONFIG.gas.budget);

    const result = await executeTransaction(tx, keypair);

    if (result.success) {
      console.log(`   ✅ Transaction successful!`);
      console.log(`   📝 Digest: ${result.digest}`);

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
  console.log("🚀 Valor Player Registration Script (Decentralized Pricing)");
  console.log("=".repeat(70));

  const { season, playersToRegister, manualBaseValues } = parseArgs();

  if (season !== "early") {
    console.error(`\n❌ ERROR: Registration only allowed for --season early`);
    console.log(
      `   For mid/current seasons, use: ts-node scripts/updateBaseValues.ts`
    );
    process.exit(1);
  }

  console.log(`\n📅 Season Period: ${season.toUpperCase()}`);
  console.log(`🌐 Network: ${SUI_CONFIG.network}`);
  console.log(`📦 Package ID: ${SUI_CONFIG.contracts.packageId}`);
  console.log(`🏛️  Platform ID: ${SUI_CONFIG.contracts.platformObjectId}`);
  console.log(
    `\n💡 Pricing Mode: ${
      Object.keys(manualBaseValues).length > 0
        ? "HYBRID (Manual + Decentralized)"
        : "FULLY DECENTRALIZED"
    }`
  );
  console.log(`   Max base value: 0.20 SUI (decentralization cap)`);

  if (Object.keys(manualBaseValues).length > 0) {
    console.log(`\n💰 Manual Overrides (SUI):`);
    for (const [name, value] of Object.entries(manualBaseValues)) {
      console.log(`   ${name}: ${value} SUI`);
    }
  }

  console.log("\n🔑 Loading admin keypair...");
  const keypair = loadAdminKeypair();
  const address = keypair.getPublicKey().toSuiAddress();
  console.log(`   Admin address: ${address}`);

  const balance = await rpcClient.getBalance({ owner: address });
  console.log(
    `   Balance: ${Number(balance.totalBalance) / 1_000_000_000} SUI`
  );

  if (Number(balance.totalBalance) < 100_000_000) {
    throw new Error("Insufficient balance. Need at least 0.1 SUI for gas.");
  }

  let playersToProcess = FOOTBALL_PLAYERS;
  if (playersToRegister.length > 0) {
    playersToProcess = FOOTBALL_PLAYERS.filter(
      (p) =>
        playersToRegister.includes(p.name) || playersToRegister.includes(p.id)
    );
    console.log(`\n📋 Registering ${playersToProcess.length} specific players`);
  } else {
    console.log(`\n📋 Registering all ${playersToProcess.length} players`);
  }

  const results: Array<{
    player: string;
    success: boolean;
    playerId?: string;
    blobId?: string;
  }> = [];

  for (const player of playersToProcess) {
    const result = await registerPlayer(
      player,
      season,
      keypair,
      manualBaseValues
    );
    results.push({
      player: player.name,
      success: result.success,
      playerId: result.playerId,
      blobId: result.blobId,
    });

    if (playersToProcess.indexOf(player) < playersToProcess.length - 1) {
      console.log("\n⏳ Waiting 2s before next registration...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

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

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
}

export { registerPlayer };
