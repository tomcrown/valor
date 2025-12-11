// export const SUI_CONFIG = {
//   network: "testnet" as const,
//   rpcUrl: "https://fullnode.testnet.sui.io:443",
//   graphqlUrl: "https://graphql.testnet.sui.io/graphql",

//   walrus: {
//     publisherUrl:
//       import.meta?.env?.VITE_WALRUS_PUBLISHER_URL ??
//       process.env.VITE_WALRUS_PUBLISHER_URL ??
//       "https://publisher.walrus-testnet.walrus.space",

//     aggregatorUrl:
//       import.meta?.env?.VITE_WALRUS_AGGREGATOR_URL ??
//       process.env.VITE_WALRUS_AGGREGATOR_URL ??
//       "https://aggregator.walrus-testnet.walrus.space",

//     epochs: 5,
//   },
//   contracts: {
//     packageId:
//       import.meta?.env?.VITE_PACKAGE_ID ??
//       process.env.VITE_PACKAGE_ID ??
//       "0xf7f467c8a4fd18a89b80d31cfda1c7b00d30430dbe591b442690787b3327283c",

//     platformObjectId:
//       import.meta?.env?.VITE_PLATFORM_ID ??
//       process.env.VITE_PLATFORM_ID ??
//       "0x28e1ec862868cdfc5bcc0f6a01fd531cf3d3aa38f1bdc602f474e0e04406d41f",

//     adminCapId:
//       import.meta?.env?.VITE_ADMIN_CAP_ID ??
//       process.env.VITE_ADMIN_CAP_ID ??
//       "0xe5226492165ed9e21dfe96ee27414a199bb7695e7d0eacd454892a876c8429f8",
//   },
//   gas: {
//     budget: 100_000_000,
//     price: 1000,
//   },

//   market: {
//     defaultShares: 1000,
//     minBaseValue: 1_000_000,
//     maxBaseValue: 1_000_000_000_000,
//   },
// } as const;

// export type SuiNetwork = typeof SUI_CONFIG.network;

// export const suiToMist = (sui: number): bigint => {
//   return BigInt(Math.floor(sui * 1_000_000_000));
// };

// export const mistToSui = (mist: bigint | number): number => {
//   return Number(mist) / 1_000_000_000;
// };

// export function validateConfig(): void {
//   const { packageId, platformObjectId, adminCapId } = SUI_CONFIG.contracts;

//   if (packageId === "0x0") {
//     console.warn("⚠️ PACKAGE_ID not configured.");
//   }
//   if (platformObjectId === "0x0") {
//     console.warn("⚠️ PLATFORM_ID not configured.");
//   }
//   if (adminCapId === "0x0") {
//     console.warn("⚠️ ADMIN_CAP_ID not configured.");
//   }
// }

export const SUI_CONFIG = {
  network: "testnet" as const,
  rpcUrl: "https://fullnode.testnet.sui.io:443",
  explorerUrl: "https://suiscan.xyz/testnet",
  graphqlUrl: "https://graphql.testnet.sui.io/graphql",

  walrus: {
    publisherUrl:
      import.meta.env.VITE_WALRUS_PUBLISHER_URL ??
      "https://publisher.walrus-testnet.walrus.space",

    aggregatorUrl:
      import.meta.env.VITE_WALRUS_AGGREGATOR_URL ??
      "https://aggregator.walrus-testnet.walrus.space",

    epochs: 5,
  },

  contracts: {
    packageId:
      import.meta.env.VITE_PACKAGE_ID ??
      "0xf7f467c8a4fd18a89b80d31cfda1c7b00d30430dbe591b442690787b3327283c",

    platformObjectId:
      import.meta.env.VITE_PLATFORM_ID ??
      "0x28e1ec862868cdfc5bcc0f6a01fd531cf3d3aa38f1bdc602f474e0e04406d41f",

    adminCapId:
      import.meta.env.VITE_ADMIN_CAP_ID ??
      "0xe5226492165ed9e21dfe96ee27414a199bb7695e7d0eacd454892a876c8429f8",
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
