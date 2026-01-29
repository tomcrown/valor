import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PlayersPage from "./pages/PlayersPage";
import PlayerDetailPage from "./pages/PlayerDetailPage";
import PortfolioPage from "./pages/PortfolioPage";
import PulsePage from "./pages/PulsePage";
import NotFound from "./pages/NotFound";
import SwapSuccessPage from "./pages/swap/success/page";
import SwapFailedPage from "./pages/swap/fail/page";
import "@mysten/dapp-kit/dist/index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { SpaceNetworkBackground } from "./components/ThreeBg";
import LeaderboardPage from "./pages/LeaderboardPage";

const App = () => (
  <BrowserRouter>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <SpaceNetworkBackground />
      <Toaster />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/players" element={<PlayersPage />} />
        <Route path="/players/:id" element={<PlayerDetailPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/pulse" element={<PulsePage />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/swap/success" element={<SwapSuccessPage />} />
        <Route path="/swap/fail" element={<SwapFailedPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Routes>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
