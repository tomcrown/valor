import { useState } from "react";
import {
  Lock,
  Unlock,
  Sparkles,
  TrendingUp,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createSealClient,
  type PublicAIData,
  type PremiumAIData,
} from "@/lib/sealClient";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { useCurrentAccount, useSignPersonalMessage } from "@mysten/dapp-kit";
import { cn } from "@/lib/utils";
import type { SeasonPeriod } from "@/data/apiData";

interface PremiumAIPanelProps {
  publicData: PublicAIData;
  encryptedPremium: Uint8Array;
  playerId: string;
  playerName: string;
  season: SeasonPeriod;
  userOwnsNFT: boolean;
  userShares: number;
}

export function PremiumAIPanel({
  publicData,
  encryptedPremium,
  playerId,
  playerName,
  season,
  userOwnsNFT,
  userShares,
}: PremiumAIPanelProps) {
  const account = useCurrentAccount();
  const [premiumData, setPremiumData] = useState<PremiumAIData | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

  const handleUnlock = async () => {
    if (!account?.address) {
      setDecryptError("Please connect your wallet first");
      return;
    }

    if (!userOwnsNFT) {
      setDecryptError("You need to own shares to access premium insights");
      return;
    }

    setIsDecrypting(true);
    setDecryptError(null);

    try {
      console.log("🔐 Preparing to unlock premium insights...");

      const suiClient = new SuiClient({
        url: getFullnodeUrl(import.meta.env.VITE_SUI_NETWORK || "testnet"),
      });

      // ✅ Create a proper wallet client with all required methods
      const walletClient = {
        getAddress: async () => account.address,

        getPublicKey: async () => {
          // Get the public key from the connected account
          if (!account.publicKey) {
            throw new Error("No public key available");
          }
          // Return the public key bytes directly - Seal will handle the conversion
          return account.publicKey;
        },

        signPersonalMessage: async (input: Uint8Array) => {
          console.log("   ✍️ Signing message of length:", input.length);

          // @mysten/dapp-kit expects Uint8Array directly
          const result = await signPersonalMessage({
            message: input,
          });

          console.log("   ✅ Message signed");

          return {
            signature: result.signature,
            bytes: result.bytes,
          };
        },
      };

      const sealClient = createSealClient(suiClient);

      const encryptedBlob = {
        public_data: publicData,
        encrypted_premium: encryptedPremium,
        player_id: playerId,
        season,
        encrypted_at: new Date().toISOString(),
        seal_metadata: {
          threshold: 1,
          services: [import.meta.env.VITE_SEAL_KEY_SERVER_TESTNET],
        },
      };

      console.log("🔓 Decrypting with wallet signer...");

      const decrypted = await sealClient.decryptPremiumAI(
        encryptedBlob,
        account.address,
        import.meta.env.VITE_NFT_REGISTRY_ID,
        walletClient,
      );

      if (decrypted) {
        setPremiumData(decrypted);
        console.log("🎉 Premium insights unlocked!");
      } else {
        setDecryptError("Failed to decrypt premium data");
      }
    } catch (error: any) {
      console.error("❌ Decryption error:", error);

      if (
        error.message?.includes("User rejected") ||
        error.message?.includes("rejected")
      ) {
        setDecryptError("Signature request was rejected");
      } else {
        setDecryptError(error.message || "Failed to decrypt");
      }
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Public Data - Always Visible */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold">Performance Overview</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">AI Score</p>
            <p className="text-2xl font-bold text-accent">
              {publicData.performance_score}/100
            </p>
          </div>
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Form Status</p>
            <p className="text-lg font-semibold capitalize">
              {publicData.form_status}
            </p>
          </div>
        </div>

        <div className="bg-muted/30 rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-2">Trend</p>
          <div className="flex items-center gap-2">
            <TrendingUp
              className={cn(
                "w-5 h-5",
                publicData.performance_trend === "improving"
                  ? "text-success"
                  : publicData.performance_trend === "declining"
                    ? "text-destructive"
                    : "text-warning",
              )}
            />
            <span className="font-semibold capitalize">
              {publicData.performance_trend}
            </span>
          </div>
        </div>

        {publicData.short_summary && (
          <div className="mt-4 p-4 rounded-xl bg-accent/10 border border-accent/20">
            <p className="text-sm italic">"{publicData.short_summary}"</p>
          </div>
        )}
      </div>

      {/* Premium Data - Locked/Unlocked */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-warning" />
            <h3 className="text-lg font-semibold">Premium Insights</h3>
          </div>

          {userOwnsNFT && (
            <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">
              {userShares} {userShares === 1 ? "share" : "shares"} owned
            </span>
          )}
        </div>

        {!premiumData ? (
          <div className="space-y-4">
            <div className="bg-muted/20 backdrop-blur-sm rounded-xl p-6 border-2 border-dashed border-warning/30">
              <div className="text-center space-y-4">
                <Lock className="w-12 h-12 mx-auto text-warning" />
                <div>
                  <p className="font-semibold mb-1">Unlock Premium Analysis</p>
                  <p className="text-sm text-muted-foreground">
                    Detailed predictions, key factors, and expert reasoning
                  </p>
                </div>

                {userOwnsNFT ? (
                  <Button
                    onClick={handleUnlock}
                    disabled={isDecrypting}
                    className="w-full max-w-xs"
                  >
                    {isDecrypting ? (
                      <>Decrypting...</>
                    ) : (
                      <>
                        <Unlock className="w-4 h-4 mr-2" />
                        Unlock with NFT
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-warning flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Buy shares to access premium insights
                    </p>
                  </div>
                )}

                {decryptError && (
                  <p className="text-sm text-destructive">{decryptError}</p>
                )}
              </div>
            </div>

            {/* Preview of locked content */}
            <div className="space-y-3 opacity-40 pointer-events-none">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
              <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Unlocked Premium Content */}
            <div className="bg-success/10 border border-success/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-success">
                <Unlock className="w-4 h-4" />
                <span className="text-sm font-semibold">Premium Unlocked</span>
              </div>
            </div>

            {/* Prediction */}
            <div>
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                Future Outlook
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {premiumData.prediction}
              </p>
            </div>

            {/* Key Factors */}
            <div>
              <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-warning" />
                Key Factors
              </h4>
              <ul className="space-y-2">
                {premiumData.key_factors.map((factor, index) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-3 flex items-start gap-2"
                  >
                    <span className="text-accent font-semibold flex-shrink-0">
                      {index + 1}.
                    </span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reasoning */}
            <div>
              <h4 className="text-lg font-semibold mb-2">Expert Analysis</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {premiumData.reasoning}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
