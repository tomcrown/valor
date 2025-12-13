import dotenv from "dotenv";
dotenv.config();
import { Transaction } from "@mysten/sui/transactions";
import { FOOTBALL_PLAYERS, type SeasonPeriod } from "../data/apiData.ts";
import { SUI_CONFIG } from "../config/sui.config.ts";
import {
  rpcClient,
  loadAdminKeypair,
  executeTransaction,
  getClockObjectId,
} from "../lib/suiClient.ts";
import { walrusClient } from "../lib/walrusClient.ts";
import { analyzePlayer } from "../lib/openai.ts";
import {
  calculateMidCurrentSeasonValue,
  getPreviousSeasonStats,
  mistToSui,
} from "../lib/valueCalculator.ts";

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

function seasonToContractCode(season: SeasonPeriod): number {
  switch (season) {
    case "early":
      return 0;
    case "mid":
      return 1;
    case "current":
      return 2;
    default:
      throw new Error(`Invalid season: ${season}`);
  }
}

async function getPlayerObjectIdFromPlatform(
  playerName: string
): Promise<string | null> {
  try {
    const platformId = SUI_CONFIG.contracts.platformObjectId;

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

    try {
      const allFields = await rpcClient.getDynamicFields({
        parentId: tableId,
      });

      console.log(
        `   📊 Found ${allFields.data.length} total players in table`
      );

      const matchingField = allFields.data.find(
        (f) => String(f.name.value).toLowerCase() === playerName.toLowerCase()
      );

      if (matchingField) {
        console.log(
          `   ✅ Found matching field for: ${matchingField.name.value}`
        );

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

async function updatePlayer(
  playerInfo: (typeof FOOTBALL_PLAYERS)[0],
  season: SeasonPeriod,
  keypair: ReturnType<typeof loadAdminKeypair>
): Promise<boolean> {
  try {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`📊 Updating: ${playerInfo.name}`);
    console.log("=".repeat(70));

    if (season === "early") {
      console.error(`\n❌ Cannot update early season values!`);
      console.log(`   Early season values are set once during registration`);
      return false;
    }

    const currentSeasonStats = playerInfo.seasonalStats[season];
    const previousSeasonStats = getPreviousSeasonStats(
      playerInfo.seasonalStats,
      season
    );

    console.log(`📅 Season: ${season.toUpperCase()}`);
    console.log(`   Position: ${playerInfo.position}`);
    console.log(`\n📊 Current Season Stats:`);
    console.log(`   Goals: ${currentSeasonStats.goals}`);
    console.log(`   Assists: ${currentSeasonStats.assists}`);
    console.log(`   Matches: ${currentSeasonStats.matchesPlayed}`);
    console.log(`\n📊 Previous Season Stats:`);
    console.log(`   Goals: ${previousSeasonStats.goals}`);
    console.log(`   Assists: ${previousSeasonStats.assists}`);
    console.log(`   Matches: ${previousSeasonStats.matchesPlayed}`);

    console.log("\n🔍 Looking up player on-chain...");
    const playerObjId = await getPlayerObjectIdFromPlatform(playerInfo.name);
    if (!playerObjId) {
      console.error(`   ❌ Player not found on-chain: ${playerInfo.name}`);
      return false;
    }
    console.log(`   ✅ Player ID: ${playerObjId}`);

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
    console.log(
      `   📊 Current on-chain base: ${mistToSui(previousBaseMist).toFixed(
        4
      )} SUI`
    );

    console.log("\n🤖 Running AI analysis...");
    const frontendCurrentValue =
      (Number(previousBaseMist) / 1_000_000_000) * 1000;

    const aiAnalysis = await analyzePlayer({
      name: playerInfo.name,
      position: playerInfo.position,
      team: playerInfo.club,
      goals: currentSeasonStats.goals,
      assists: currentSeasonStats.assists,
      minutesPlayed: currentSeasonStats.minutesPlayed,
      matchesPlayed: currentSeasonStats.matchesPlayed,
      currentValue: frontendCurrentValue,
      weeklyChange: 0,
      season: season,
    });

    console.log(`   ✅ AI Score: ${aiAnalysis.performance_score}/100`);
    console.log(`   📈 Trend: ${aiAnalysis.performance_trend}`);
    console.log(`   🎯 Form: ${aiAnalysis.form_status}`);

    console.log(`\n💰 Calculating new base value...`);
    const newBaseValue = calculateMidCurrentSeasonValue(
      previousBaseMist,
      aiAnalysis.performance_score,
      currentSeasonStats,
      previousSeasonStats
    );

    const changePercent =
      Number(previousBaseMist) > 0
        ? ((Number(newBaseValue) - Number(previousBaseMist)) /
            Number(previousBaseMist)) *
          100
        : 0;

    console.log(`\n✅ Value Update Summary:`);
    console.log(
      `   Old: ${mistToSui(previousBaseMist).toFixed(
        4
      )} SUI (${previousBaseMist} MIST)`
    );
    console.log(
      `   New: ${mistToSui(newBaseValue).toFixed(4)} SUI (${newBaseValue} MIST)`
    );
    console.log(
      `   Change: ${changePercent > 0 ? "+" : ""}${changePercent.toFixed(2)}%`
    );

    const rating = Math.round(
      (aiAnalysis.recent_form?.goals_per_90 || 0) * 100
    );

    console.log("\n📦 Uploading to Walrus...");
    const blobId = await walrusClient.uploadPlayerPerformance(
      playerInfo.id,
      playerInfo.name,
      playerInfo.club,
      playerInfo.position,
      playerInfo.nationality ?? "Unknown",
      season,
      {
        goals: currentSeasonStats.goals,
        assists: currentSeasonStats.assists,
        minutes_played: currentSeasonStats.minutesPlayed,
        matches_played: currentSeasonStats.matchesPlayed,
        rating: aiAnalysis.recent_form?.goals_per_90,
        clean_sheets: 0,
      },
      aiAnalysis,
      Number(newBaseValue)
    );

    console.log(`   ✅ Walrus Blob ID: ${blobId}`);

    console.log("\n⛓️  Updating on Sui blockchain...");

    const tx = new Transaction();
    const clockId = await getClockObjectId();
    const seasonCode = seasonToContractCode(season);

    tx.moveCall({
      target: `${SUI_CONFIG.contracts.packageId}::valor::update_base_value`,
      arguments: [
        tx.object(SUI_CONFIG.contracts.adminCapId),
        tx.object(SUI_CONFIG.contracts.platformObjectId),
        tx.pure.address(playerObjId),
        tx.pure.u8(seasonCode),
        tx.pure.u64(newBaseValue),
        tx.pure.u64(aiAnalysis.performance_score),
        tx.pure.u64(currentSeasonStats.goals),
        tx.pure.u64(currentSeasonStats.assists),
        tx.pure.u64(rating),
        tx.pure.u64(currentSeasonStats.minutesPlayed),
        tx.pure.u64(0),
        tx.pure.string(blobId),
        tx.object(clockId),
      ],
    });

    tx.setGasBudget(SUI_CONFIG.gas.budget);

    const result = await executeTransaction(tx, keypair);

    if (result.success) {
      console.log(`   ✅ Update successful!`);
      console.log(`   📝 Digest: ${result.digest}`);
      console.log(
        `   🎯 Season updated: ${season.toUpperCase()} (code: ${seasonCode})`
      );

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

async function main() {
  console.log("🔄 Valor Base Value Update Script (Performance-Based)");
  console.log("=".repeat(70));

  const { season, playersToUpdate } = parseArgs();

  // Validate season
  if (season === "early") {
    console.error(`\n❌ ERROR: Cannot update early season values!`);
    console.log(
      `   Early season values are set once during player registration`
    );
    console.log(`   Use: ts-node scripts/registerPlayers.ts --season early`);
    process.exit(1);
  }

  console.log(`\n📅 Season Period: ${season.toUpperCase()}`);
  console.log(`   Season Code: ${seasonToContractCode(season)}`);
  console.log(`🌐 Network: ${SUI_CONFIG.network}`);
  console.log(`📦 Package ID: ${SUI_CONFIG.contracts.packageId}`);
  console.log(`\n💡 Update Formula:`);
  console.log(`   • AI Score drives base trend (-50% to +50%)`);
  console.log(`   • Performance delta (goals/assists) adds bonus`);
  console.log(`   • Consistency factor (matches played) applies multiplier`);
  console.log(`   • Max change: ±60% per season (safety bounds)`);

  console.log("\n🔑 Loading admin keypair...");
  const keypair = loadAdminKeypair();
  const address = keypair.getPublicKey().toSuiAddress();
  console.log(`   Admin address: ${address}`);

  const balance = await rpcClient.getBalance({ owner: address });
  console.log(
    `   Balance: ${Number(balance.totalBalance) / 1_000_000_000} SUI`
  );

  if (Number(balance.totalBalance) < 50_000_000) {
    throw new Error("Insufficient balance. Need at least 0.05 SUI for gas.");
  }

  let playersToProcess = FOOTBALL_PLAYERS;
  if (playersToUpdate.length > 0) {
    playersToProcess = FOOTBALL_PLAYERS.filter((p) =>
      playersToUpdate.some(
        (name) =>
          p.name.toLowerCase().includes(name.toLowerCase()) || p.id === name
      )
    );
    console.log(`\n📋 Updating ${playersToProcess.length} specific players`);
  } else {
    console.log(`\n📋 Updating all ${playersToProcess.length} players`);
  }

  const results: Array<{ player: string; success: boolean }> = [];

  for (const player of playersToProcess) {
    const success = await updatePlayer(player, season, keypair);
    results.push({ player: player.name, success });

    if (playersToProcess.indexOf(player) < playersToProcess.length - 1) {
      console.log("\n⏳ Waiting 2s before next update...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

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
