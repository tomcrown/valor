import { Link } from "react-router-dom";
import { TrendingUp, TrendingDown, Wallet, BarChart3, DollarSign, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import Chart from "@/components/Chart";
import { DUMMY_PORTFOLIO, calculatePortfolioValue, calculatePortfolioPnL } from "@/data/dummyData";
import { cn } from "@/lib/utils";

const PortfolioPage = () => {
  const totalValue = calculatePortfolioValue(DUMMY_PORTFOLIO);
  const totalPnL = calculatePortfolioPnL(DUMMY_PORTFOLIO);
  const isPositive = totalPnL >= 0;

  // Generate dummy portfolio history
  const portfolioHistory = [
    { date: "Mon", value: totalValue * 0.92 },
    { date: "Tue", value: totalValue * 0.94 },
    { date: "Wed", value: totalValue * 0.96 },
    { date: "Thu", value: totalValue * 0.97 },
    { date: "Fri", value: totalValue * 0.98 },
    { date: "Sat", value: totalValue * 0.99 },
    { date: "Sun", value: totalValue },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl   font-bold mb-2">
              Your <span className="gradient-text">Portfolio</span>
            </h1>
            <p className="text-muted-foreground">Track your positions and performance</p>
          </div>
          <Link to="/players">
            <Button className="btn-gradient text-primary-foreground font-semibold">
              Browse Players
            </Button>
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Portfolio Value"
            value={totalValue}
            prefix="$"
            icon={<Wallet className="w-5 h-5" />}
            delay={100}
          />
          <StatCard
            label="Total P&L"
            value={`${totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}`}
            suffix="%"
            icon={<Percent className="w-5 h-5" />}
            trend={totalPnL}
            delay={200}
          />
          <StatCard
            label="Positions"
            value={DUMMY_PORTFOLIO.length}
            icon={<BarChart3 className="w-5 h-5" />}
            delay={300}
          />
          <StatCard
            label="Total Invested"
            value={DUMMY_PORTFOLIO.reduce((sum, p) => sum + p.quantity * p.averageEntryPrice, 0)}
            prefix="$"
            icon={<DollarSign className="w-5 h-5" />}
            delay={400}
          />
        </div>

        {/* Portfolio Chart */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-xl   font-bold mb-6">Portfolio Value Over Time</h2>
          <div className="pl-16">
            <Chart data={portfolioHistory} height={300} />
          </div>
        </div>

        {/* Positions Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-xl   font-bold">Your Positions</h2>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Player</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Quantity</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    Avg Entry Price
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    Current Value
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    Total Value
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">P&L %</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_PORTFOLIO.map((position, index) => {
                  const pnl =
                    ((position.currentValue - position.averageEntryPrice) / position.averageEntryPrice) *
                    100;
                  const positionPositive = pnl >= 0;
                  const totalPositionValue = position.quantity * position.currentValue;

                  return (
                    <tr
                      key={position.playerId}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors opacity-0 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <td className="p-4">
                        <Link
                          to={`/players/${position.playerId}`}
                          className="flex items-center gap-3 hover:text-primary transition-colors"
                        >
                          <img
                            src={position.imageUrl}
                            alt={position.playerName}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-semibold">{position.playerName}</p>
                            <p className="text-sm text-muted-foreground">{position.club}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="p-4 text-right font-medium">{position.quantity}</td>
                      <td className="p-4 text-right">${position.averageEntryPrice.toLocaleString()}</td>
                      <td className="p-4 text-right">${position.currentValue.toLocaleString()}</td>
                      <td className="p-4 text-right font-semibold">
                        ${totalPositionValue.toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <div
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-lg",
                            positionPositive
                              ? "bg-success/10 text-success"
                              : "bg-destructive/10 text-destructive"
                          )}
                        >
                          {positionPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span className="text-sm font-semibold">
                            {positionPositive ? "+" : ""}
                            {pnl.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Link to={`/players/${position.playerId}`}>
                          <Button variant="outline" size="sm" className="border-border/50 hover:bg-muted">
                            Trade
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-4">
            {DUMMY_PORTFOLIO.map((position, index) => {
              const pnl =
                ((position.currentValue - position.averageEntryPrice) / position.averageEntryPrice) * 100;
              const positionPositive = pnl >= 0;
              const totalPositionValue = position.quantity * position.currentValue;

              return (
                <div
                  key={position.playerId}
                  className="bg-muted/30 rounded-xl p-4 opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Link
                    to={`/players/${position.playerId}`}
                    className="flex items-center gap-3 mb-4"
                  >
                    <img
                      src={position.imageUrl}
                      alt={position.playerName}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-semibold">{position.playerName}</p>
                      <p className="text-sm text-muted-foreground">{position.club}</p>
                    </div>
                  </Link>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-semibold">{position.quantity}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Entry Price</p>
                      <p className="font-semibold">${position.averageEntryPrice}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Value</p>
                      <p className="font-semibold">${totalPositionValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">P&L</p>
                      <div
                        className={cn(
                          "inline-flex items-center gap-1",
                          positionPositive ? "text-success" : "text-destructive"
                        )}
                      >
                        {positionPositive ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span className="font-semibold">
                          {positionPositive ? "+" : ""}
                          {pnl.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PortfolioPage;
