import { ReactNode, useEffect, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ValorAIAssistant } from "@/components/ValorAIAssistant";
import { usePointsOperations } from "@/hooks/usePointsOperations";
import { useUserPoints } from "@/hooks/useUserPoints";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Button } from "@/components/ui/button";
import { Coins, X } from "lucide-react";
import { usePoints } from "@/context/PointsContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const currentAccount = useCurrentAccount();
  const { pointsData, isLoading } = usePoints();
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowPrompt(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);


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
