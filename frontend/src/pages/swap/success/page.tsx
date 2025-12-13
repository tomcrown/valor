"use client";

import { useSearchParams, useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { useEffect } from "react";

export default function SwapSuccessPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const digest = params.get("digest");
  const playerId = params.get("playerId");

  const explorerUrl = digest
    ? `https://suiscan.xyz/mainnet/tx/${digest}`
    : null;

  useEffect(() => {
    const duration = 2000;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      if (Date.now() > animationEnd) {
        clearInterval(interval);
        return;
      }

      confetti({
        particleCount: 70,
        spread: 90,
        origin: { y: 0.6 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleBack = () => {
    if (playerId) {
      navigate(`/players/${playerId}`);
    } else {
      navigate("/"); // fallback
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="p-6 glass-card rounded-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-success mb-6 text-center">
          Swap Successful! 🎉
        </h1>

        <div className="bg-success/10 border border-success/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-muted-foreground mb-2">
            Transaction Hash:
          </p>
          <p className="font-mono text-xs break-all">{digest}</p>
        </div>

        <div className="flex gap-3">
          {explorerUrl && (
            <Button
              onClick={() => window.open(explorerUrl, "_blank")}
              className="flex-1 btn-gradient"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Explorer
            </Button>
          )}

          <Button variant="outline" className="flex-1" onClick={handleBack}>
            Back to Player
          </Button>
        </div>
      </div>
    </div>
  );
}
