import { Transaction } from "@mysten/sui/transactions";
import { loadAdminKeypair, rpcClient } from "../lib/suiClient.ts";
import { PULSE_CONFIG } from "../config/pulse.config.ts";
import dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

const PLAYERS = [
  {
    id: "0xd37a3c89148f35ae4fa4a8563a7b1331e48ae0f44747138a619816337b899f46",
    name: "Kylian Mbappé",
  },
  {
    id: "0xa174cf6afbeac33fd05e8841555c9ab5c198aeebba15dad64ab6c6cc61f3ab23",
    name: "Erling Haaland",
  },
  {
    id: "0x5500cf294534c99136d0b627b8eded2a1a77340c7639a4e5e0a56286f6cf8313",
    name: "Dominik Szoboszlai",
  },
  {
    id: "0x7c231306c09ac01edacc09dcd0217f0fd2826edb30c16f8046316e66a8d50594",
    name: "Jude Bellingham",
  },
  {
    id: "0xcffd108b75dbfb8884c9f3d9ce6dc9e660b030a6fd66c3b8073cedf87856cb92",
    name: "Harry Maguire",
  },
  {
    id: "0x495945e002970b3aa7ded30a7fbdecf5126a6841325795c231ceac0d5dda3cc8",
    name: "Mohamed Salah",
  },
  {
    id: "0x89e06ac2673c652605ad6e1a42f313186dfcb8c773c98d29d71c38073b91a125",
    name: "Bukayo Saka",
  },
  {
    id: "0x5ac2f9ee7409fad0524e1b73d295828731e6cbde12fb4e43df8de1f46ac3cd60",
    name: "David Raya",
  },
];

interface SentimentMapping {
  playerId: string;
  playerName: string;
  sentimentObjectId: string;
  week: number;
}

