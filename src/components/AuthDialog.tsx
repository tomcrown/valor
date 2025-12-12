import { useState } from "react";
import { WalletList } from "@/components/WalletList";
import { Wallet, Chrome, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useConnectWallet,
  useCurrentAccount,
  useWallets,
} from "@mysten/dapp-kit";
import { isEnokiWallet } from "@mysten/enoki";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [authMethod, setAuthMethod] = useState<"select" | "wallet">("select");
  const { mutate: connect } = useConnectWallet();
  const currentAccount = useCurrentAccount();
  const wallets = useWallets();

  // Get Enoki wallets
  const enokiWallets = wallets.filter(isEnokiWallet);
  const googleWallet = enokiWallets.find((w) => w.provider === "google");

  // Close dialog when account is connected
  if (currentAccount && isOpen) {
    setTimeout(() => onClose(), 500);
  }

  const handleGoogleLogin = () => {
    if (!googleWallet) {
      console.error("Google wallet not found");
      return;
    }
    connect({ wallet: googleWallet });
  };

  const handleClose = () => {
    setAuthMethod("select");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <img src="/valor.png" alt="VALOR" className="w-16 h-16" />
            </div>
          </div>

          <DialogTitle className="text-center text-2xl font-bold">
            Welcome to VALOR
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Choose your preferred login method to start trading
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {authMethod === "select" && (
            <>
              <div className="space-y-3">
                <Button
                  onClick={handleGoogleLogin}
                  disabled={!googleWallet}
                  className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 font-semibold flex items-center justify-center gap-3"
                >
                  <Chrome className="w-5 h-5 text-blue-500" />
                  Continue with Google (zkLogin)
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setAuthMethod("wallet")}
                  className="w-full h-12 btn-gradient text-primary-foreground font-semibold flex items-center justify-center gap-3"
                >
                  <Wallet className="w-5 h-5" />
                  Connect Sui Wallet
                </Button>
              </div>

              <div className="space-y-3 pt-4">
                <div className="glass-card p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">
                        No wallet? No problem!
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Use Google to create a Sui address instantly with
                        zkLogin - no seed phrases or extensions needed
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium mb-1">
                        Secure & Private
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your Google identity never touches the blockchain. Keys
                        stay secure with Enoki.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {authMethod === "wallet" && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setAuthMethod("select")}
                className="w-full"
              >
                ← Back
              </Button>

              <WalletList onSelectWallet={connect} />

              <div className="glass-card p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Supported Wallets:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li>• Sui Wallet (Official)</li>
                      <li>• Suiet Wallet</li>
                      <li>• Ethos Wallet</li>
                      <li>• Martian Wallet</li>
                      <li>• Glass Wallet</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
