import { ReactNode, useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ValorAIAssistant } from "@/components/ValorAIAssistant";
import { usePointsOperations } from "@/hooks/usePointsOperations";
import { useUserPoints } from "@/hooks/useUserPoints";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import { Coins, X } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const currentAccount = useCurrentAccount();
  const { pointsData, isLoading } = useUserPoints();
  const { initializePointsBalance, isProcessing } = usePointsOperations();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (currentAccount?.address && !pointsData.balanceObjectId && !isLoading) {
      console.log("User needs to initialize points balance");
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
    }
  }, [currentAccount?.address, pointsData.balanceObjectId, isLoading]);

  const handleInitialize = async () => {
    const success = await initializePointsBalance();
    if (success) {
      setShowPrompt(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative z-10 mt-0 md:mt-0">
      <Navbar />

      {/* Points Initialization Prompt */}
      {showPrompt && (
        <div className="fixed bottom-4 right-4 z-50 glass-card p-4 max-w-sm border border-accent/30 shadow-lg animate-slide-in-right">
          <button
            onClick={() => setShowPrompt(false)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-start gap-3">
            <Coins className="w-8 h-8 text-accent flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-sm font-semibold mb-1">
                🎉 Start Earning Pulse Points!
              </p>
              <p className="text-xs text-muted-foreground mb-3">
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
