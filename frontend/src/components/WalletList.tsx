import { useWallets } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";

interface WalletListProps {
  onSelectWallet: (adapter: any) => void;
}

export function WalletList({ onSelectWallet }: WalletListProps) {
  const wallets = useWallets();

  const slushWallets = wallets.filter((w) => w.name.includes("Slush"));

  if (!slushWallets || slushWallets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground mb-4">
          Slush Wallet not found
        </p>
        <p className="text-xs text-muted-foreground">
          Please install the Slush wallet extension
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium mb-3">Select a wallet to connect:</p>
      {slushWallets.map((wallet) => (
        <Button
          key={wallet.name}
          onClick={() => onSelectWallet({ wallet })}
          variant="outline"
          className="w-full h-12 justify-start gap-3 hover:bg-primary hover:text-white"
        >
          {wallet.icon && (
            <img
              src={wallet.icon}
              alt={wallet.name}
              className="w-6 h-6 rounded"
            />
          )}
          <span className="font-medium">{wallet.name}</span>
        </Button>
      ))}
    </div>
  );
}
