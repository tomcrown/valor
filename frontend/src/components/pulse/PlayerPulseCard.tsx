import { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useVote } from "@/hooks/useVote";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { getPlayerQuestion, formatTimeRemaining } from "@/config/pulse.config";
import type { PlayerSentiment } from "@/hooks/usePulseData";
import { toast } from "@/hooks/use-toast";

interface PlayerPulseCardProps {
  player: {
    id: string;
    name: string;
    club: string;
    imageUrl: string;
    position: string;
  };
  sentiment: PlayerSentiment | null;
  weekEndTime: number;
  isVotingActive: boolean;
  onVoteSuccess: () => void;
}

export function PlayerPulseCard({
  player,
  sentiment,
  weekEndTime,
  isVotingActive,
  onVoteSuccess,
}: PlayerPulseCardProps) {
  const currentAccount = useCurrentAccount();
  const { submitVote, isVoting } = useVote();
  const [selectedVote, setSelectedVote] = useState<"yes" | "no" | null>(null);

  const hasVoted = sentiment?.userHasVoted || false;
  const userVote = sentiment?.userVote;

  const handleVote = async (vote: "yes" | "no") => {
    if (!sentiment?.objectId) {
      toast({
        title: "Voting unavailable",
        description: "Sentiment data is missing for this player.",
        variant: "destructive",
      });
      return;
    }

    if (!currentAccount) {
      toast({
        title: "Wallet not connected",
        description: "Please log in to cast your vote.",
        variant: "destructive",
      });
      return;
    }

    setSelectedVote(vote);

    const success = await submitVote(sentiment.objectId, vote, player.name);

    if (success) {
      toast({
        title: "Vote submitted",
        description: `You voted ${vote.toUpperCase()} for ${player.name}.`,
      });

      onVoteSuccess();
    } else {
      toast({
        title: "Vote failed",
        description: "Transaction failed or was rejected.",
        variant: "destructive",
      });

      setSelectedVote(null);
    }
  };

  const yesPercentage = sentiment?.yesPercentage || 0;
  const noPercentage = sentiment?.noPercentage || 0;
  const totalVotes = sentiment?.totalVotes || 0;

  const isYesMajority = yesPercentage > noPercentage;

  return (
    <div className="glass-card overflow-hidden group hover:border-accent/50 transition-all duration-300">
      {/* Player Header */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-b from-transparent to-card/50">
        <img
          src={player.imageUrl}
          alt={player.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

        {/* Position Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary/80 backdrop-blur-sm">
          <span className="text-xs font-semibold text-primary-foreground">
            {player.position}
          </span>
        </div>

        {/* Vote Status Badge */}
        {hasVoted && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/80 backdrop-blur-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-semibold text-white">Voted</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Player Info */}
        <div>
          <h3 className="font-bold text-lg mb-1">{player.name}</h3>
          <p className="text-sm text-muted-foreground">{player.club}</p>
        </div>

        {/* Question */}
        <div className="p-3 rounded-2xl bg-muted/30 border border-border/50">
          <p className="text-sm font-medium text-center">
            {getPlayerQuestion(player.name)}
          </p>
        </div>

        {/* Vote Buttons */}
        {!hasVoted && isVotingActive ? (
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleVote("yes")}
              disabled={isVoting || !currentAccount}
              className={cn(
                "relative h-auto py-1 flex-col gap-2",
                selectedVote === "yes" && "ring-2 ring-green-500",
                "bg-green/10 hover:bg-green-500/20 text-green-500 border border-green-500/30"
              )}
            >
              <ThumbsUp className="w-5 h-5" />
              <span className="font-semibold">YES</span>
            </Button>

            <Button
              onClick={() => handleVote("no")}
              disabled={isVoting || !currentAccount}
              className={cn(
                "relative h-auto py-1 flex-col gap-2",
                selectedVote === "no" && "ring-2 ring-destructive",
                "bg-red/10 hover:bg-red-400/20 text-red-400 border border-red-400/30"
              )}
            >
              <ThumbsDown className="w-5 h-5" />
              <span className="font-semibold">NO</span>
            </Button>
          </div>
        ) : hasVoted ? (
          <div className="p-3 rounded-2xl bg-success/10 border border-success/30 text-center h-full">
            <div className="flex items-center justify-center gap-2 text-success mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="font-semibold">
                You voted {userVote?.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Check back after the week ends
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-muted/30 border border-border/50 text-center">
            <p className="text-sm text-muted-foreground">Voting closed</p>
          </div>
        )}

        {/* Results */}
        {totalVotes > 0 && (
          <div className="space-y-3">
            {/* Vote Bars */}
            <div className="space-y-2">
              {/* YES Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-success">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="font-semibold">YES</span>
                  </div>
                  <span className="font-mono font-semibold">
                    {yesPercentage}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-300 transition-all duration-500"
                    style={{ width: `${yesPercentage}%` }}
                  />
                </div>
              </div>

              {/* NO Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-red-400">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span className="font-semibold">NO</span>
                  </div>
                  <span className="font-mono font-semibold">
                    {noPercentage}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-300 transition-all duration-500"
                    style={{ width: `${noPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stats Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span className="font-medium">{totalVotes} votes</span>
              </div>

              {isVotingActive && (
                <div className="flex items-center gap-1.5 text-xs text-accent">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-medium">
                    {formatTimeRemaining(weekEndTime)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No votes yet */}
        {totalVotes === 0 && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            Be the first to vote!
          </div>
        )}
      </div>
    </div>
  );
}
