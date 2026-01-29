import { useSuiNSName } from "@/hooks/useSuiNsName";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AddressDisplayProps {
  address: string;
  /** Whether to show the full address or truncated version when no name is found */
  truncate?: boolean;
  /** Custom className for styling */
  className?: string;
  /** Whether to show loading skeleton while resolving */
  showLoader?: boolean;
  /** Whether to attempt SuiNS resolution */
  enableSuiNS?: boolean;
  /** Custom format function for address when no name is found */
  formatAddress?: (address: string) => string;
}

/**
 * Format address to shortened version
 */
export function formatAddress(
  address: string,
  truncate: boolean = true,
): string {
  if (!truncate) return address;
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Component to display Sui address with optional SuiNS name resolution
 */
export function AddressDisplay({
  address,
  truncate = true,
  className,
  showLoader = false,
  enableSuiNS = true,
  formatAddress: customFormat,
}: AddressDisplayProps) {
  const { name, isLoading } = useSuiNSName(address, enableSuiNS);

  // Show loading skeleton if enabled and still loading
  if (isLoading && showLoader) {
    return <Skeleton className={cn("h-4 w-32", className)} />;
  }

  // Show SuiNS name if available
  if (name) {
    return (
      <span className={cn("font-medium", className)} title={address}>
        {name}
      </span>
    );
  }

  // Fallback to formatted address
  const displayAddress = customFormat
    ? customFormat(address)
    : formatAddress(address, truncate);

  return (
    <span className={cn("font-mono", className)} title={address}>
      {displayAddress}
    </span>
  );
}

/**
 * Utility component for displaying address in different variants
 */
export function AddressWithCopy({
  address,
  showCopy = true,
  ...props
}: AddressDisplayProps & { showCopy?: boolean }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <AddressDisplay address={address} {...props} />
      {showCopy && (
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Copy address"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        </button>
      )}
    </div>
  );
}
