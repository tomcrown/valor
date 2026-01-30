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
      "0xefa176c71da674b46125add13701be72e5550a9c54f9164f830c0cd2bcdfc743",

    platformObjectId:
      getEnv("VITE_PLATFORM_ID") ||
      "0x45c3686342e51f92b274b016579cee651f360d38189d0de38e46afa434d046c1",

    adminCapId:
      getEnv("VITE_ADMIN_CAP_ID") ||
      "0x5a6bcd76f576cf5e4f0c9fe54d8563feeda5d1433d6fd151078a9717883899d9",

    nftRegistryObjectId:
      getEnv("VITE_NFT_REGISTRY_ID") ||
      "0xd8dff55c791ca8a0119d4e5051dbec0f9d1cb55de3f4c4fd9d76d3be30f372a8",
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
