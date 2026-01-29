import { SuinsClient } from "@mysten/suins";
import { SuiClient } from "@mysten/sui/client";
import { SUINS_CONFIG } from "@/config/suins.config";
import { SUI_CONFIG } from "@/config/sui.config";

// Singleton instance
let suinsClientInstance: SuinsClient | null = null;

// Name cache
interface NameCacheEntry {
  name: string | null;
  timestamp: number;
}

const nameCache = new Map<string, NameCacheEntry>();
const reverseNameCache = new Map<string, NameCacheEntry>();

const CACHE_TTL_MS = SUINS_CONFIG.cache.ttlSeconds * 1000;

/**
 * Get or create the SuiNS client singleton
 */
export function getSuinsClient(): SuinsClient {
  if (!suinsClientInstance) {
    const suiClient = new SuiClient({ url: SUI_CONFIG.rpcUrl });

    suinsClientInstance = new SuinsClient({
      client: suiClient,
      network: SUINS_CONFIG.network,
    });
  }

  return suinsClientInstance;
}

/**
 * Check if cache entry is still valid
 */
function isCacheValid(entry: NameCacheEntry | undefined): boolean {
  if (!entry || !SUINS_CONFIG.cache.enabled) return false;
  return Date.now() - entry.timestamp < CACHE_TTL_MS;
}

/**
 * Resolve address to SuiNS name (reverse lookup)
 * Returns the default name for an address by querying the reverse registry
 */
export async function resolveAddressToName(
  address: string,
): Promise<string | null> {
  try {
    // Check cache first
    const cached = reverseNameCache.get(address);
    if (isCacheValid(cached)) {
      return cached!.name;
    }

    // Use SuiClient directly to query the reverse registry
    const suiClient = new SuiClient({ url: SUI_CONFIG.rpcUrl });

    // Query the reverse registry to get the default name for this address
    const result = await suiClient.getDynamicFieldObject({
      parentId: SUINS_CONFIG.reverseRegistryId,
      name: {
        type: "address",
        value: address,
      },
    });

    let defaultName: string | null = null;

    if (result.data?.content?.dataType === "moveObject") {
      const fields = (result.data.content as any).fields;

      // The value field contains the Domain object with labels array
      if (
        fields?.value?.fields?.labels &&
        Array.isArray(fields.value.fields.labels)
      ) {
        const labels = fields.value.fields.labels;

        // Labels are stored in reverse order: ["sui", "tomcrown"]
        // We need to reverse and join them: "tomcrown.sui"
        const reversedLabels = [...labels].reverse();
        defaultName = reversedLabels.join(".");

        console.log(`[SuiNS] Resolved ${address} to ${defaultName}`);
      }
    }

    // Cache the result
    if (SUINS_CONFIG.cache.enabled) {
      reverseNameCache.set(address, {
        name: defaultName,
        timestamp: Date.now(),
      });
    }

    return defaultName;
  } catch (error: any) {
    // Silently handle "not found" errors (address has no default name)
    if (
      error?.message?.includes("not found") ||
      error?.message?.includes("Could not find")
    ) {
      // Cache negative result to avoid repeated lookups
      if (SUINS_CONFIG.cache.enabled) {
        reverseNameCache.set(address, {
          name: null,
          timestamp: Date.now(),
        });
      }
      return null;
    }

    // Only log unexpected errors (not "not found")
    if (!error?.message?.includes("Invalid SuiNS name")) {
      console.warn("Failed to resolve address to name:", error.message);
    }

    // Cache negative result to avoid repeated failures
    if (SUINS_CONFIG.cache.enabled) {
      reverseNameCache.set(address, {
        name: null,
        timestamp: Date.now(),
      });
    }

    return null;
  }
}

/**
 * Resolve SuiNS name to address (forward lookup)
 */
export async function resolveNameToAddress(
  name: string,
): Promise<string | null> {
  try {
    // Check cache first
    const cached = nameCache.get(name);
    if (isCacheValid(cached)) {
      return cached!.name; // In this case, 'name' stores the address
    }

    const client = getSuinsClient();
    const nameRecord = await client.getNameRecord(name);

    const targetAddress = nameRecord?.targetAddress || null;

    // Cache the result
    if (SUINS_CONFIG.cache.enabled) {
      nameCache.set(name, {
        name: targetAddress,
        timestamp: Date.now(),
      });
    }

    return targetAddress;
  } catch (error: any) {
    // Silently handle "not found" errors
    if (
      error?.message?.includes("not found") ||
      error?.message?.includes("Invalid SuiNS name")
    ) {
      if (SUINS_CONFIG.cache.enabled) {
        nameCache.set(name, {
          name: null,
          timestamp: Date.now(),
        });
      }
      return null;
    }

    console.warn("Failed to resolve name to address:", error.message);

    // Cache negative result
    if (SUINS_CONFIG.cache.enabled) {
      nameCache.set(name, {
        name: null,
        timestamp: Date.now(),
      });
    }

    return null;
  }
}

/**
 * Clear the name resolution cache
 */
export function clearNameCache(): void {
  nameCache.clear();
  reverseNameCache.clear();
}

/**
 * Clear cache for a specific address
 */
export function clearAddressCache(address: string): void {
  reverseNameCache.delete(address);
}
