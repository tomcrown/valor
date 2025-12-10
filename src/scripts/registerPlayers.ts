#!/usr/bin/env ts-node
// ============================================================================
// FILE: scripts/registerPlayers.ts
// Register players on-chain from dummyData.ts
// Usage:
//   ts-node scripts/registerPlayers.ts --season early --baseValues "Haaland=0.1,Saka=0.07"
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
  getPlatformState,
  parsePlayerData,
} from "../lib/suiClient.ts";
import { walrusClient } from "../lib/walrusClient.ts";
import { analyzePlayer, type AIAnalysis } from "../lib/openai.ts";

// ============================================================================
// Helpers: parse CLI baseValues string and conversions
// ============================================================================

function parseArgs() {
  const args = process.argv.slice(2);
  let season: SeasonPeriod = "current";
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

/**
 * Parse "Haaland=0.1,Messi=0.12" => { haaland: 0.1, messi: 0.12 }
 * Keys lower-cased for flexible matching.
 */
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
      console.warn(`Warning: invalid base value for ${rawName}: ${rawVal}`);
      continue;
    }
    out[name] = val;
  }
  return out;
}

/**
 * Find matching base value for a player name
 * Supports partial matching (e.g., "Haaland" matches "Erling Haaland")
 */
function findBaseValueForPlayer(
  playerName: string,
  manualBaseValues: Record<string, number>
): number | null {
  const lowerPlayerName = playerName.toLowerCase();

  // Try exact match first
  if (manualBaseValues[lowerPlayerName] != null) {
    return manualBaseValues[lowerPlayerName];
  }

  // Try partial match - check if any key is contained in the player name
  for (const [key, value] of Object.entries(manualBaseValues)) {
    if (lowerPlayerName.includes(key)) {
      return value;
    }
  }

  return null;
}

/** Convert SUI number -> MIST bigint */
function suiToMistBigInt(sui: number): bigint {
  return BigInt(Math.floor(sui * 1_000_000_000));
}

/** Convert on-chain base_value (MIST bigint) -> frontend "currentValue" */
function onChainBaseMistToFrontendCurrentValue(baseValueMist: bigint): number {
  const baseInSui = Number(baseValueMist) / 1_000_000_000;
  return baseInSui * 1000;
}

// ============================================================================
// Calculate Base Value from AI Score
// ============================================================================

function calculateBaseValue(aiScore: number, currentValue: number): bigint {
  const baseInSui = currentValue / 1000;
  const adjustedForAI = baseInSui * (aiScore / 100);

  const finalValue = Math.max(
    Number(SUI_CONFIG.market.minBaseValue),
    Math.min(
      adjustedForAI * 1_000_000_000,
      Number(SUI_CONFIG.market.maxBaseValue)
    )
  );

  return BigInt(Math.floor(finalValue));
}

// ============================================================================
// Helper: fetch on-chain player object id from platform.player_names table
// ============================================================================

async function getPlayerObjectIdFromPlatform(
  playerName: string
): Promise<string | null> {
  try {
    const platformJson = (await getPlatformState()) as Record<string, any>;

    const tryPaths = [
      platformJson?.player_names,
      platformJson?.fields?.player_names,
      platformJson?.contents?.json?.player_names,
      platformJson?.contents?.json?.fields?.player_names,
    ];

    for (const candidate of tryPaths) {
      if (!candidate) continue;

      // Case 1: plain object mapping
      if (typeof candidate === "object" && !Array.isArray(candidate)) {
        const lower = playerName.toLowerCase();
        for (const [k, v] of Object.entries(candidate)) {
          if (k.toLowerCase() === lower) return String(v);
        }
      }

      // Case 2: entries array
      if (Array.isArray(candidate)) {
        for (const entry of candidate) {
          const key = entry?.key ?? entry?.name ?? entry?.k ?? null;
          let value = entry?.value ?? entry?.v ?? null;
          if (!key || !value) continue;

          if (String(key).toLowerCase() === playerName.toLowerCase()) {
            if (typeof value === "string") return value;
            if (typeof value === "object" && value.objectId)
              return value.objectId;
            if (typeof value === "object" && value.id) return value.id;
          }
        }
      }
    }

    return null;
  } catch (err) {
    console.error("Failed to read platform.player_names:", err);
    return null;
  }
}

// ============================================================================
// Register Single Player
// ============================================================================

