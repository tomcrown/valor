import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Zap, TrendingUp, TrendingDown, Shield, Clock, Target, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import Chart from "@/components/Chart";
import BuySellWidget from "@/components/BuySellWidget";
import { getPlayerById } from "@/data/dummyData";
import { cn } from "@/lib/utils";

const PlayerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const player = getPlayerById(id || "");

  if (!player) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl   font-bold mb-4">Player Not Found</h1>
          <Link to="/players">
            <Button variant="outline">Back to Players</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isPositive = player.weeklyChange >= 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          to="/players"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Players
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Player Header */}
            <div className="glass-card overflow-hidden">
              <div className="relative h-64 md:h-80">
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent z-10" />
                <img
                  src={player.imageUrl}
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                          {player.position}
                        </span>
                        <span className="text-muted-foreground">{player.nationality}</span>
                      </div>
                      <h1 className="text-3xl md:text-4xl   font-bold mb-1">
                        {player.name}
                      </h1>
                      <p className="text-lg text-muted-foreground">{player.club}</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm border border-border/50">
                      <Zap className="w-4 h-4 text-warning" />
                      <span className="font-semibold">AI Score: {player.aiScore}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border/50">
                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Value</p>
                    <p className="text-3xl   font-bold gradient-text">
                      ${player.currentValue.toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl",
                      isPositive ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                    <span className="text-lg font-semibold">
                      {isPositive ? "+" : ""}
                      {player.weeklyChange.toFixed(1)}% this week
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Value Chart */}
            <div className="glass-card p-6">
              <h2 className="text-xl   font-bold mb-6">7-Day Value Trend</h2>
              <div className="pl-12">
                <Chart data={player.valueHistory} height={250} />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="glass-card p-6">
              <h2 className="text-xl   font-bold mb-6">Season Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Target className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl   font-bold">{player.stats.goals}</p>
                  <p className="text-sm text-muted-foreground">Goals</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Activity className="w-6 h-6 text-secondary mx-auto mb-2" />
                  <p className="text-2xl   font-bold">{player.stats.assists}</p>
                  <p className="text-sm text-muted-foreground">Assists</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Clock className="w-6 h-6 text-accent mx-auto mb-2" />
                  <p className="text-2xl   font-bold">{player.stats.minutesPlayed}</p>
                  <p className="text-sm text-muted-foreground">Minutes</p>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Shield className="w-6 h-6 text-warning mx-auto mb-2" />
                  <p className="text-2xl   font-bold">{player.stats.matchesPlayed}</p>
                  <p className="text-sm text-muted-foreground">Matches</p>
                </div>
              </div>
            </div>

            {/* AI Performance Analysis */}
            <div className="glass-card p-6">
              <h2 className="text-xl   font-bold mb-4">AI Performance Analysis</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <span className="text-muted-foreground">Overall Rating</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        style={{ width: `${player.aiScore}%` }}
                      />
                    </div>
                    <span className="font-semibold">{player.aiScore}/100</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <span className="text-muted-foreground">Form Index</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-success to-accent"
                        style={{ width: "88%" }}
                      />
                    </div>
                    <span className="font-semibold">88/100</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <span className="text-muted-foreground">Consistency Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-secondary to-primary"
                        style={{ width: "82%" }}
                      />
                    </div>
                    <span className="font-semibold">82/100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Walrus Verification */}
            <div className="glass-card p-6 border border-accent/30">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="  font-bold mb-1">Walrus Verified Data</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    All performance data for this player is cryptographically verified and stored on Walrus
                    decentralized storage.
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted font-mono text-sm">
                    <span className="text-muted-foreground">Proof ID:</span>
                    <span className="text-accent">{player.walrusProofId}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Buy/Sell Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BuySellWidget
                playerName={player.name}
                currentPrice={player.currentValue}
                onBuy={(qty) => console.log(`Buy ${qty} shares of ${player.name}`)}
                onSell={(qty) => console.log(`Sell ${qty} shares of ${player.name}`)}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PlayerDetailPage;
