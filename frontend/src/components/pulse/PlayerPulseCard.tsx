import { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Users,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useVote } from "@/hooks/useVote";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { getPlayerQuestion, formatTimeRemaining } from "@/config/pulse.config";
import type { PlayerSentiment } from "@/hooks/usePulseData";
import { toast } from "@/hooks/use-toast";
import { easeOutExpo } from "@/components/ui/motion";
import { useVoteWithPoints } from "@/hooks/usePointsOperations";
import { useUserPoints } from "@/hooks/useUserPoints";
import { usePoints } from "@/context/PointsContext";
import { PULSE_POINTS_CONFIG } from "@/config/pulse-points.config";

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
  onVoteSuccess: (vote: "yes" | "no", sentimentId: string) => void;
}

export function PlayerPulseCard({
  player,
  sentiment,
  weekEndTime,
  isVotingActive,
  onVoteSuccess,
}: PlayerPulseCardProps) {
  const currentAccount = useCurrentAccount();
  const { submitVoteWithPoints, isVoting } = useVoteWithPoints();


  const { pointsData: localPointsData, optimisticAddPoints: localAddPoints, optimisticAddVote: localAddVote } = useUserPoints();
  const { optimisticAddPoints: contextAddPoints, optimisticAddVote: contextAddVote } = usePoints();


  const [selectedVote, setSelectedVote] = useState<"yes" | "no" | null>(null);

  const hasVoted = sentiment?.userHasVoted ?? false;
  const userVote = sentiment?.userVote;

  const yes = sentiment?.yesPercentage ?? 0;
  const no = sentiment?.noPercentage ?? 0;
  const totalVotes = sentiment?.totalVotes ?? 0;

  const handleVote = async (vote: "yes" | "no") => {
    if (!sentiment?.objectId) {
      toast({
        title: "Voting unavailable",
        description: "Missing sentiment data.",
        variant: "destructive",
      });
      return;
    }

    if (!currentAccount) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to vote.",
        variant: "destructive",
      });
      return;
    }

    setSelectedVote(vote);

    const success = await submitVoteWithPoints(
      sentiment.objectId,
      vote,
      player.name,
      localPointsData.balanceObjectId,
    );

    if (success) {

      localAddVote();
      contextAddVote()

      onVoteSuccess(vote, sentiment.objectId);

      toast({
        title: "Vote submitted",
        description: `You voted ${vote.toUpperCase()} for ${player.name}`,
      });
    }
  };

  return (
    <motion.div
      className="glass-card p-6"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: easeOutExpo }}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        {/* Player Image */}
        <div className="w-14 h-14 rounded-full overflow-hidden bg-muted shrink-0">
          <img
            src={player.imageUrl}
            alt={player.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Player Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base truncate">{player.name}</h3>
            {hasVoted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          </div>
          <p className="text-xs text-muted-foreground">
            {player.club} · {player.position}
          </p>
        </div>
      </div>
      {/* Question */}
      <div className="mt-3">
        <p className="text-sm text-muted-foreground text-center leading-snug">
          {getPlayerQuestion(player.name)}
        </p>
      </div>

      {/* Vote Bar */}
      {totalVotes > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-emerald-400 font-medium">YES {yes}%</span>
            <span className="text-rose-400 font-medium">NO {no}%</span>
          </div>

          <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${yes}%` }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
            />
            <motion.div
              className="absolute right-0 top-0 h-full bg-rose-500"
              initial={{ width: 0 }}
              animate={{ width: `${no}%` }}
              transition={{ duration: 0.6, ease: easeOutExpo }}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              This week's conviction
            </span>
            <span>{totalVotes.toLocaleString()} votes</span>
          </div>
        </div>
      )}

      {/* Voting Buttons */}
      <AnimatePresence mode="wait">
        {!hasVoted && isVotingActive ? (
          <motion.div
            className="grid grid-cols-2 gap-3 mt-5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={() => handleVote("yes")}
              disabled={isVoting}
              className={cn(
                "h-11 rounded-xl border border-emerald-500/30",
                "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400",
              )}
              variant="outline"
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              YES
            </Button>

            <Button
              onClick={() => handleVote("no")}
              disabled={isVoting}
              className={cn(
                "h-11 rounded-xl border border-rose-500/30",
                "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400",
              )}
              variant="outline"
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              NO
            </Button>
          </motion.div>
        ) : hasVoted ? (
          <div className="mt-5 text-center text-sm text-muted-foreground">
            You voted{" "}
            <span
              className={
                userVote === "yes" ? "text-emerald-400" : "text-rose-400"
              }
            >
              {userVote?.toUpperCase()}
            </span>
          </div>
        ) : null}
      </AnimatePresence>

      {/* Footer */}
      {isVotingActive && (
        <div className="flex justify-between mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {totalVotes} votes
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTimeRemaining(weekEndTime)}
          </span>
        </div>
      )}
    </motion.div>
  );
}