#!/usr/bin/env ts-node
// ============================================================================
// FILE: scripts/updateBaseValues.ts
// Update player base values on-chain
// Usage: ts-node scripts/updateBaseValues.ts --season mid --player "Erling Haaland"
// ============================================================================

import { Transaction } from "@mysten/sui/transactions";
import { DUMMY_PLAYERS, type SeasonPeriod } from "../data/dummyData";
import { SUI_CONFIG } from "../config/sui.config";
import {
  rpcClient,
  loadAdminKeypair,
  executeTransaction,
  getClockObjectId,
} from "../lib/suiClient";
import { walrusClient } from "../lib/walrusClient";
import { analyzePlayer } from "../lib/openai";
import { calculateBaseValue, calculateDataHash } from "./registerPlayers";

// ============================================================================
// Parse CLI Arguments
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  let season: SeasonPeriod = "current";
  let playersToUpdate: string[] = [];
  let updateCapId: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--season" && args[i + 1]) {
      season = args[i + 1] as SeasonPeriod;
      i++;
    } else if (args[i] === "--players" && args[i + 1]) {
      playersToUpdate = args[i + 1].split(",");
      i++;
    } else if (args[i] === "--update-cap" && args[i + 1]) {
      updateCapId = args[i + 1];
      i++;
    }
  }

  return { season, playersToUpdate, updateCapId };
}

// ============================================================================
// Get UpdateCapability for Player
// ============================================================================

