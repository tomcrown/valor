import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  DollarSign,
  Percent,
  Coins,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import Chart from "@/components/Chart";
import { useUserPortfolio } from "@/hooks/useuserPortfolio";
import { useBuySellShares } from "@/hooks/useBuySellShares";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { cn } from "@/lib/utils";
import { useState } from "react";

const PortfolioPage = () => {
  const currentAccount = useCurrentAccount();
  const { holdings, summary, isLoading, error, refetch } = useUserPortfolio();
  const { sellShares, isProcessing } = useBuySellShares();
  const [sellAmounts, setSellAmounts] = useState<{
    [objectId: string]: number;
  }>({});

  const portfolioHistory = [
    { date: "Mon", value: summary.totalValue * 0.92 },
    { date: "Tue", value: summary.totalValue * 0.94 },
    { date: "Wed", value: summary.totalValue * 0.96 },
    { date: "Thu", value: summary.totalValue * 0.97 },
    { date: "Fri", value: summary.totalValue * 0.98 },
    { date: "Sat", value: summary.totalValue * 0.99 },
    { date: "Sun", value: summary.totalValue },
  ];

  const handleSellShares = async (
    objectId: string,
    maxQuantity: number,
    playerName: string,
    minPrice: number
  ) => {
    const amount = sellAmounts[objectId] || maxQuantity;

    if (amount <= 0 || amount > maxQuantity) {
      return;
    }

    const result = await sellShares({
      operations: [{ objectId, amount }],
      minPricePerShare: minPrice * 0.95,
      playerName,
    });

    if (result?.success) {
      setTimeout(refetch, 2000);
      setSellAmounts((prev) => ({ ...prev, [objectId]: 0 }));
    }
  };

  if (!currentAccount?.address) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Wallet className="w-16 h-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Log In</h2>
            <p className="text-muted-foreground mb-6">
              Log In to view your portfolio and manage your positions
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading your portfolio...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <AlertCircle className="w-16 h-16 text-destructive mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              Failed to Load Portfolio
            </h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={refetch}>Try Again</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Your <span className="gradient-text">Portfolio</span>
            </h1>
            <p className="text-muted-foreground">
              Track your positions and performance
            </p>
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
            value={summary.totalValue.toFixed(4)}
            prefix="$"
            suffix=" SUI"
            icon={<Wallet className="w-5 h-5" />}
            delay={100}
          />
          <StatCard
            label="Total P&L"
            value={summary.totalPnL.toFixed(2)}
            suffix="%"
            icon={<Percent className="w-5 h-5" />}
            trend={summary.totalPnL}
            delay={200}
          />
          <StatCard
            label="Positions"
            value={summary.positionsCount}
            icon={<BarChart3 className="w-5 h-5" />}
            delay={300}
          />
          <StatCard
            label="Total Invested"
            value={summary.totalInvested.toFixed(4)}
            prefix="$"
            suffix=" SUI"
            icon={<DollarSign className="w-5 h-5" />}
            delay={400}
          />
        </div>

        {/* Portfolio Chart */}
        {summary.totalValue > 0 && (
          <div className="glass-card p-6 mb-8">
            <h2 className="text-xl font-bold mb-6">
              Portfolio Value Over Time
            </h2>
            <div className="pl-16">
              <Chart data={portfolioHistory} height={300} />
            </div>
          </div>
        )}

        {/* Your Assets Section */}
        <div className="glass-card p-6 mb-8">
          <h2 className="text-3xl font-bold mb-6">Wallet Assets</h2>

          {/* SUI Balance */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl mb-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="font-semibold text-lg">SUI Balance</p>
                <p className="text-sm text-muted-foreground">
                  Available for trading
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {summary.suiBalance.toFixed(4)} SUI
              </p>
              <p className="text-sm text-muted-foreground"></p>
            </div>
          </div>

          {/* Player Shares NFTs */}
          {holdings.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xl font-bold mb-6">Player Shares NFTs</h3>

              {holdings.map((holding, index) => (
                <div
                  key={holding.objectId}
                  className="p-4 bg-muted/30 rounded-xl opacity-0 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* Player Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                      {holding.imageUrl && (
                        <img
                          src={holding.nftImageUrl}
                          alt={holding.playerName}
                          className="w-20 h-20 rounded-2xl object-contain"
                        />
                      )}
                      <div>
                        <p className="font-semibold">{holding.playerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {holding.club}
                        </p>
                      </div>
                    </div>

                    {/* Holdings Info */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Quantity
                        </p>
                        <p className="font-semibold">{holding.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Current Price
                        </p>
                        <p className="font-semibold">
                          {holding.currentPrice.toFixed(4)} SUI
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Total Value
                        </p>
                        <p className="font-semibold">
                          {holding.totalValue.toFixed(4)} SUI
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">P&L</p>
                        <div
                          className={cn(
                            "inline-flex items-center gap-1",
                            holding.pnl >= 0
                              ? "text-success"
                              : "text-destructive"
                          )}
                        >
                          {holding.pnl >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span className="font-semibold text-sm">
                            {holding.pnl >= 0 ? "+" : ""}
                            {holding.pnl.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action - Sell Button */}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={holding.quantity}
                        value={
                          sellAmounts[holding.objectId] || holding.quantity
                        }
                        onChange={(e) =>
                          setSellAmounts((prev) => ({
                            ...prev,
                            [holding.objectId]: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-16 px-2 py-1 text-sm rounded border border-border bg-background text-center"
                        disabled={isProcessing}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleSellShares(
                            holding.objectId,
                            holding.quantity,
                            holding.playerName,
                            holding.currentPrice
                          )
                        }
                        disabled={isProcessing}
                        className="border-border/50 bg-primary hover:bg-primary/10 hover:text-destructive hover:border-primary"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Sell"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Positions Table (Grouped by Player) */}
        {holdings.length > 0 && (
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-border/50">
              <h2 className="text-xl font-bold">Your Positions</h2>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                      Player
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                      Quantity
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                      Avg Entry Price
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                      Current Price
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                      Total Value
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                      P&L %
                    </th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((holding, index) => {
                    const positionPositive = holding.pnl >= 0;

                    return (
                      <tr
                        key={holding.objectId}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors opacity-0 animate-fade-in"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <td className="p-4">
                          <Link
                            to={`/players/${holding.player?.id || ""}`}
                            className="flex items-center gap-3 hover:text-primary transition-colors"
                          >
                            {holding.imageUrl && (
                              <img
                                src={holding.imageUrl}
                                alt={holding.playerName}
                                className="w-16 h-16 rounded-2xl object-cover"
                              />
                            )}
                            <div>
                              <p className="font-semibold">
                                {holding.playerName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {holding.club}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="p-4 text-right font-medium">
                          {holding.quantity}
                        </td>
                        <td className="p-4 text-right">
                          {holding.entryPrice.toFixed(4)} SUI
                        </td>
                        <td className="p-4 text-right">
                          {holding.currentPrice.toFixed(4)} SUI
                        </td>
                        <td className="p-4 text-right font-semibold">
                          {holding.totalValue.toFixed(4)} SUI
                        </td>
                        <td className="p-4 text-right">
                          <div
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 rounded-2xl",
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
                              {holding.pnl.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <Link to={`/players/${holding.player?.id || ""}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-border/50 hover:bg-primary border border-primary"
                            >
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
              {holdings.map((holding, index) => {
                const positionPositive = holding.pnl >= 0;

                return (
                  <div
                    key={holding.objectId}
                    className="bg-muted/30 rounded-xl p-4 opacity-0 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Link
                      to={`/players/${holding.player?.id || ""}`}
                      className="flex items-center gap-3 mb-4"
                    >
                      {holding.imageUrl && (
                        <img
                          src={holding.imageUrl}
                          alt={holding.playerName}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      )}
                      <div>
                        <p className="font-semibold">{holding.playerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {holding.club}
                        </p>
                      </div>
                    </Link>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Quantity</p>
                        <p className="font-semibold">{holding.quantity}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Entry Price</p>
                        <p className="font-semibold">
                          {holding.entryPrice.toFixed(4)} SUI
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Value</p>
                        <p className="font-semibold">
                          {holding.totalValue.toFixed(4)} SUI
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">P&L</p>
                        <div
                          className={cn(
                            "inline-flex items-center gap-1",
                            positionPositive
                              ? "text-success"
                              : "text-destructive"
                          )}
                        >
                          {positionPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span className="font-semibold">
                            {positionPositive ? "+" : ""}
                            {holding.pnl.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {holdings.length === 0 && (
          <div className="glass-card p-12 text-center">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Positions Yet</h3>
            <p className="text-muted-foreground mb-6">
              Start building your portfolio by buying player shares
            </p>
            <Link to="/players">
              <Button className="btn-gradient text-primary-foreground font-semibold">
                Browse Players
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PortfolioPage;
