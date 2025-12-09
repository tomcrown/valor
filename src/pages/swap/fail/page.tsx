import { useSearchParams, useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react";

export default function SwapFailedPage() {
  const [searchParams] = useSearchParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const reason = searchParams.get("reason") || "Swap failed. Please try again.";

  const playerId = params.get("playerId");

  const handleBack = () => {
    if (playerId) {
      navigate(`/players/${playerId}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <XCircle className="w-16 h-16 text-red-500 mb-4" />

      <h1 className="text-3xl font-bold mb-2">Swap Failed</h1>

      <p className="text-muted-foreground mb-6">{reason}</p>

      <button
        onClick={handleBack}
        className="px-6 py-3 rounded-xl bg-red-500/10 text-red-500 font-semibold hover:bg-red-500/20"
      >
        Try Again
      </button>
    </div>
  );
}
