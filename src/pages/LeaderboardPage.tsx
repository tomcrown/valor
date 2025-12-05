import { Trophy, Medal, TrendingUp, Users, BarChart3 } from "lucide-react";
import Layout from "@/components/Layout";
import LeaderboardCard from "@/components/LeaderboardCard";
import StatCard from "@/components/StatCard";
import { DUMMY_LEADERBOARD } from "@/data/dummyData";

const LeaderboardPage = () => {
  const topThree = DUMMY_LEADERBOARD.slice(0, 3);
  const rest = DUMMY_LEADERBOARD.slice(3);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-warning/10 border border-warning/30 mb-6">
            <Trophy className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-warning">Weekly Rankings</span>
          </div>
          <h1 className="text-3xl md:text-4xl   font-bold mb-4">
            Top <span className="gradient-text">Traders</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Compete with traders worldwide and climb the ranks to earn rewards and recognition
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <StatCard
            label="Total Traders"
            value={12500}
            icon={<Users className="w-5 h-5" />}
            delay={100}
          />
          <StatCard
            label="Weekly Volume"
            value={2450000}
            prefix="$"
            icon={<BarChart3 className="w-5 h-5" />}
            delay={200}
          />
          <StatCard
            label="Avg. Growth"
            value={18.5}
            suffix="%"
            icon={<TrendingUp className="w-5 h-5" />}
            delay={300}
          />
        </div>

        {/* Podium */}
        <div className="mb-12">
          <h2 className="text-xl   font-bold mb-6 text-center">This Week's Champions</h2>
          <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-8">
            {/* Second Place */}
            <div className="order-2 md:order-1 w-full md:w-64 opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <LeaderboardCard entry={topThree[1]} variant="podium" />
            </div>
            {/* First Place */}
            <div className="order-1 md:order-2 w-full md:w-72 opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
              <LeaderboardCard entry={topThree[0]} variant="podium" />
            </div>
            {/* Third Place */}
            <div className="order-3 w-full md:w-64 opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
              <LeaderboardCard entry={topThree[2]} variant="podium" />
            </div>
          </div>
        </div>

        {/* Full Rankings */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-border/50 flex items-center justify-between">
            <h2 className="text-xl   font-bold">Full Rankings</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Medal className="w-4 h-4" />
              <span>Updated hourly</span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {DUMMY_LEADERBOARD.map((entry, index) => (
              <div
                key={entry.rank}
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <LeaderboardCard entry={entry} />
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="p-6 border-t border-border/50 text-center">
            <button
              onClick={() => console.log("Load more")}
              className="text-sm text-primary hover:underline font-medium"
            >
              Load more rankings...
            </button>
          </div>
        </div>

        {/* Rewards Info */}
        <div className="mt-12 glass-card p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-warning/5 via-transparent to-warning/5" />
          <div className="relative z-10">
            <Trophy className="w-12 h-12 text-warning mx-auto mb-4" />
            <h3 className="text-2xl   font-bold mb-3">Weekly Rewards</h3>
            <p className="text-muted-foreground max-w-lg mx-auto mb-6">
              Top traders earn exclusive rewards including SUI tokens, premium features, and recognition
              badges. Keep trading to climb the ranks!
            </p>
            <div className="inline-flex items-center gap-6 p-4 bg-muted/50 rounded-xl">
              <div className="text-center">
                <p className="text-2xl   font-bold text-warning">1,000 SUI</p>
                <p className="text-sm text-muted-foreground">1st Place</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl   font-bold text-slate-400">500 SUI</p>
                <p className="text-sm text-muted-foreground">2nd Place</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl   font-bold text-amber-600">250 SUI</p>
                <p className="text-sm text-muted-foreground">3rd Place</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LeaderboardPage;
