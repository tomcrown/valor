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
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import FeatureCard from "@/components/FeatureCard";
import { PLATFORM_STATS } from "@/data/dummyData";

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
              <span className="">Like Stocks</span>
            </h1>

            {/* Subheadline */}
            <p
              className="text-md md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 opacity-0 animate-fade-in"
              style={{ animationDelay: "500ms" }}
            >
              AI-driven player scoring, real-time value updates, and verifiable
              performance data on-chain. The future of fantasy football is here.
            </p>

            {/* CTA Buttons */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in"
              style={{ animationDelay: "700ms" }}
            >
              <Link to="/players">
                <Button className=" text-primary-foreground font-semibold px-8 py-6 text-lg">
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
            <h2 className="text-3xl md:text-4xl  font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Get started trading in minutes with our intuitive platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Connect Your Wallet",
                description:
                  "Link your Sui wallet to access the platform. Your keys, your assets, your control.",
                // icon: <Shield className="w-7 h-7" />,
              },
              {
                step: "02",
                title: "Discover Players",
                description:
                  "Browse AI-scored players with real-time valuations based on on-field performance.",
                // icon: <TrendingUp className="w-7 h-7" />,
              },
              {
                step: "03",
                title: "Trade & Earn",
                description:
                  "Buy and sell player shares. Earn when your players perform and their value rises.",
                // icon: <BarChart3 className="w-7 h-7" />,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ amount: 0.2 }}
              >
                <div className="glass-card p-8 h-full hover-lift">
                  <div className="text-6xl font-bold text-primary/50 absolute top-4 left-4">
                    {item.step}
                  </div>
                  <h3 className=" font-bold mt-16 text-xl mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-primary to-transparent" />
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
            <h2 className="text-3xl md:text-4xl  font-bold mb-4">
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
                title="AI-Powered Scoring"
                description="Advanced algorithms analyze real match data to generate accurate, unbiased player performance scores."
                delay={100}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ amount: 0.2 }}
            >
              <FeatureCard
                icon={<TrendingUp className="w-7 h-7" />}
                title="Real-Time Valuations"
                description="Player values update in real-time based on performance metrics, market demand, and AI predictions."
                delay={200}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ amount: 0.2 }}
            >
              <FeatureCard
                icon={<Shield className="w-7 h-7" />}
                title="Verifiable On-Chain"
                description="All trades and player data are recorded on Sui blockchain for complete transparency and trust."
                delay={300}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ amount: 0.2 }}
            >
              <FeatureCard
                icon={<Database className="w-7 h-7" />}
                title="Walrus Storage"
                description="Performance data is stored on Walrus decentralized storage with cryptographic proofs of authenticity."
                delay={400}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ amount: 0.2 }}
            >
              <FeatureCard
                icon={<BarChart3 className="w-7 h-7" />}
                title="Portfolio Analytics"
                description="Track your positions, P&L, and performance with comprehensive portfolio management tools."
                delay={500}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ amount: 0.2 }}
            >
              <FeatureCard
                icon={<Users className="w-7 h-7" />}
                title="Competitive Leaderboards"
                description="Compete with traders worldwide and climb the ranks to earn rewards and recognition."
                delay={600}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />

        <div className="container mx-auto px-4">
          <div className="glass-card p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />

            <div className="relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl  font-bold mb-4">
                  Powered by the <span className="gradient-text">Best</span>
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Built with cutting-edge Web3 technology for maximum
                  performance and reliability
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary mx-auto mb-4 flex items-center justify-center">
                    <Cpu className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h3 className=" font-bold text-xl mb-2">Sui Network</h3>
                  <p className="text-sm text-muted-foreground">
                    High-throughput Layer 1 blockchain with instant finality and
                    low fees
                  </p>
                </div>
                <div className="text-center p-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-primary mx-auto mb-4 flex items-center justify-center">
                    <Database className="w-10 h-10 text-accent-foreground" />
                  </div>
                  <h3 className="  font-bold text-xl mb-2">Walrus</h3>
                  <p className="text-sm text-muted-foreground">
                    Decentralized storage for verifiable performance data and
                    proofs
                  </p>
                </div>
                <div className="text-center p-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-accent mx-auto mb-4 flex items-center justify-center">
                    <Zap className="w-10 h-10 text-secondary-foreground" />
                  </div>
                  <h3 className="  font-bold text-xl mb-2">AI Engine</h3>
                  <p className="text-sm text-muted-foreground">
                    Machine learning models for accurate player valuation and
                    scoring
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
              <h2 className="text-3xl md:text-4xl   font-bold mb-4">
                Ready to Start Trading?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Join thousands of traders already building their dream football
                portfolios on Sui.
              </p>
              <Link to="/players">
                <Button className=" text-primary-foreground font-semibold px-10 py-6 text-lg">
                  Start Trading
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LandingPage;
