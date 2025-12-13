import { createRoot } from "react-dom/client";
import {
  SuiClientProvider,
  useSuiClientContext,
  WalletProvider,
} from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import "./index.css";
import "@mysten/dapp-kit/dist/index.css";
import SpaceNetworkBackground from "./components/ThreeBg.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { useEffect } from "react";
import { isEnokiNetwork, registerEnokiWallets } from "@mysten/enoki";

const queryClient = new QueryClient();

const networks = {
  testnet: { url: getFullnodeUrl("testnet") },
};

// Component to register Enoki wallets
function RegisterEnokiWallets() {
  const { client, network } = useSuiClientContext();

  useEffect(() => {
    if (!isEnokiNetwork(network)) return;

    const ENOKI_PUBLIC_KEY = import.meta.env.VITE_ENOKI_PUBLIC_KEY;
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!ENOKI_PUBLIC_KEY || !GOOGLE_CLIENT_ID) {
      console.error("Missing Enoki configuration");
      return;
    }

    registerEnokiWallets({
      client,
      network,
      apiKey: ENOKI_PUBLIC_KEY,
      providers: {
        google: {
          clientId: GOOGLE_CLIENT_ID,
        },
      },
    });

    console.log("✅ Enoki wallets registered for network:", network);
  }, [client, network]);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <SuiClientProvider networks={networks} defaultNetwork="testnet">
      <RegisterEnokiWallets />
      <WalletProvider autoConnect>
        <TooltipProvider>
          <GoogleOAuthProvider
            clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}
          >
            <App />
          </GoogleOAuthProvider>
        </TooltipProvider>
      </WalletProvider>
    </SuiClientProvider>
  </QueryClientProvider>
);
