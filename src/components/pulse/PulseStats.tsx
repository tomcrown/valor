// ============================================================================
// FILE: components/pulse/PulseStats.tsx
// Overall statistics display for Pulse page
// ============================================================================

import { Activity, Users, TrendingUp, Calendar, Clock } from "lucide-react";
import { formatTimeRemaining } from "@/config/pulse.config";
import type { PulsePlatformState } from "@/hooks/usePulseData";

interface PulseStatsProps {
  platformState: PulsePlatformState;
  totalPlayers: number;
  activeVoters: number;
}

export function PulseStats({
  platformState,
  totalPlayers,
  activeVoters,
}: PulseStatsProps) {
  const { currentWeek, weekEndTime, active, totalVotes } = platformState;

  const participationRate =
    activeVoters > 0 ? Math.round((activeVoters / totalPlayers) * 100) : 0;

  return (
    <div className="glass-card p-6 mb-8">
      <div className="flex items-center gap-3 mb-6"></div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Current Week */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Current Week
            </span>
          </div>
          <p className="text-2xl font-bold text-primary">Week {currentWeek}</p>
        </div>

        {/* Total Votes */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Total Votes
            </span>
          </div>
          <p className="text-2xl font-bold text-primary">{totalVotes}</p>
        </div>

        {/* Active Voters */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Participation
            </span>
          </div>
          <p className="text-2xl font-bold text-accent">{participationRate}%</p>
        </div>

        {/* Time Remaining */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-warning/10 to-warning/5 border border-warning/20">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-warning" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Time Left
            </span>
          </div>
          <p className="text-lg font-bold text-warning">
            {active ? formatTimeRemaining(weekEndTime) : "Closed"}
          </p>
        </div>
      </div>
    </div>
  );
}
