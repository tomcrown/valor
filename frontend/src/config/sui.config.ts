// Helper function to get env vars that works in both Vite and Node.js
function getEnv(key: string, fallback: string = ""): string {
  // In browser/Vite, use import.meta.env
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key] ?? fallback;
  }
  // In Node.js, use process.env
  return process.env[key] ?? fallback;
}

export const SUI_CONFIG = {
  network: "testnet" as const,
  rpcUrl: "https://fullnode.testnet.sui.io:443",
  explorerUrl: "https://suiscan.xyz/testnet",
  graphqlUrl: "https://graphql.testnet.sui.io/graphql",

  walrus: {
    publisherUrl:
      getEnv("VITE_WALRUS_PUBLISHER_URL") ||
      "https://publisher.walrus-testnet.walrus.space",

    aggregatorUrl:
      getEnv("VITE_WALRUS_AGGREGATOR_URL") ||
      "https://aggregator.walrus-testnet.walrus.space",

    epochs: 40,
  },

  contracts: {
    packageId:
      getEnv("VITE_PACKAGE_ID") ||
      "0x859118df66d44154d0d292e27538fde1a4ef1d689d9089100ba0a56b219f2dfb",

    platformObjectId:
      getEnv("VITE_PLATFORM_ID") ||
      "0x80379e0215923007f1ed00bde382a61acc186d34577a911a590e51866de4c257",

    adminCapId:
      getEnv("VITE_ADMIN_CAP_ID") ||
      "0xb9f6417dae5dd603e21b5c517eff252341e7dd80fb0687c2a9492016c6e423ea",
  },

  gas: {
    budget: 100_000_000,
    price: 1000,
  },

  market: {
    defaultShares: 1000,
    minBaseValue: 1_000_000,
    maxBaseValue: 1_000_000_000_000,
  },
} as const;

export const suiToMist = (sui: number): bigint => {
  return BigInt(Math.floor(sui * 1_000_000_000));
};

export const mistToSui = (mist: bigint | number): number => {
  return Number(mist) / 1_000_000_000;
};
