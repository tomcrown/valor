export const SUI_CONFIG = {
  network: "testnet" as const,
  rpcUrl: "https://fullnode.testnet.sui.io:443",
  graphqlUrl: "https://graphql.testnet.sui.io/graphql",

  walrus: {
    publisherUrl:
      import.meta.env.VITE_WALRUS_PUBLISHER_URL ||
      "https://publisher.walrus-testnet.walrus.space",
    aggregatorUrl:
      import.meta.env.VITE_WALRUS_AGGREGATOR_URL ||
      "https://aggregator.walrus-testnet.walrus.space",
    epochs: 5,
  },

  contracts: {
    packageId:
      import.meta.env.VITE_PACKAGE_ID ||
      "0x4ed3ddacf81f5a1883e4ca712175f776f5d8e4b9ebc098a7b03ac79761db5fd0",
    platformObjectId:
      import.meta.env.VITE_PLATFORM_ID ||
      "0x665e1288322f8856a75ef0d3cd5c549ad8b96c3568b096efadd4828a54879373",
    adminCapId:
      import.meta.env.VITE_ADMIN_CAP_ID ||
      "0x867fb6c62c2a6cef84cb21ebceeda0acc30b396b55073c2514eb72d062b8b692",
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

export type SuiNetwork = typeof SUI_CONFIG.network;

export const suiToMist = (sui: number): bigint => {
  return BigInt(Math.floor(sui * 1_000_000_000));
};

export const mistToSui = (mist: bigint | number): number => {
  return Number(mist) / 1_000_000_000;
};

export function validateConfig(): void {
  const { packageId, platformObjectId, adminCapId } = SUI_CONFIG.contracts;

  if (packageId === "0x0") {
    console.warn("⚠️ PACKAGE_ID not configured.");
  }
  if (platformObjectId === "0x0") {
    console.warn("⚠️ PLATFORM_ID not configured.");
  }
  if (adminCapId === "0x0") {
    console.warn("⚠️ ADMIN_CAP_ID not configured.");
  }
}
