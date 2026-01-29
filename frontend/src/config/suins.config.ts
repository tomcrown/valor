// Helper function to get env vars
function getEnv(key: string, fallback: string = ""): string {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env[key] ?? fallback;
  }
  return process.env[key] ?? fallback;
}

export const SUINS_CONFIG = {
  network: "testnet" as const,

  // SuiNS Testnet Package IDs (from official docs)
  packageId:
    "0x22fa05f21b1ad71442491220bb9338f7b7095fe35000ef88d5400d28523bdd93",
  registryId:
    "0xb120c0d55432630fce61f7854795a3463deb6e3b443cc4ae72e1282073ff56e4",
  reverseRegistryId:
    "0xcee9dbb070db70936c3a374439a6adb16f3ba97eac5468d2e1e6fff6ed93e465",

  // Cache configuration
  cache: {
    enabled: true,
    ttlSeconds: 300, // 5 minutes
  },
} as const;
