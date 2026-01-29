import { useState, useEffect } from "react";
import { resolveAddressToName } from "@/lib/suinsClient";

/**
 * Hook to resolve a Sui address to its SuiNS name
 * @param address - The Sui address to resolve
 * @param enabled - Whether to enable the resolution (default: true)
 */
export function useSuiNSName(
  address: string | undefined | null,
  enabled: boolean = true,
) {
  const [name, setName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Reset state if address is invalid or disabled
    if (!address || !enabled) {
      setName(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function fetchName() {
      setIsLoading(true);
      setError(null);

      try {
        const resolvedName = await resolveAddressToName(address);

        if (!cancelled) {
          setName(resolvedName);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setName(null);
          setIsLoading(false);
        }
      }
    }

    fetchName();

    return () => {
      cancelled = true;
    };
  }, [address, enabled]);

  return {
    name,
    isLoading,
    error,
    hasName: name !== null,
  };
}

/**
 * Hook to resolve multiple addresses to SuiNS names
 * Useful for leaderboards or lists
 */
export function useBulkSuiNSNames(addresses: string[]) {
  const [names, setNames] = useState<Map<string, string | null>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (addresses.length === 0) {
      setNames(new Map());
      return;
    }

    let cancelled = false;

    async function fetchNames() {
      setIsLoading(true);
      setError(null);

      try {
        const nameMap = new Map<string, string | null>();

        // Resolve all addresses in parallel
        const results = await Promise.allSettled(
          addresses.map(async (address) => {
            const name = await resolveAddressToName(address);
            return { address, name };
          }),
        );

        // Process results
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            nameMap.set(result.value.address, result.value.name);
          } else {
            // If resolution failed, set to null
            nameMap.set(addresses[index], null);
          }
        });

        if (!cancelled) {
          setNames(nameMap);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setIsLoading(false);
        }
      }
    }

    fetchNames();

    return () => {
      cancelled = true;
    };
  }, [addresses.join(",")]); // Depend on addresses array as string

  return {
    names,
    isLoading,
    error,
    getName: (address: string) => names.get(address) || null,
  };
}