async function registerPlayer(
  playerData: (typeof DUMMY_PLAYERS)[0],
  season: SeasonPeriod,
  keypair: ReturnType<typeof loadAdminKeypair>,
  manualBaseValues: Record<string, number>
): Promise<{ success: boolean; playerId?: string; blobId?: string }> {
  try {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`🏃 Registering: ${playerData.name}`);
    console.log("=".repeat(70));

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

    // Step 2: Determine base value
    let baseValueMist: bigint;

    // FIXED: Use partial matching function
    const manualValue = findBaseValueForPlayer(
      playerData.name,
      manualBaseValues
    );

    if (season === "early" && manualValue != null) {
      // Manual override in SUI
      baseValueMist = suiToMistBigInt(manualValue);
      console.log(
        `\n💰 EARLY - manual base value: ${manualValue} SUI (${baseValueMist} MIST)`
      );
    } else if (season === "early") {
      // No manual value -> use AI calculation
      baseValueMist = calculateBaseValue(
        aiAnalysis.performance_score,
        playerData.currentValue
      );
      console.log(
        `\n💰 EARLY - AI calculated base value: ${
          Number(baseValueMist) / 1_000_000_000
        } SUI`
      );
    } else {
      // MID or CURRENT -> fetch previous on-chain base_value
      console.log("\n🔎 Fetching previous on-chain base value...");
      const playerObjId = await getPlayerObjectIdFromPlatform(playerData.name);
      if (!playerObjId) {
        throw new Error(
          `Player object ID not found on-chain for ${playerData.name}`
        );
      }

      const onChainObj = await rpcClient.getObject({
        id: playerObjId,
        options: { showContent: true },
      });

      const parsed = parsePlayerData(onChainObj);
      if (!parsed) {
        throw new Error(
          `Failed to parse on-chain Player object for ${playerData.name}`
        );
      }

      const previousBaseMist: bigint = parsed.base_value;
      console.log(
        `   🔁 Previous on-chain base value: ${
          Number(previousBaseMist) / 1_000_000_000
        } SUI`
      );

      const frontendCurrentValue =
        onChainBaseMistToFrontendCurrentValue(previousBaseMist);
      baseValueMist = calculateBaseValue(
        aiAnalysis.performance_score,
        frontendCurrentValue
      );
      console.log(
        `\n💰 ${season.toUpperCase()} - AI adjusted base value: ${
          Number(baseValueMist) / 1_000_000_000
        } SUI`
      );
    }

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
      Number(baseValueMist)
    );

    console.log(`   ✅ Walrus Blob ID: ${blobId}`);

    // Step 5: Register on-chain
    console.log("\n⛓️  Registering on Sui blockchain...");

    const tx = new Transaction();
    const clockId = await getClockObjectId();
    const imageUrl = playerData.imageUrl ?? "";

    // Move contract signature:
    // register_player(_: &AdminCap, platform: &mut Platform, name: vector<u8>,
    //                 team: vector<u8>, position: vector<u8>, image_url: vector<u8>,
    //                 base_value: u64, total_shares: u64, clock: &Clock)

    tx.moveCall({
      target: `${SUI_CONFIG.contracts.packageId}::valor::register_player`,
      arguments: [
        tx.object(SUI_CONFIG.contracts.adminCapId),
        tx.object(SUI_CONFIG.contracts.platformObjectId),
        tx.pure.string(playerData.name),
        tx.pure.string(playerData.club),
        tx.pure.string(playerData.position),
        tx.pure.string(imageUrl),
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
  console.log("🚀 Valor Player Registration Script");
  console.log("=".repeat(70));

  const { season, playersToRegister, manualBaseValues } = parseArgs();

  console.log(`\n📅 Season Period: ${season.toUpperCase()}`);
  console.log(`🌐 Network: ${SUI_CONFIG.network}`);
  console.log(`📦 Package ID: ${SUI_CONFIG.contracts.packageId}`);
  console.log(`🏛️  Platform ID: ${SUI_CONFIG.contracts.platformObjectId}`);

  // Show manual base values if provided
  if (Object.keys(manualBaseValues).length > 0) {
    console.log(`\n💰 Manual Base Values (SUI):`);
    for (const [name, value] of Object.entries(manualBaseValues)) {
      console.log(`   ${name}: ${value} SUI`);
    }
  }

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

    // Rate limiting
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

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
}

export { registerPlayer, calculateBaseValue };
