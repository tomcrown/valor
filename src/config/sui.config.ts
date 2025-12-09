// ============================================================================
// FILE: config/sui.config.ts
// Sui network and contract configuration
// ============================================================================

export const SUI_CONFIG = {
  // Network Configuration
  network: "testnet" as const,
  rpcUrl: "https://fullnode.testnet.sui.io:443",
  graphqlUrl: "https://sui-testnet.mystenlabs.com/graphql",

  // Walrus Configuration
  walrus: {
    publisherUrl:
      process.env.VITE_WALRUS_PUBLISHER_URL ||
      "https://publisher.walrus-testnet.walrus.space",
    aggregatorUrl:
      process.env.VITE_WALRUS_AGGREGATOR_URL ||
      "https://aggregator.walrus-testnet.walrus.space",
    epochs: 5, // How long to store on Walrus
  },

  // Contract Configuration (UPDATE THESE AFTER DEPLOYMENT)
  contracts: {
    packageId:
      process.env.VITE_PACKAGE_ID ||
      "0xe181c7e7bd955d5290bb46756f989337dc41a7f7159fd96bd7a2fef75546bfcf", // Your deployed package ID
    platformObjectId:
      process.env.VITE_PLATFORM_ID ||
      "0x2f43ffcec2bf257403e8ca79a4425599e015c6ab0b8d702b565f2822b525acfa", // Platform shared object
    adminCapId:
      process.env.VITE_ADMIN_CAP_ID ||
      "0x17893933dedeb79a0b834500b97101df8bc3de05417e46066c1416d9e1fcce6a", // AdminCap object ID
  },

  // Gas Configuration
  gas: {
    budget: 100_000_000, // 0.1 SUI max gas
    price: 1000,
  },

  // Market Configuration
  market: {
    defaultShares: 1000, // Default total shares per player
    minBaseValue: 1_000_000, // 0.001 SUI minimum (in MIST)
    maxBaseValue: 1_000_000_000_000, // 1M SUI maximum (in MIST)
  },
} as const;

// Type-safe config access
export type SuiNetwork = typeof SUI_CONFIG.network;

// Helper to convert SUI to MIST
export const suiToMist = (sui: number): bigint => {
  return BigInt(Math.floor(sui * 1_000_000_000));
};

// Helper to convert MIST to SUI
export const mistToSui = (mist: bigint | number): number => {
  return Number(mist) / 1_000_000_000;
};

// Validate configuration
export function validateConfig(): void {
  const { packageId, platformObjectId, adminCapId } = SUI_CONFIG.contracts;

  if (packageId === "0x0") {
    console.warn("⚠️  PACKAGE_ID not configured. Run deployment first.");
  }
  if (platformObjectId === "0x0") {
    console.warn("⚠️  PLATFORM_ID not configured. Run deployment first.");
  }
  if (adminCapId === "0x0") {
    console.warn("⚠️  ADMIN_CAP_ID not configured. Run deployment first.");
  }
}
