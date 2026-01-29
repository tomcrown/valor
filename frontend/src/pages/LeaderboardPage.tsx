import { useState, useEffect } from "react";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Users,
  Target,
  Coins,
  Crown,
  Star,
} from "lucide-react";
import Layout from "@/components/Layout";
import {
  useLeaderboard,
  useUserPoints,
  calculateTotalScore,
} from "@/hooks/useUserPoints";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type LeaderboardType = "lifetime" | "engagement" | "investor";

const LeaderboardPage = () => {
  const currentAccount = useCurrentAccount();
  const { leaderboard, isLoading, error, refetch } = useLeaderboard(50);
  const { pointsData } = useUserPoints();
  const [selectedTab, setSelectedTab] = useState<LeaderboardType>("lifetime");

  useEffect(() => {
    const interval = setInterval(refetch, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return (
          <span className="text-lg font-bold text-muted-foreground">
            #{rank}
          </span>
        );
    }
  };

  const sortedLeaderboard = [...leaderboard]
    .sort((a, b) => {
      switch (selectedTab) {
        case "lifetime":
          return b.lifetimePoints - a.lifetimePoints;
        case "engagement":
          return (
            b.votesCount +
            b.correctPredictions * 5 -
            (a.votesCount + a.correctPredictions * 5)
          );
        case "investor":
          return b.nftSharesOwned - a.nftSharesOwned;
        default:
          return 0;
      }
    })
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const userRank =
    sortedLeaderboard.findIndex(
      (entry) => entry.address === currentAccount?.address,
    ) + 1;

  const topThree = sortedLeaderboard.slice(0, 3);
  const restOfLeaderboard = sortedLeaderboard.slice(3);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:mt-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 gradient-text">
            Leaderboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Top performers in the Valor ecosystem
          </p>
        </div>

        {/* User Stats Card */}
        {currentAccount && (
          <Card className="mb-8 border-accent/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                Your Stats
              </CardTitle>
              <CardDescription>
                Your current ranking and achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Rank</p>
                  <p className="text-2xl font-bold text-accent">
                    {userRank > 0 ? `#${userRank}` : "-"}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Points</p>
                  <p className="text-2xl font-bold">
                    {pointsData.currentPoints}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Votes</p>
                  <p className="text-2xl font-bold">{pointsData.votesCount}</p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">
                    Predictions
                  </p>
                  <p className="text-2xl font-bold">
                    {pointsData.correctPredictions}
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">NFTs</p>
                  <p className="text-2xl font-bold">
                    {pointsData.nftSharesOwned}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={(v) => setSelectedTab(v as LeaderboardType)}
        >
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="lifetime" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              All-Time
            </TabsTrigger>
            <TabsTrigger value="engagement" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Most Engaged
            </TabsTrigger>
            <TabsTrigger value="investor" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Top Investors
            </TabsTrigger>
          </TabsList>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="p-8 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={refetch}>Try Again</Button>
            </Card>
          )}

          {/* Leaderboard Content */}
          {!isLoading && !error && (
            <>
              <TabsContent value="lifetime" className="space-y-6">
                <LeaderboardContent
                  topThree={topThree}
                  restOfLeaderboard={restOfLeaderboard}
                  currentUserAddress={currentAccount?.address}
                  formatAddress={formatAddress}
                  getRankIcon={getRankIcon}
                  metric="lifetimePoints"
                  metricLabel="Lifetime Points"
                />
              </TabsContent>

              <TabsContent value="engagement" className="space-y-6">
                <LeaderboardContent
                  topThree={topThree}
                  restOfLeaderboard={restOfLeaderboard}
                  currentUserAddress={currentAccount?.address}
                  formatAddress={formatAddress}
                  getRankIcon={getRankIcon}
                  metric="engagement"
                  metricLabel="Engagement Score"
                />
              </TabsContent>

              <TabsContent value="investor" className="space-y-6">
                <LeaderboardContent
                  topThree={topThree}
                  restOfLeaderboard={restOfLeaderboard}
                  currentUserAddress={currentAccount?.address}
                  formatAddress={formatAddress}
                  getRankIcon={getRankIcon}
                  metric="nftSharesOwned"
                  metricLabel="NFT Shares"
                />
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Info Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-accent" />
              How to Earn Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Vote & Engage
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 1 point per vote</li>
                  <li>• 5 points per correct prediction</li>
                  <li>• Bonus for milestones</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-secondary" />
                  Invest in NFTs
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 3 points per NFT share</li>
                  <li>• Accumulate holdings</li>
                  <li>• Collector bonuses</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-accent" />
                  Unlock Benefits
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• 10 points = AI unlock</li>
                  <li>• Achievement bonuses</li>
                  <li>• Leaderboard rewards</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

interface LeaderboardContentProps {
  topThree: any[];
  restOfLeaderboard: any[];
  currentUserAddress?: string;
  formatAddress: (address: string) => string;
  getRankIcon: (rank: number) => JSX.Element;
  metric: string;
  metricLabel: string;
}

function LeaderboardContent({
  topThree,
  restOfLeaderboard,
  currentUserAddress,
  formatAddress,
  getRankIcon,
  metric,
  metricLabel,
}: LeaderboardContentProps) {
  const getMetricValue = (entry: any) => {
    if (metric === "engagement") {
      return entry.votesCount + entry.correctPredictions * 5;
    }
    return entry[metric];
  };

  return (
    <>
      {/* Top 3 Podium */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {topThree.map((entry, index) => {
          const position = index + 1;
          const isCurrentUser = entry.address === currentUserAddress;

          return (
            <Card
              key={entry.address}
              className={cn(
                "relative overflow-hidden transition-all hover:scale-105",
                position === 1 && "border-yellow-500/50 bg-yellow-500/5",
                position === 2 && "border-gray-400/50 bg-gray-400/5",
                position === 3 && "border-amber-600/50 bg-amber-600/5",
                isCurrentUser && "ring-2 ring-accent",
              )}
            >
              <CardContent className="pt-6 text-center">
                <div className="mb-4">{getRankIcon(position)}</div>
                <p className="font-mono text-sm mb-2">
                  {formatAddress(entry.address)}
                </p>
                <p className="text-3xl font-bold mb-1">
                  {getMetricValue(entry)}
                </p>
                <p className="text-sm text-muted-foreground">{metricLabel}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                  <div>
                    <p className="text-muted-foreground">Votes</p>
                    <p className="font-semibold">{entry.votesCount}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Predictions</p>
                    <p className="font-semibold">{entry.correctPredictions}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">NFTs</p>
                    <p className="font-semibold">{entry.nftSharesOwned}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Rest of Leaderboard */}
      <div className="space-y-2">
        {restOfLeaderboard.map((entry) => {
          const isCurrentUser = entry.address === currentUserAddress;

          return (
            <Card
              key={entry.address}
              className={cn(
                "hover:bg-muted/50 transition-colors",
                isCurrentUser && "border-accent bg-accent/5",
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 text-center">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="flex-1">
                      <p className="font-mono text-sm">
                        {formatAddress(entry.address)}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-6 text-sm">
                    <div className="text-right">
                      <p className="text-muted-foreground text-xs">Points</p>
                      <p className="font-bold">{entry.lifetimePoints}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-xs">Votes</p>
                      <p className="font-semibold">{entry.votesCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-xs">
                        Predictions
                      </p>
                      <p className="font-semibold">
                        {entry.correctPredictions}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-xs">NFTs</p>
                      <p className="font-semibold">{entry.nftSharesOwned}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

export default LeaderboardPage;
