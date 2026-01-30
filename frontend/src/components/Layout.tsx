import { ReactNode, useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ValorAIAssistant } from "@/components/ValorAIAssistant";
import { usePointsOperations } from "@/hooks/usePointsOperations";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import { Coins, X } from "lucide-react";
import { usePoints } from "@/context/PointsContext";
import { usePointsInitialization } from "@/hooks/usePointsInitialization";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const currentAccount = useCurrentAccount();
  const { pointsData, isLoading } = usePoints();
  const { initializePointsBalance, isProcessing } = usePointsOperations();
  const { isInitialized, markInitialized } = usePointsInitialization();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only show prompt if:
    // 1. User is connected
    // 2. Not already initialized (checked via localStorage)
    // 3. Not currently loading
    // 4. No balance object exists on chain
    if (
      currentAccount?.address &&
      !isInitialized &&
      !isLoading &&
      !pointsData?.balanceObjectId
    ) {
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
    }
  }, [
    currentAccount?.address,
    isInitialized,
    isLoading,
    pointsData?.balanceObjectId,
  ]);

  // If user has a balance object but localStorage flag is not set, mark as initialized
  useEffect(() => {
    if (
      currentAccount?.address &&
      pointsData?.balanceObjectId &&
      !isInitialized
    ) {
      markInitialized();
    }
  }, [currentAccount?.address, pointsData?.balanceObjectId, isInitialized, markInitialized]);

  const handleInitialize = async () => {
    const success = await initializePointsBalance();
    if (success) {
      markInitialized();
      setShowPrompt(false);
    }
  };

  // Allow dismissing prompt with Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showPrompt) {
        setShowPrompt(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showPrompt]);

  return (
    <div className="min-h-screen flex flex-col relative z-10 mt-0 md:mt-0">
      <Navbar />

      {/* Points Initialization Prompt */}
      {showPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
          onClick={() => setShowPrompt(false)}
        >
          <div
            className="glass-card p-6 max-w-sm w-full border border-accent/30 shadow-xl animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowPrompt(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center gap-3">
              <Coins className="w-8 h-8 text-accent" />

              <p className="text-sm font-semibold">
                Start Earning Pulse Points!
              </p>

              <p className="text-xs text-muted-foreground">
                Initialize your points balance to earn rewards for votes,
                predictions, and NFT purchases
              </p>

              <Button
                onClick={handleInitialize}
                disabled={isProcessing}
                size="sm"
                className="w-full btn-gradient"
              >
                {isProcessing ? "Initializing..." : "Get Started"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">{children}</main>
      <Footer />
      <ValorAIAssistant />
    </div>
  );
};

export default Layout;