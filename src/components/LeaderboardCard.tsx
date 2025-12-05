import { TrendingUp, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/data/dummyData";

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  variant?: "default" | "podium";
}

const LeaderboardCard = ({ entry, variant = "default" }: LeaderboardCardProps) => {
  const getRankStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-400/20 to-amber-600/20 border-yellow-500/50";
      case 2:
        return "bg-gradient-to-br from-slate-300/20 to-slate-500/20 border-slate-400/50";
      case 3:
        return "bg-gradient-to-br from-amber-600/20 to-amber-800/20 border-amber-600/50";
      default:
        return "bg-card/60 border-border/50";
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return (
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            rank === 1 && "bg-yellow-500",
            rank === 2 && "bg-slate-400",
            rank === 3 && "bg-amber-600"
          )}
        >
          <Trophy className="w-4 h-4 text-background" />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
        <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>
      </div>
    );
  };

  if (variant === "podium") {
    return (
      <div
        className={cn(
          "glass-card p-6 text-center hover-lift",
          getRankStyles(entry.rank),
          entry.rank === 1 && "scale-110 z-10"
        )}
      >
        {getRankIcon(entry.rank)}
        <img
          src={entry.avatarUrl}
          alt={entry.displayName}
          className="w-16 h-16 rounded-full mx-auto mt-4 border-2 border-border object-cover"
        />
        <h3 className="  font-bold mt-3">{entry.displayName}</h3>
        <p className="text-xs text-muted-foreground">{entry.address}</p>
        <p className="text-2xl   font-bold mt-3 gradient-text">
          ${entry.portfolioValue.toLocaleString()}
        </p>
        <div className="flex items-center justify-center gap-1 mt-2 text-success">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-semibold">+{entry.weeklyGrowth}%</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "glass-card p-4 flex items-center gap-4 hover-lift",
        getRankStyles(entry.rank)
      )}
    >
      {getRankIcon(entry.rank)}
      <img
        src={entry.avatarUrl}
        alt={entry.displayName}
        className="w-12 h-12 rounded-full border border-border object-cover"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{entry.displayName}</h3>
        <p className="text-xs text-muted-foreground">{entry.address}</p>
      </div>
      <div className="text-right">
        <p className="  font-bold">${entry.portfolioValue.toLocaleString()}</p>
        <div className="flex items-center justify-end gap-1 text-success">
          <TrendingUp className="w-3 h-3" />
          <span className="text-xs font-semibold">+{entry.weeklyGrowth}%</span>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardCard;