async function initializeWeeklyRound(weekNumber: number) {
  console.log(`\n🗳️  Initializing Week ${weekNumber} Voting Round...\n`);

  try {
    const adminKeypair = loadAdminKeypair();
    const adminCapId = process.env.PULSE_ADMIN_CAP_ID;
    const platformId = PULSE_CONFIG.platformObjectId;
    const packageId = PULSE_CONFIG.packageId;

    // Validate configuration
    if (!adminCapId) {
      throw new Error("PULSE_ADMIN_CAP_ID not set in .env file");
    }
    if (!platformId) {
      throw new Error("PULSE_PLATFORM_ID not set in .env file");
    }
    if (!packageId) {
      throw new Error("PULSE_PACKAGE_ID not set in .env file");
    }

    console.log("📋 Configuration:");
    console.log(`   Package ID:  ${packageId}`);
    console.log(`   Platform ID: ${platformId}`);
    console.log(`   Admin Cap:   ${adminCapId}`);

    console.log("\n🔍 Verifying platform object...");

    const platformObj = await rpcClient.getObject({
      id: platformId,
      options: { showContent: true },
    });

    if (!platformObj.data) {
      throw new Error(
        `Platform object ${platformId} not found. Did you deploy the contract?`
      );
    }

    console.log("   ✓ Platform object verified");

    console.log("\n📅 Creating weekly round...");
    const tx1 = new Transaction();

    tx1.moveCall({
      target: `${packageId}::pulse::create_weekly_round`,
      arguments: [
        tx1.object(adminCapId),
        tx1.object(platformId),
        tx1.pure.u64(weekNumber),
        tx1.pure.u64(7),
        tx1.object("0x6"),
      ],
    });

    const result1 = await rpcClient.signAndExecuteTransaction({
      transaction: tx1,
      signer: adminKeypair,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    if (result1.effects?.status?.status !== "success") {
      throw new Error(
        `Failed to create weekly round: ${result1.effects?.status?.error}`
      );
    }

    console.log(`   ✓ Round created: ${result1.digest}`);

    console.log("\n👥 Initializing player sentiments...");

    const sentimentMappings: SentimentMapping[] = [];

    for (const player of PLAYERS) {
      console.log(`   - ${player.name}...`);

      const tx = new Transaction();

      tx.moveCall({
        target: `${packageId}::pulse::init_player_sentiment`,
        arguments: [
          tx.object(adminCapId),
          tx.object(platformId),
          tx.pure.id(player.id),
          tx.pure.string(player.name),
          tx.object("0x6"),
        ],
      });

      const result = await rpcClient.signAndExecuteTransaction({
        transaction: tx,
        signer: adminKeypair,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
        },
      });

      if (result.effects?.status?.status !== "success") {
        console.error(`     ✗ Failed: ${result.effects?.status?.error}`);
        continue;
      }

      const objectChanges = result.objectChanges || [];
      let sentimentId: string | null = null;

      for (const change of objectChanges) {
        if (
          change.type === "created" &&
          (change as any).objectType?.includes("::pulse::PlayerSentiment")
        ) {
          sentimentId = change.objectId;
          break;
        }
      }

      if (sentimentId) {
        sentimentMappings.push({
          playerId: player.id,
          playerName: player.name,
          sentimentObjectId: sentimentId,
          week: weekNumber,
        });
        console.log(`     ✓ Sentiment created: ${sentimentId}`);
      } else {
        console.error(`     ✗ Could not find sentiment object in transaction`);
      }
    }

    if (sentimentMappings.length === 0) {
      throw new Error("No sentiments were created successfully");
    }
    console.log("\n💾 Saving sentiment mappings...");

    const outputPath = path.join(
      process.cwd(),
      "data",
      "pulse-sentiments.json"
    );
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`   ✓ Created directory: ${outputDir}`);
    }

    let allMappings: Record<number, SentimentMapping[]> = {};
    if (fs.existsSync(outputPath)) {
      const existing = fs.readFileSync(outputPath, "utf-8");
      allMappings = JSON.parse(existing);
      console.log(`   ✓ Loaded existing mappings`);
    }

    allMappings[weekNumber] = sentimentMappings;

    fs.writeFileSync(outputPath, JSON.stringify(allMappings, null, 2));
    console.log(`   ✓ Saved to ${outputPath}`);
    const configDir = path.join(process.cwd(), "config");

    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
      console.log(`   ✓ Created directory: ${configDir}`);
    }

    const tsConfigPath = path.join(configDir, "pulse-sentiments.generated.ts");

    const tsContent = `// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// Generated by init-pulse-week.ts
// Last updated: ${new Date().toISOString()}

export const PULSE_SENTIMENTS = ${JSON.stringify(
      allMappings,
      null,
      2
    )} as const;

// Current week
export const CURRENT_PULSE_WEEK = ${weekNumber};

// Quick lookup by player ID for current week
export const CURRENT_WEEK_SENTIMENTS: Record<string, string> = {
${sentimentMappings
  .map((m) => `  "${m.playerId}": "${m.sentimentObjectId}",`)
  .join("\n")}
};
`;

    fs.writeFileSync(tsConfigPath, tsContent);
    console.log(`   ✓ Generated TypeScript config: ${tsConfigPath}`);

    console.log("\n🎉 Week Initialization Complete!\n");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`Week Number:        ${weekNumber}`);
    console.log(`Players Initialized: ${PLAYERS.length}`);
    console.log(`Sentiments Created:  ${sentimentMappings.length}`);
    console.log("═══════════════════════════════════════════════════════");

    console.log("\n📋 Sentiment Object Mappings:");
    sentimentMappings.forEach((mapping) => {
      console.log(`   ${mapping.playerName}:`);
      console.log(`     Player ID:    ${mapping.playerId}`);
      console.log(`     Sentiment ID: ${mapping.sentimentObjectId}`);
    });

    console.log("\n✅ Users can now start voting!");
    console.log(`📁 Mappings saved to: ${outputPath}`);
    console.log(`📝 TypeScript config: ${tsConfigPath}`);
    console.log(
      `\n🔗 View on Explorer: https://suiscan.xyz/${
        process.env.SUI_NETWORK || "testnet"
      }/object/${platformId}`
    );

    return { weekNumber, sentimentMappings };
  } catch (error: any) {
    console.error("\n❌ Initialization failed:", error.message);

    if (error.message?.includes("CommandArgumentError")) {
      console.error(
        "\n💡 Tip: This error usually means the contract needs to be redeployed."
      );
      console.error(
        "   Run: cd contracts && sui client publish --gas-budget 100000000"
      );
      console.error("   Then update your .env with the new object IDs");
    }

    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const weekNumber = parseInt(process.argv[2] || "1");

  console.log("🚀 Starting Pulse Week Initialization");
  console.log(`📅 Week Number: ${weekNumber}\n`);

  initializeWeeklyRound(weekNumber)
    .then(() => {
      console.log("\n✨ Success! Your Pulse voting round is ready.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Failed to initialize week");
      process.exit(1);
    });
}

export { initializeWeeklyRound };
