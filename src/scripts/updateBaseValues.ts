#!/usr/bin/env ts-node
// ============================================================================
// FILE: scripts/updateBaseValues.ts
// Update player base values on-chain (Simplified - No UpdateCapability needed)
// Usage:
//   ts-node scripts/updateBaseValues.ts --season mid --players "Erling Haaland"
// ============================================================================

import dotenv from "dotenv";
dotenv.config();
import { Transaction } from "@mysten/sui/transactions";
import { DUMMY_PLAYERS, type SeasonPeriod } from "../data/dummyData.ts";
import { SUI_CONFIG } from "../config/sui.config.ts";
import {
  rpcClient,
  loadAdminKeypair,
  executeTransaction,
  getClockObjectId,
} from "../lib/suiClient.ts";
import { walrusClient } from "../lib/walrusClient.ts";
import { analyzePlayer } from "../lib/openai.ts";
import { calculateBaseValue } from "../scripts/registerPlayers.ts";

// ============================================================================
// Parse CLI Arguments
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  let season: SeasonPeriod = "current";
  let playersToUpdate: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--season" && args[i + 1]) {
      season = args[i + 1] as SeasonPeriod;
      i++;
    } else if (args[i] === "--players" && args[i + 1]) {
      playersToUpdate = args[i + 1].split(",");
      i++;
    }
  }

  return { season, playersToUpdate };
}

/**
 * FIXED VERSION: Find the on-chain Player object ID from platform.player_names table.
 *
 * This function properly handles the dynamic field lookup for Sui tables.
 */
async function getPlayerObjectIdFromPlatform(
  playerName: string
): Promise<string | null> {
  try {
    const platformId = SUI_CONFIG.contracts.platformObjectId;

    // Get platform object
    const platform = await rpcClient.getObject({
      id: platformId,
      options: { showContent: true },
    });

    const content = platform?.data?.content as any;
    const tableId = content?.fields?.player_names?.fields?.id?.id;

    if (!tableId) {
      console.error("   ❌ player_names table ID not found");
      return null;
    }

    console.log(`   📋 Table ID: ${tableId}`);

    // FIRST: Try to list all dynamic fields to see what's available
    try {
      const allFields = await rpcClient.getDynamicFields({
        parentId: tableId,
      });

      console.log(
        `   📊 Found ${allFields.data.length} total players in table`
      );

      // Look for exact match (case-insensitive)
      const matchingField = allFields.data.find(
        (f) => String(f.name.value).toLowerCase() === playerName.toLowerCase()
      );

      if (matchingField) {
        console.log(
          `   ✅ Found matching field for: ${matchingField.name.value}`
        );

        // Now get the actual value (player ID) from this field
        const fieldObject = await rpcClient.getDynamicFieldObject({
          parentId: tableId,
          name: matchingField.name,
        });

        if (fieldObject?.data?.content) {
          const fieldContent = fieldObject.data.content as any;
          const playerId = fieldContent?.fields?.value;

          if (playerId) {
            console.log(`   🎯 Player ID: ${playerId}`);
            return String(playerId);
          }
        }
      } else {
        console.error(`   ❌ No player found with name: "${playerName}"`);
        console.log(`   📝 Available players:`);
        allFields.data.forEach((f) => {
          console.log(`      - ${f.name.value}`);
        });
        return null;
      }
    } catch (listErr: any) {
      console.error(`   ❌ Error listing fields: ${listErr.message}`);
    }

    // FALLBACK: Try direct query with exact string
    try {
      const field = await rpcClient.getDynamicFieldObject({
        parentId: tableId,
        name: {
          type: "0x1::string::String",
          value: playerName,
        },
      });

      if (field?.data?.content) {
        const fieldContent = field.data.content as any;
        const playerId = fieldContent?.fields?.value;
        return playerId ? String(playerId) : null;
      }
    } catch (directErr: any) {
      console.error(`   ⚠️  Direct query failed: ${directErr.message}`);
    }

    return null;
  } catch (err: any) {
    console.error(`   ❌ Error looking up player: ${err.message}`);
    return null;
  }
}

// Alternative approach: Get player ID by querying the players table directly
async function getAllRegisteredPlayers(): Promise<Map<string, string>> {
  const playerMap = new Map<string, string>();

  try {
    const platformId = SUI_CONFIG.contracts.platformObjectId;
    const platform = await rpcClient.getObject({
      id: platformId,
      options: { showContent: true },
    });

    const content = platform?.data?.content as any;
    const tableId = content?.fields?.player_names?.fields?.id?.id;

    if (!tableId) {
      console.error("❌ player_names table not found");
      return playerMap;
    }

    const allFields = await rpcClient.getDynamicFields({
      parentId: tableId,
    });

    for (const field of allFields.data) {
      const playerName = String(field.name.value);

      const fieldObject = await rpcClient.getDynamicFieldObject({
        parentId: tableId,
        name: field.name,
      });

      if (fieldObject?.data?.content) {
        const fieldContent = fieldObject.data.content as any;
        const playerId = fieldContent?.fields?.value;

        if (playerId) {
          playerMap.set(playerName, String(playerId));
        }
      }
    }

    return playerMap;
  } catch (err: any) {
    console.error("Error fetching all players:", err.message);
    return playerMap;
  }
}
// ============================================================================
// Update Single Player
// ============================================================================

