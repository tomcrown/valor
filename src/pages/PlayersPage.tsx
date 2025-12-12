import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  TrendingUp,
  Zap,
  AlertCircle,
  Calendar,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import PlayerCard from "@/components/PlayerCard";
import {
  getTopPerformers,
  getRisingPlayers,
  getUndervaluedPlayers,
  type SeasonPeriod,
} from "@/data/dummyData";
import { useOnChainPlayers } from "@/hooks/useOnChainPlayers";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type FilterType = "all" | "top" | "rising" | "undervalued";

// const filters: { id: FilterType; label: string; icon: React.ReactNode }[] = [
//   { id: "all", label: "All Players", icon: <Filter className="w-4 h-4" /> },
//   {
//     id: "top",
//     label: "Top Performers",
//     icon: <TrendingUp className="w-4 h-4" />,
//   },
//   { id: "rising", label: "Rising Stars", icon: <Zap className="w-4 h-4" /> },
//   {
//     id: "undervalued",
//     label: "Undervalued",
//     icon: <AlertCircle className="w-4 h-4" />,
//   },
// ];

const seasonOptions: {
  id: SeasonPeriod;
  label: string;
  description: string;
}[] = [
  { id: "early", label: "Early Season", description: "Initial Performance" },
  { id: "mid", label: "Mid Season", description: "Mid-Season Form" },
  { id: "current", label: "Current Season", description: "Latest Performance" },
];

const PlayersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedSeason, setSelectedSeason] = useState<SeasonPeriod>("current");

  // Fetch merged players (football stats + contract data)
  const {
    players: mergedPlayers,
    isLoading,
    error,
    lastFetched,
    stats,
    refetch,
  } = useOnChainPlayers({
    autoFetch: true,
    refetchInterval: 60000, // Refresh every minute
  });

  const filteredPlayers = useMemo(() => {
    let players = mergedPlayers;

    // Apply filter
    switch (activeFilter) {
      case "top":
        // Top performers based on AI score
        players = players
          .filter((p) => p.aiScore >= 80)
          .sort((a, b) => b.aiScore - a.aiScore);
        break;
      case "rising":
        // Rising based on weekly change
        players = players
          .filter((p) => p.weeklyChange > 5)
          .sort((a, b) => b.weeklyChange - a.weeklyChange);
        break;
      case "undervalued":
        // High AI score but low price change
        players = players
          .filter((p) => p.aiScore > 85 && p.weeklyChange < 5)
          .sort((a, b) => b.aiScore - a.aiScore);
        break;
      default:
        // All players
        players = [...mergedPlayers];
    }

    // Apply search
    if (searchQuery) {
      players = players.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.club.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.position.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return players;
  }, [activeFilter, searchQuery, mergedPlayers]);

  const handleBuy = (playerId: string) => {
    const player = mergedPlayers.find((p) => p.id === playerId);
    toast({
      title: "Order Initiated",
      description: `Opening buy order for ${player?.name}...`,
    });
  };

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing Data",
      description: "Fetching latest contract prices and football stats...",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Player <span className="gradient-text">Market</span>
              </h1>
              <p className="text-muted-foreground">
                Browse and trade shares of top football players worldwide
              </p>
            </div>

            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isLoading ? "Updating..." : "Refresh"}
            </Button>
          </div>

          {lastFetched && (
            <div className="mt-2 flex items-center gap-4">
              <p className="text-xs text-muted-foreground">
                Last updated: {lastFetched.toLocaleTimeString()}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              Failed to fetch contract data. Using football stats with default
              prices.
            </div>
          )}
        </div>

        {/* Season Toggle */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Season Period</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {seasonOptions.map((season) => (
              <button
                key={season.id}
                onClick={() => setSelectedSeason(season.id)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all text-left",
                  selectedSeason === season.id
                    ? "border-accent bg-accent/10 shadow-lg shadow-accent/20"
                    : "border-border/50 hover:border-border bg-card/50"
                )}
              >
                <div className="font-semibold mb-1">{season.label}</div>
                <div className="text-sm text-muted-foreground">
                  {season.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search players, clubs, positions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border/50 h-12"
            />
          </div>

          {/* <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilter === filter.id ? "default" : "outline"}
                onClick={() => setActiveFilter(filter.id)}
                className={cn(
                  "transition-all",
                  activeFilter === filter.id
                    ? "btn-gradient text-primary-foreground"
                    : "border-border/50 hover:bg-muted"
                )}
              >
                {filter.icon}
                <span className="ml-2">{filter.label}</span>
              </Button>
            ))}
          </div> */}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="text-foreground font-semibold">
              {filteredPlayers.length}
            </span>{" "}
            players for{" "}
            <span className="text-accent font-semibold">
              {seasonOptions.find((s) => s.id === selectedSeason)?.label}
            </span>
          </p>
        </div>

        {/* Loading State */}
        {isLoading && filteredPlayers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-accent" />
            <p className="text-muted-foreground">
              Loading football stats and contract data...
            </p>
          </div>
        )}

        {/* Players Grid */}
        {filteredPlayers.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlayers.map((player, index) => (
              <div
                key={player.id}
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PlayerCard
                  player={player}
                  onBuy={handleBuy}
                  selectedSeason={selectedSeason}
                />
              </div>
            ))}
          </div>
        ) : !isLoading ? (
          <div className="glass-card p-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Players Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default PlayersPage;
