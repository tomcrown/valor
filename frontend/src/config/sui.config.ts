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
      "0x91c1cb8f6079b95e161948024351d98f64f04b89612262edea22f82fefa8eef3",

    platformObjectId:
      getEnv("VITE_PLATFORM_ID") ||
      "0xc0801fd0b7224b61685c7f517ee2a9e69f83f2e4354488a7655718f7056b5985",

    adminCapId:
      getEnv("VITE_ADMIN_CAP_ID") ||
      "0x5da72bd920f20257811a3c950244a018455b544bc295aa28cd0cdb58784d64a6",

    nftRegistryObjectId:
      getEnv("VITE_NFT_REGISTRY_ID") ||
      "0xb44b9db07a1aca9e91b64d3cfc46cbd7b7f99257fbecdb4a55bff4bd26f79c48",
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
