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

const LandingPage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
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
                <Button className="text-primary-foreground font-semibold px-8 py-6 text-lg">
                  Start Trading
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

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
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Key <span className="gradient-text">Features</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to trade football players on-chain
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ amount: 0.2 }}
            >
              <FeatureCard
                icon={<Zap className="w-7 h-7" />}
                title="AI-Powered Analysis"
                description="AI analyzes real match data to generate accurate, unbiased player performance scores (0-100)."
                delay={100}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              viewport={{ amount: 0.2 }}
            >
              <FeatureCard
                icon={<Calendar className="w-7 h-7" />}
                title="Seasonal Performance Tracking"
                description="Track player evolution across Early, Mid, and Current seasons. Understand price history and form trends."
                delay={150}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ amount: 0.2 }}
            >
              <FeatureCard
                icon={<Vote className="w-7 h-7" />}
                title="Valor Pulse - Community Voting"
                description="Vote YES/NO on weekly player predictions. See real-time community sentiment and BULLISH/BEARISH indicators."
                delay={200}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              viewport={{ amount: 0.2 }}
            >
              <FeatureCard
                icon={<ImageIcon className="w-7 h-7" />}
                title="NFT Share Certificates"
                description="Every purchase mints a unique NFT showing your shares, purchase price, and timestamp. View in your portfolio."
                delay={250}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ amount: 0.2 }}
            >
              <FeatureCard
                icon={<TrendingUp className="w-7 h-7" />}
                title="Real-Time Valuations"
                description="Player values update in real-time based on performance metrics, market demand, and bonding curve pricing."
                delay={300}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              viewport={{ amount: 0.2 }}
            >
              <FeatureCard
                icon={<BarChart3 className="w-7 h-7" />}
                title="Portfolio Analytics"
                description="Track your NFT holdings, positions, P&L, and performance with comprehensive portfolio management tools."
                delay={450}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px " />
        <div className="absolute bottom-0 left-0 w-full h-px " />

        <div className="container mx-auto px-4r">
          <div className="glass-card p-8 md:p-12 relative overflow-hidden bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 animate-gradient">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />

            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Powered by the <span className="gradient-text">Best</span>
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Built with cutting-edge Web3 technology for maximum
                  performance and reliability
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6">
                  <div className="w-20 h-20 rounded-2xl from-primary to-secondary mx-auto mb-4 flex items-center justify-center">
                    <img src="/sui logo.png" alt="" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Sui Network</h3>
                  <p className="text-sm text-muted-foreground">
                    High-throughput Layer 1 blockchain with instant finality and
                    low fees for seamless trading
                  </p>
                </div>
                <div className="text-center p-6">
                  <div className="w-20 h-20 rounded-2xl bg-green-200 mx-auto mb-4 flex items-center justify-center">
                    <img src="/walrus.png" alt="" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Walrus</h3>
                  <p className="text-sm text-muted-foreground">
                    Decentralized storage for verifiable performance data and
                    cryptographic proofs
                  </p>
                </div>
                <div className="text-center p-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-accent mx-auto mb-4 flex items-center justify-center">
                    <img src="/ai.png" alt="" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">AI Engine</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI for accurate player valuation, scoring, and
                    performance analysis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                  <Button className="text-primary-foreground font-semibold px-10 py-6 text-lg">
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
