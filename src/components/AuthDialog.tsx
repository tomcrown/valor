// src/components/AuthDialog.tsx
import { useState, useEffect } from "react";
import { WalletList } from "@/components/WalletList";
import { Wallet, Chrome, Sparkles, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useConnectWallet, useCurrentAccount } from "@mysten/dapp-kit";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import {
  generateNonce,
  generateRandomness,
  getExtendedEphemeralPublicKey,
} from "@mysten/sui/zklogin";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Vite environment variables - works in browser
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI =
  import.meta.env.VITE_REDIRECT_URI ||
  `${window.location.origin}/auth/callback`;

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [authMethod, setAuthMethod] = useState<"select" | "wallet" | "google">(
    "select"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate: connect } = useConnectWallet();
  const currentAccount = useCurrentAccount();

  // Handle Google zkLogin
  const handleGoogleZkLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Validate environment variables
      if (!GOOGLE_CLIENT_ID) {
        throw new Error(
          "Google Client ID is not configured. Please add VITE_GOOGLE_CLIENT_ID to your .env file"
        );
      }

      // Fetch current epoch
      const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
      const { epoch } = await suiClient.getLatestSuiSystemState();

      // Generate ephemeral keypair
      const keypair = new Ed25519Keypair();
      const randomness = generateRandomness();
      const ephemeralPrivateKey = keypair.getSecretKey();
      const ephemeralPublicKey = getExtendedEphemeralPublicKey(
        keypair.getPublicKey()
      );

      const maxEpoch = Number(epoch) + 2; // Valid for 2 epochs (~24 hours)

      // Store ephemeral data in sessionStorage
      sessionStorage.setItem(
        "zkLoginState",
        JSON.stringify({
          ephemeralPublicKey,
          ephemeralPrivateKey: Array.from(ephemeralPrivateKey), // Convert to array for storage
          randomness,
          maxEpoch,
          status: "Awaiting JWT",
        })
      );

      // Generate nonce
      const nonce = generateNonce(keypair.getPublicKey(), maxEpoch, randomness);

      // Construct Google OAuth URL
      const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: "id_token",
        scope: "openid email",
        nonce: nonce,
      });

      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      // Redirect to Google
      window.location.href = googleAuthUrl;
    } catch (err) {
      console.error("zkLogin initiation error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initiate Google login. Please try again."
      );
      setIsLoading(false);
    }
  };

  // Close dialog when wallet is connected
  useEffect(() => {
    if (currentAccount && authMethod === "wallet") {
      localStorage.setItem("auth_method", "wallet");
      localStorage.setItem(
        "sui_session",
        JSON.stringify({
          address: currentAccount.address,
        })
      );
      setTimeout(() => onClose(), 500);
    }
  }, [currentAccount, authMethod, onClose]);

  const handleClose = () => {
    setAuthMethod("select");
    setError(null);
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
          {/* SELECTION SCREEN */}
          {authMethod === "select" && (
            <>
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleGoogleZkLogin}
                  disabled={isLoading}
                  className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 font-semibold flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Chrome className="w-5 h-5 text-blue-500" />
                      Continue with Google (zkLogin)
                    </>
                  )}
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
                        stay in your browser.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* WALLET CONNECTION SCREEN */}
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