async function updatePlayer(
  playerInfo: (typeof DUMMY_PLAYERS)[0],
  season: SeasonPeriod,
  keypair: ReturnType<typeof loadAdminKeypair>
): Promise<boolean> {
  try {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`📊 Updating: ${playerInfo.name}`);
    console.log("=".repeat(70));

    // Get stats for the selected season
    const seasonStats = playerInfo.seasonalStats[season];

    console.log(`📅 Season: ${season.toUpperCase()}`);
    console.log(`   Goals: ${seasonStats.goals}`);
    console.log(`   Assists: ${seasonStats.assists}`);
    console.log(`   Matches: ${seasonStats.matchesPlayed}`);

    // Step 1: Get player ID from platform
    console.log("\n🔍 Looking up player on-chain...");
    const playerObjId = await getPlayerObjectIdFromPlatform(playerInfo.name);
    if (!playerObjId) {
      console.error(`   ❌ Player not found on-chain: ${playerInfo.name}`);
      return false;
    }
    console.log(`   ✅ Player ID: ${playerObjId}`);

    // Step 2: Fetch current player data from platform table
    console.log(`   🔍 Fetching player data from platform...`);

    const platformId = SUI_CONFIG.contracts.platformObjectId;
    const platform = await rpcClient.getObject({
      id: platformId,
      options: { showContent: true },
    });

    const platformContent = platform?.data?.content as any;
    const playersTableId = platformContent?.fields?.players?.fields?.id?.id;

    if (!playersTableId) {
      console.error(`   ❌ Could not find players table`);
      return false;
    }

    // Query the player from the players table
    const playerField = await rpcClient.getDynamicFieldObject({
      parentId: playersTableId,
      name: {
        type: "0x2::object::ID",
        value: playerObjId,
      },
    });

    if (!playerField?.data) {
      console.error(`   ❌ Could not fetch player data`);
      return false;
    }

    const onChainPlayerData = (playerField.data.content as any)?.fields?.value
      ?.fields;
    if (!onChainPlayerData) {
      console.error(`   ❌ Could not parse player data`);
      return false;
    }

    const previousBaseMist = BigInt(onChainPlayerData.base_value);
    const frontendCurrentValue =
      (Number(previousBaseMist) / 1_000_000_000) * 1000;

    console.log(
      `   📊 Current base value: ${
        Number(previousBaseMist) / 1_000_000_000
      } SUI`
    );

    // Step 3: Run AI Analysis
    console.log("\n🤖 Running AI analysis...");
    const aiAnalysis = await analyzePlayer({
      name: playerInfo.name,
      position: playerInfo.position,
      team: playerInfo.club,
      goals: seasonStats.goals,
      assists: seasonStats.assists,
      minutesPlayed: seasonStats.minutesPlayed,
      matchesPlayed: seasonStats.matchesPlayed,
      currentValue: frontendCurrentValue,
      weeklyChange: playerInfo.weeklyChange,
      season: season,
    });

    console.log(`   AI Score: ${aiAnalysis.performance_score}/100`);
    console.log(`   Trend: ${aiAnalysis.performance_trend}`);
    console.log(`   Form: ${aiAnalysis.form_status}`);

    // Step 4: Calculate new base value
    const newBaseValue = calculateBaseValue(
      aiAnalysis.performance_score,
      frontendCurrentValue
    );

    console.log(
      `\n💰 New base value: ${Number(newBaseValue) / 1_000_000_000} SUI`
    );
    const changePercent =
      Number(previousBaseMist) > 0
        ? ((Number(newBaseValue) - Number(previousBaseMist)) /
            Number(previousBaseMist)) *
          100
        : 0;
    console.log(
      `   📈 Change: ${changePercent > 0 ? "+" : ""}${changePercent.toFixed(
        2
      )}%`
    );

    // Step 5: Create data hash
    const timestamp = Date.now();
    const rating = Math.round(
      (aiAnalysis.recent_form?.goals_per_90 || 0) * 100
    );

    // Step 6: Upload to Walrus
    console.log("\n📦 Uploading to Walrus...");
    const blobId = await walrusClient.uploadPlayerPerformance(
      playerInfo.id,
      playerInfo.name,
      playerInfo.club,
      playerInfo.position,
      playerInfo.nationality ?? "Unknown",
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
      Number(newBaseValue)
    );

    console.log(`   ✅ Walrus Blob ID: ${blobId}`);

    // Step 7: Update on-chain
    console.log("\n⛓️  Updating on Sui blockchain...");

    const tx = new Transaction();
    const clockId = await getClockObjectId();

    // UPDATED: Now takes AdminCap and player_id as first arguments
    tx.moveCall({
      target: `${SUI_CONFIG.contracts.packageId}::valor::update_base_value`,
      arguments: [
        tx.object(SUI_CONFIG.contracts.adminCapId), // AdminCap
        tx.object(SUI_CONFIG.contracts.platformObjectId), // Platform
        tx.pure.address(playerObjId), // player_id (ID)
        tx.pure.u64(newBaseValue), // new_base_value
        tx.pure.u64(aiAnalysis.performance_score), // performance_score
        tx.pure.u64(seasonStats.goals), // goals
        tx.pure.u64(seasonStats.assists), // assists
        tx.pure.u64(rating), // rating
        tx.pure.u64(seasonStats.minutesPlayed), // minutes_played
        tx.pure.u64(0), // clean_sheets
        tx.pure.string(blobId), // walrus_blob_id
        tx.object(clockId), // clock
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
    console.error(`\n❌ Failed to update ${playerInfo.name}:`, error.message);
    return false;
  }
}

// ============================================================================
// Main Script
// ============================================================================

async function main() {
  console.log("🔄 Valor Base Value Update Script");
  console.log("=".repeat(70));

  const { season, playersToUpdate } = parseArgs();

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
    const success = await updatePlayer(player, season, keypair);
    results.push({ player: player.name, success });

    // Rate limiting
    if (playersToProcess.indexOf(player) < playersToProcess.length - 1) {
      console.log("\n⏳ Waiting 2s before next update...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
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

main().catch((error) => {
  console.error("\n❌ Script failed:", error);
  process.exit(1);
});

export { updatePlayer };
