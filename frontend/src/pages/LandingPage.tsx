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
import { formatAddress } from "@/lib/utils"; // or wherever this lives

const LandingPage = () => {
  const { leaderboard } = useLeaderboard(5);
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
          </p>


          {" "}
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
        {/* Ambient glows (optional, matches style) */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/10 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="glass-card p-8 md:p-12 relative overflow-hidden bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 animate-gradient">
            <div className="flex flex-col gap-4 md:flex-row items-center justify-between mb-8">
              <h2 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Top Performers
              </h2>
              <Link
                to="/leaderboard"
                className="text-primary hover:underline flex items-center gap-1"
              >
                View Full Leaderboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {leaderboard.slice(0, 5).map((entry) => (
                <div
                  key={entry.address}
                  className="flex items-center justify-between p-4 rounded-xl bg-background/60 hover:bg-background/80 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-bold text-primary">
                      #{entry.rank}
                    </div>
                    <div className="font-mono text-sm">
                      {formatAddress(entry.address)}
                    </div>
                  </div>
                  <div className="font-semibold">
                    {entry.lifetimePoints.toLocaleString()} pts
                  </div>
                </div>
              ))}
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
