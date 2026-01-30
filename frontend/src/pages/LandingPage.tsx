import { Link } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  TrendingUp,
  Shield,
  BarChart3,
  Database,
  Cpu,
  Users,
  DollarSign,
  Activity,
  Vote,
  Calendar,
  ImageIcon,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import FeatureCard from "@/components/FeatureCard";
import { PLATFORM_STATS } from "@/data/apiData";
import { easeOutExpo } from "@/components/ui/motion";
import KeyFeaturesSection from "@/components/KeyFeaturesSection";
import { TechStackSection } from "@/components/TechStackSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { useLeaderboard } from "@/hooks/useUserPoints";
import { useBulkSuiNSNames } from "@/hooks/useSuiNsName";

const LandingPage = () => {
  const { leaderboard } = useLeaderboard(5);

  // Fetch SuiNS names for leaderboard addresses
  const addresses = leaderboard.map((entry) => entry.address);
  const { names: suinsNames } = useBulkSuiNSNames(addresses);

  // Format address with SuiNS name fallback
  const formatAddressWithName = (address: string) => {
    const suinsName = suinsNames.get(address);
    if (suinsName && typeof suinsName === "string") {
      return suinsName;
    }
    // Fallback to truncated address
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Layout>
      {/* Hero Section — Background Image */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <img
            src="/hero-vid.gif"
            alt="AI-powered football player trading visualization"
            className="w-full h-full object-cover"
          />

          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/80 to-background/90" />

          {/* Animated glow sweep */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/15 via-transparent to-primary/15"
            animate={{ opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Content */}

        <div className="container mx-auto px-4 relative z-10 md:mt-20">
          <p className="uppercase text-sm absolute -top-16 left-1/2 -translate-x-1/2 text-center">
            Valor is currently on{" "}
            <span className="bg-foreground text-background px-2 py-1 rounded-xl font-semibold">
              TESTNET
            </span>
          </p>{" "}
          <div className="max-w-4xl mx-auto text-center">
            {/* Headline */}
            <h1
              className="text-4xl md:text-6xl font-bold leading-tight mb-6 opacity-0 animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              Trade Football Players
              <br />
              <span className="gradient-text">Like Stocks</span>
            </h1>

            {/* Subheadline */}
            <p
              className="text-md md:text-xl text-muted-foreground max-w-2xl mb-10 opacity-0 animate-fade-in mx-auto"
              style={{ animationDelay: "500ms" }}
            >
              AI-driven player scoring, seasonal performance tracking, community
              sentiment voting, and NFT share certificates. The future of
              fantasy football is here.
            </p>

            {/* CTA */}
            <div
              className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in justify-center"
              style={{ animationDelay: "700ms" }}
            >
              <Link to="/players">
                <Button className="text-primary-foreground font-semibold text-md px-10 py-6 md:text-lg">
                  Start Trading
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          {/* Stats */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:mt-24 mt-12 opacity-0 animate-fade-in"
            style={{ animationDelay: "900ms" }}
          >
            <StatCard
              label="Total Volume"
              value={PLATFORM_STATS.totalVolume}
              prefix="$"
              icon={<DollarSign className="w-5 h-5" />}
              delay={500}
            />
            <StatCard
              label="Listed Players"
              value={PLATFORM_STATS.totalPlayers}
              icon={<Users className="w-5 h-5" />}
              delay={600}
            />
            <StatCard
              label="Active Traders"
              value={PLATFORM_STATS.activeTraders}
              icon={<Activity className="w-5 h-5" />}
              delay={700}
            />
            <StatCard
              label="Daily Trades"
              value={PLATFORM_STATS.avgDailyTrades}
              icon={<BarChart3 className="w-5 h-5" />}
              delay={800}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Features Section */}
      <KeyFeaturesSection />

      {/* Tech Stack Section */}
      <TechStackSection />

      {/* Leaderboard Preview Section */}
      <section className="relative py-24 overflow-hidden mt-6">
        {/* Enhanced background effects */}
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="glass-card p-8 md:p-12 relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            <div className="absolute -top-24 -right-24 w-48 h-48 border border-primary/20 rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 border border-secondary/20 rounded-full" />

            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Live Rankings</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-primary bg-clip-text text-transparent">
                Leaderboard
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Celebrating our top performers and their outstanding achievements
              </p>
            </div>

            {/* Leaderboard entries */}
            <div className="space-y-3 mb-8">
              {leaderboard.slice(0, 5).map((entry, index) => (
                <div
                  key={entry.address}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-background/80 to-background/60 hover:from-background/90 hover:to-background/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Rank indicator gradient */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${index === 0 ? 'bg-gradient-to-b from-yellow-400 to-yellow-600' :
                    index === 1 ? 'bg-gradient-to-b from-gray-300 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-b from-amber-600 to-amber-800' :
                        'bg-gradient-to-b from-primary/50 to-primary'
                    }`} />

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative flex items-center justify-between p-5 md:p-6">
                    <div className="flex items-center gap-4 md:gap-6 flex-1">
                      {/* Rank badge */}
                      <div className={`flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-xl font-bold text-lg md:text-xl ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-950 shadow-lg shadow-yellow-500/50' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-950 shadow-lg shadow-gray-400/50' :
                          index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-amber-50 shadow-lg shadow-amber-600/50' :
                            'bg-primary/20 text-primary border border-primary/30'
                        } transition-all duration-300 group-hover:scale-110`}>
                        {index === 0 ? '👑' : `#${entry.rank}`}
                      </div>

                      {/* Address */}
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm md:text-base font-medium truncate group-hover:text-primary transition-colors">
                          {formatAddressWithName(entry.address)}
                        </div>
                        {index < 3 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {index === 0 ? '🏆 Champion' : index === 1 ? '🥈 Runner-up' : '🥉 Third Place'}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Points */}
                    <div className="flex flex-col items-end gap-1">
                      <div className="font-bold text-lg md:text-xl bg-primary bg-clip-text text-transparent">
                        {entry.lifetimePoints.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        points
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View all link */}
            <div className="text-center pt-4">
              <Link
                to="/leaderboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-all duration-300 hover:gap-3 border border-primary/20 hover:border-primary/40"
              >
                View Full Leaderboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-2 mb-24 md:mb-24 md:py-2">
        <div className="container mx-auto px-4">
          <div className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 animate-gradient" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Trading?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Join thousands of traders building their dream football
                portfolios. Get NFT shares, vote on Pulse, and track seasonal
                performance.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/players">
                  <Button className="text-primary-foreground font-semibold text-md px-10 py-6 md:text-lg">
                    Start Trading
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LandingPage;
