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

const LandingPage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Headline */}
            <h1
              className="text-4xl md:text-6xl mt-10 md:mt-0 font-bold leading-tight mb-6 opacity-0 animate-fade-in"
              style={{ animationDelay: "300ms" }}
            >
              Trade Football Players
              <br />
              <span className="gradient-text">Like Stocks</span>
            </h1>

            {/* Subheadline */}
            <p
              className="text-md md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in"
              style={{ animationDelay: "500ms" }}
            >
              AI-driven player scoring, seasonal performance tracking, community
              sentiment voting, and NFT share certificates. The future of
              fantasy football is here.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in"
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

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.8, duration: 1, ease: easeOutExpo }}
            className="mt-16 relative"
          >
            <motion.div
              className="glass-card p-1 mx-auto max-w-5xl"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.4 }}
            >
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src="/hero-visual.jpg"
                  alt="AI-powered football player trading visualization"
                  className="w-full h-auto rounded-2xl"
                />

                {/* Overlay gradient for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />

                {/* Animated glow overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10"
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>

            {/* Decorative floating elements */}
            <motion.div
              className="absolute -left-8 top-1/2 w-16 h-16 rounded-xl bg-primary/10 border border-primary/20"
              animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -right-4 top-1/4 w-12 h-12 rounded-lg bg-glow-secondary/10 border border-glow-secondary/20"
              animate={{ y: [10, -10, 10], rotate: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          </motion.div>


          {/* Stats Row */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 opacity-0 animate-fade-in"
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
      <section id="how-it-works" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Get started trading in minutes with our intuitive platform
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                step: "01",
                title: "Connect Wallet or Google",
                description:
                  "Link your Sui wallet or sign in with Google. No wallet? No problem!",
              },
              {
                step: "02",
                title: "Explore Seasonal Data",
                description:
                  "View player performance across Early, Mid, and Current seasons. Track price evolution.",
              },
              {
                step: "03",
                title: "Buy Shares & Get NFTs",
                description:
                  "Purchase player shares and receive unique NFT certificates proving ownership.",
              },
              {
                step: "04",
                title: "Vote on Pulse & Trade",
                description:
                  "Join community sentiment voting and trade based on performance and predictions.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                viewport={{ amount: 0.2 }}
              >
                <div className="glass-card p-6 h-full hover-lift">
                  <div className="text-5xl font-bold text-primary/50 mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <KeyFeaturesSection />

      {/* Tech Stack Section */}
      <TechStackSection />

      {/* CTA Section */}
      <section className="py-24">
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
