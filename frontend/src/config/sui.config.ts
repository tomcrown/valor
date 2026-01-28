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
      "0x4807d6cfa171f8bb1a771d3dbed73477fb0de34f7be1e1947aeb20e195371474",

    platformObjectId:
      getEnv("VITE_PLATFORM_ID") ||
      "0xa306489244efce6291f95be4aa14d7d616bde60c7570c9c22a83b4480590045d",

    adminCapId:
      getEnv("VITE_ADMIN_CAP_ID") ||
      "0x1bcb895e3eb749f011d5421e842ef908fdd96f28873c089a3f6a00ced4deb59f",

    nftRegistryObjectId:
      getEnv("VITE_NFT_REGISTRY_ID") ||
      "0x180b042df08e13ef528b2571ff7124ff5d123c63c0711fe685ef64fbcf659713",
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
