import { useState, useMemo } from "react";
import { Search, Filter, TrendingUp, Zap, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import PlayerCard from "@/components/PlayerCard";
import { DUMMY_PLAYERS, getTopPerformers, getRisingPlayers, getUndervaluedPlayers } from "@/data/dummyData";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type FilterType = "all" | "top" | "rising" | "undervalued";

const filters: { id: FilterType; label: string; icon: React.ReactNode }[] = [
  { id: "all", label: "All Players", icon: <Filter className="w-4 h-4" /> },
  { id: "top", label: "Top Performers", icon: <TrendingUp className="w-4 h-4" /> },
  { id: "rising", label: "Rising Stars", icon: <Zap className="w-4 h-4" /> },
  { id: "undervalued", label: "Undervalued", icon: <AlertCircle className="w-4 h-4" /> },
];

const PlayersPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredPlayers = useMemo(() => {
    let players = DUMMY_PLAYERS;

    switch (activeFilter) {
      case "top":
        players = getTopPerformers();
        break;
      case "rising":
        players = getRisingPlayers();
        break;
      case "undervalued":
        players = getUndervaluedPlayers();
        break;
      default:
        players = DUMMY_PLAYERS;
    }

    if (searchQuery) {
      players = players.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.club.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.position.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return players;
  }, [activeFilter, searchQuery]);

  const handleBuy = (playerId: string) => {
    const player = DUMMY_PLAYERS.find((p) => p.id === playerId);
    toast({
      title: "Order Initiated",
      description: `Opening buy order for ${player?.name}...`,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Player <span className="gradient-text">Market</span>
          </h1>
          <p className="text-muted-foreground">
            Browse and trade shares of top football players worldwide
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search */}
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

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-semibold">{filteredPlayers.length}</span>{" "}
            players
          </p>
        </div>

        {/* Players Grid */}
        {filteredPlayers.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlayers.map((player, index) => (
              <div
                key={player.id}
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PlayerCard player={player} onBuy={handleBuy} />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Players Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PlayersPage;
