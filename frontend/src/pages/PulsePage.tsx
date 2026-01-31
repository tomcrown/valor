import { useEffect, useState } from "react";
import { Loader2, AlertCircle, LogIn } from "lucide-react";
import Layout from "@/components/Layout";
import { PulseStats } from "@/components/pulse/PulseStats";
import { PlayerPulseCard } from "@/components/pulse/PlayerPulseCard";
import { Button } from "@/components/ui/button";
import { usePulseData } from "@/hooks/usePulseData";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { AuthDialog } from "@/components/AuthDialog";

const REGISTERED_PLAYERS = [
  {
    id: "0xd37a3c89148f35ae4fa4a8563a7b1331e48ae0f44747138a619816337b899f46",
    name: "Kylian Mbappé",
    club: "Real Madrid",
    position: "FW",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/big/342229-1682683695.jpg?lm=1",
  },
  {
    id: "0xa174cf6afbeac33fd05e8841555c9ab5c198aeebba15dad64ab6c6cc61f3ab23",
    name: "Erling Haaland",
    club: "Manchester City",
    position: "FW",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/big/418560-1709108116.png?lm=1",
  },
  {
    id: "0x5500cf294534c99136d0b627b8eded2a1a77340c7639a4e5e0a56286f6cf8313",
    name: "Dominik Szoboszlai",
    club: "Liverpool",
    position: "MF",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/big/451276-1758715234.jpg?lm=1",
  },
  {
    id: "0x7c231306c09ac01edacc09dcd0217f0fd2826edb30c16f8046316e66a8d50594",
    name: "Jude Bellingham",
    club: "Real Madrid",
    position: "MF",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/big/581678-1748102891.jpg?lm=1",
  },
  {
    id: "0xcffd108b75dbfb8884c9f3d9ce6dc9e660b030a6fd66c3b8073cedf87856cb92",
    name: "Harry Maguire",
    club: "Manchester United",
    position: "DF",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/big/177907-1663841733.jpg?lm=1",
  },
  {
    id: "0x495945e002970b3aa7ded30a7fbdecf5126a6841325795c231ceac0d5dda3cc8",
    name: "Mohamed Salah",
    club: "Liverpool",
    position: "FW",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/big/148455-1727337594.jpg?lm=1",
  },
  {
    id: "0x89e06ac2673c652605ad6e1a42f313186dfcb8c773c98d29d71c38073b91a125",
    name: "Bukayo Saka",
    club: "Arsenal",
    position: "FW",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/big/433177-1684155052.jpg?lm=1",
  },
  {
    id: "0x5ac2f9ee7409fad0524e1b73d295828731e6cbde12fb4e43df8de1f46ac3cd60",
    name: "David Raya",
    club: "Arsenal",
    position: "GK",
    imageUrl:
      "https://img.a.transfermarkt.technology/portrait/big/262749-1668168018.jpg?lm=1",
  },
];

const PulsePage = () => {
  const currentAccount = useCurrentAccount();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { platformState, sentiments: remoteSentiments, isLoading, refetch } = usePulseData();
  const [sentiments, setSentiments] = useState(remoteSentiments);

  useEffect(() => {
    if (platformState.active) {
      const interval = setInterval(refetch, 30000);
      return () => clearInterval(interval);
    }
  }, [platformState.active, refetch]);

  useEffect(() => {
    setSentiments(remoteSentiments);
  }, [remoteSentiments]);


  const handleVoteSuccess = (vote: "yes" | "no", sentimentId: string) => {
    setSentiments(prev =>
      prev.map(s => {
        if (s.objectId !== sentimentId) return s;

        const totalVotes = s.totalVotes + 1;

        const yesVotes =
          vote === "yes"
            ? Math.round((s.yesPercentage / 100) * s.totalVotes) + 1
            : Math.round((s.yesPercentage / 100) * s.totalVotes);

        const noVotes = totalVotes - yesVotes;

        return {
          ...s,
          totalVotes,
          yesPercentage: Math.round((yesVotes / totalVotes) * 100),
          noPercentage: Math.round((noVotes / totalVotes) * 100),
          userHasVoted: true,
          userVote: vote,
        };
      })
    );

    // Optional background sync
    setTimeout(refetch, 1500);
  };


  const activeVoters = sentiments.filter((s) => s.totalVotes > 0).length;

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-accent" />
            <p className="text-lg font-semibold text-muted-foreground">
              Loading Valor Pulse...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (platformState.error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="glass-card p-8 text-center max-w-2xl mx-auto">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              Unable to Load Pulse Data
            </h2>
            <p className="text-muted-foreground mb-6">{platformState.error}</p>
            <Button onClick={refetch}>Try Again</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:mt-16">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 gradient-text">
            Valor Pulse
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Vote on weekly player performance predictions and see what the
            community thinks
          </p>
        </div>

        {/* Platform Stats */}
        <PulseStats
          platformState={platformState}
          totalPlayers={REGISTERED_PLAYERS.length}
          activeVoters={activeVoters}
        />

        {/* Connect Wallet Prompt */}
        {!currentAccount && (
          <div className="glass-card p-6 mb-8 border-accent/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-semibold mb-1">Connect to Vote</h3>
                  <p className="text-sm text-muted-foreground">
                    Log in to cast your vote and influence community sentiment
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setIsAuthOpen(true)}
                className="btn-gradient whitespace-nowrap"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Log In
              </Button>
            </div>
          </div>
        )}

        {/* Player Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {REGISTERED_PLAYERS.map((player) => {
            const sentiment =
              sentiments.find((s) => s.playerId === player.id) || null;

            if (!sentiment) {
            }

            return (
              <PlayerPulseCard
                key={player.id}
                player={player}
                sentiment={sentiment}
                weekEndTime={platformState.weekEndTime}
                isVotingActive={platformState.active}
                onVoteSuccess={handleVoteSuccess}
              />
            );
          })}
        </div>

        {sentiments.length === 0 && platformState.active && (
          <div className="glass-card p-8 text-center mt-8">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Voting Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Player sentiments haven't been initialized yet for this week.
            </p>
            <p className="text-sm text-muted-foreground">
              Admin needs to run:{" "}
              <code className="bg-muted px-2 py-1 rounded">
                npm run init-pulse-week
              </code>
            </p>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-12 glass-card p-6">
          <h3 className="font-bold mb-3">How Valor Pulse Works</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold  mb-2">
                Weekly Predictions
              </p>
              <p>
                Every week, vote on whether each player will perform well in
                their upcoming matches.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-2">
                One Vote Per Player
              </p>
              <p>
                You can vote once per player per week. Your vote is recorded
                on-chain and cannot be changed.
              </p>
            </div>
            <div>
              <p className="font-semibold  mb-2">
                Community Insights
              </p>
              <p>
                See real-time sentiment to help inform your trading decisions on
                the main platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AuthDialog isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </Layout>
  );
};

export default PulsePage;
