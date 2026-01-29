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
      "0xf5b1034c40ab3b1f778e0f44b917ea2f27e2352fc76960203e26b2e31c8c8e18",

    platformObjectId:
      getEnv("VITE_PLATFORM_ID") ||
      "0x7089285cff5558cc23ed44ba1599296d3c260aa3aa98d745d6bf78d82f2c4456",

    adminCapId:
      getEnv("VITE_ADMIN_CAP_ID") ||
      "0x7e761ce1c02a1b77e55b144d8003a3545f2fc5549b17e0e6f5936d3474a5b46a",

    nftRegistryObjectId:
      getEnv("VITE_NFT_REGISTRY_ID") ||
      "0xda9db7b3c413c13832f13d03913d42c97a9322c3f616930f2afdc5a4b06262f2",
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