async function getUpdateCapability(
  playerName: string,
  ownerAddress: string
): Promise<string | null> {
  try {
    // Query for UpdateCapability objects owned by admin
    const objects = await rpcClient.getOwnedObjects({
      owner: ownerAddress,
      filter: {
        StructType: `${SUI_CONFIG.contracts.packageId}::valor::UpdateCapability`,
      },
      options: {
        showContent: true,
      },
    });

    // Find the capability for this player
    for (const obj of objects.data) {
      if ((obj.data?.content as any)?.type === "moveObject") {
        const fields = (obj.data?.content as any).fields;
        if (fields && fields.player_name === playerName) {
          return obj.data?.objectId ?? null;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Failed to find UpdateCapability:", error);
    return null;
  }
}

// ============================================================================
// Update Single Player
// ============================================================================

async function updatePlayer(
  playerData: (typeof DUMMY_PLAYERS)[0],
  season: SeasonPeriod,
  updateCapId: string,
  keypair: ReturnType<typeof loadAdminKeypair>
): Promise<boolean> {
  try {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`📊 Updating: ${playerData.name}`);
    console.log("=".repeat(70));

    // Get stats for the selected season
    const seasonStats = playerData.seasonalStats[season];

    console.log(`📅 Season: ${season.toUpperCase()}`);
    console.log(`   Goals: ${seasonStats.goals}`);
    console.log(`   Assists: ${seasonStats.assists}`);
    console.log(`   Matches: ${seasonStats.matchesPlayed}`);

    // Step 1: Run AI Analysis
    console.log("\n🤖 Running AI analysis...");
    const aiAnalysis = await analyzePlayer({
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
    console.log(`   Form: ${aiAnalysis.form_status}`);

    // Step 2: Calculate new base value
    const newBaseValue = calculateBaseValue(
      aiAnalysis.performance_score,
      playerData.currentValue
    );

    console.log(
      `\n💰 New base value: ${Number(newBaseValue) / 1_000_000_000} SUI`
    );

    // Step 3: Create data hash
    const timestamp = Date.now();
    const rating = Math.round(
      (aiAnalysis.recent_form?.goals_per_90 || 0) * 100
    );

    const dataHash = calculateDataHash(
      playerData.id,
      aiAnalysis.performance_score,
      seasonStats.goals,
      seasonStats.assists,
      rating,
      timestamp
    );

    console.log(`🔐 Data hash: ${dataHash}`);

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
      Number(newBaseValue),
      dataHash
    );

    console.log(`   ✅ Walrus Blob ID: ${blobId}`);

    // Step 5: Update on-chain
    console.log("\n⛓️  Updating on Sui blockchain...");

    const tx = new Transaction();
    const clockId = await getClockObjectId();

    // Convert data hash to bytes (remove 0x prefix)
    const dataHashBytes = Array.from(Buffer.from(dataHash.slice(2), "hex"));

    tx.moveCall({
      target: `${SUI_CONFIG.contracts.packageId}::valor::update_base_value`,
      arguments: [
        tx.object(SUI_CONFIG.contracts.platformObjectId),
        tx.object(updateCapId),
        tx.pure.u64(newBaseValue),
        tx.pure.u64(aiAnalysis.performance_score),
        tx.pure.u64(seasonStats.goals),
        tx.pure.u64(seasonStats.assists),
        tx.pure.u64(rating),
        tx.pure.u64(seasonStats.minutesPlayed),
        tx.pure.u64(0), // clean_sheets
        tx.pure.string(blobId),
        tx.pure.vector("u8", dataHashBytes),
        tx.object(clockId),
      ],
    });

    tx.setGasBudget(SUI_CONFIG.gas.budget);

    const result = await executeTransaction(tx, keypair);

    if (result.success) {
      console.log(`   ✅ Update successful!`);
      console.log(`   📝 Digest: ${result.digest}`);

      // Check for circuit breaker
      const circuitBreakerEvent = result.events?.find((e) =>
        e.type.includes("CircuitBreakerTriggered")
      );

      if (circuitBreakerEvent) {
        console.log(`   ⚠️  Circuit breaker triggered - change too large!`);
        console.log(`   ℹ️  Update will be applied after cooldown period`);
      }

      return true;
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error: any) {
    console.error(`\n❌ Failed to update ${playerData.name}:`, error.message);
    return false;
  }
}

// ============================================================================
// Main Script
// ============================================================================

async function main() {
  console.log("🔄 Valor Base Value Update Script");
  console.log("=".repeat(70));

  const { season, playersToUpdate, updateCapId } = parseArgs();

  console.log(`\n📅 Season Period: ${season.toUpperCase()}`);
  console.log(`🌐 Network: ${SUI_CONFIG.network}`);
  console.log(`📦 Package ID: ${SUI_CONFIG.contracts.packageId}`);

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

  if (Number(balance.totalBalance) < 50_000_000) {
    throw new Error("Insufficient balance. Need at least 0.05 SUI for gas.");
  }

  // Filter players to update
  let playersToProcess = DUMMY_PLAYERS;
  if (playersToUpdate.length > 0) {
    playersToProcess = DUMMY_PLAYERS.filter((p) =>
      playersToUpdate.some(
        (name) =>
          p.name.toLowerCase().includes(name.toLowerCase()) || p.id === name
      )
    );
    console.log(`\n📋 Updating ${playersToProcess.length} specific players`);
  } else {
    console.log(`\n📋 Updating all ${playersToProcess.length} players`);
  }

  // Process each player
  const results: Array<{ player: string; success: boolean }> = [];

  for (const player of playersToProcess) {
    // Get or use provided UpdateCapability
    let capId = updateCapId;

    if (!capId) {
      console.log(`\n🔍 Finding UpdateCapability for ${player.name}...`);
      capId = await getUpdateCapability(player.name, address);

      if (!capId) {
        console.error(`   ❌ No UpdateCapability found for ${player.name}`);
        console.error(`   ℹ️  Player may not be registered yet`);
        results.push({ player: player.name, success: false });
        continue;
      }

      console.log(`   ✅ Found UpdateCapability: ${capId}`);
    }

    const success = await updatePlayer(player, season, capId, keypair);
    results.push({ player: player.name, success });

    // Rate limiting: wait 3 seconds between updates (7-day cooldown in contract)
    if (playersToProcess.indexOf(player) < playersToProcess.length - 1) {
      console.log("\n⏳ Waiting 3s before next update...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("📊 UPDATE SUMMARY");
  console.log("=".repeat(70));

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`\n✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);

  console.log("\n📋 Details:");
  results.forEach((r) => {
    const status = r.success ? "✅" : "❌";
    console.log(`   ${status} ${r.player}`);
  });

  console.log("\n✨ Updates complete!\n");
}

// Run script
if (require.main === module) {
  main().catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
}

export { updatePlayer };
