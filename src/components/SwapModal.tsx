import { useState, useEffect, useCallback } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { AggregatorClient } from "@cetusprotocol/aggregator-sdk";
import {
  X,
  ArrowDownUp,
  Loader2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useParams } from "react-router-dom";

const GAS_BUDGET = 50_000_000;

const aggregatorClient = new AggregatorClient({} as any);

const tokens = [
  {
    symbol: "SUI",
    type: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
    decimals: 9,
  },
  {
    symbol: "USDC",
    type: "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
    decimals: 6,
  },
  {
    symbol: "WAL",
    type: "0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL",
    decimals: 9,
  },
  {
    symbol: "DEEP",
    type: "0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP",
    decimals: 6,
  },
  {
    symbol: "SCA",
    type: "0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA",
    decimals: 9,
  },
];

function TokenSelect({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const selectedToken = tokens.find((t) => t.symbol === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          "flex justify-between items-center bg-muted/50 hover:bg-muted px-4 py-3 rounded-xl w-full transition-colors border border-border/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="font-semibold text-lg">{selectedToken.symbol}</span>
        <svg
          className="ml-2 w-4 h-4 text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="z-10 absolute bg-card shadow-xl mt-2 border border-border rounded-xl max-h-48 overflow-y-auto w-full">
          {tokens.map((token) => (
            <div
              key={token.symbol}
              className="flex items-center justify-between hover:bg-muted/50 px-4 py-3 cursor-pointer transition-colors"
              onClick={() => {
                onChange(token.symbol);
                setOpen(false);
              }}
            >
              <span className="font-semibold">{token.symbol}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SwapModal({ open, onOpenChange }) {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromToken, setFromToken] = useState("USDC");
  const [toToken, setToToken] = useState("SUI");
  const [isSwapping, setIsSwapping] = useState(false);
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [balances, setBalances] = useState({});
  const [actualBalances, setActualBalances] = useState({});
  const [slippage] = useState(0.5);
  const [txOutcome, setTxOutcome] = useState(null);
  const { id: playerId } = useParams();

  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const suiClient = useSuiClient();

  const fetchBalances = useCallback(async () => {
    if (!currentAccount) return;

    try {
      const balancePromises = tokens.map(async (token) => {
        const coins = await suiClient.getCoins({
          owner: currentAccount.address,
          coinType: token.type,
        });

        const totalBalance = coins.data.reduce(
          (sum, coin) => sum + BigInt(coin.balance),
          0n
        );

        return {
          symbol: token.symbol,
          raw: totalBalance,
          formatted: (
            Number(totalBalance) / Math.pow(10, token.decimals)
          ).toFixed(token.decimals === 9 ? 2 : 6),
        };
      });

      const results = await Promise.all(balancePromises);
      const newBalances = {};
      const newActualBalances = {};

      results.forEach((result) => {
        newBalances[result.symbol] = result.formatted;
        newActualBalances[result.symbol] = result.raw;
      });

      setBalances(newBalances);
      setActualBalances(newActualBalances);
    } catch (error) {
      console.error("Failed to fetch balances:", error);
    }
  }, [currentAccount, suiClient]);

  useEffect(() => {
    if (!currentAccount) {
      const emptyBalances = {};
      tokens.forEach((token) => {
        emptyBalances[token.symbol] = "0.00";
      });
      setBalances(emptyBalances);
      setActualBalances({});
      return;
    }

    fetchBalances();
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, [currentAccount, fetchBalances]);

  useEffect(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount("");
      setRouteError("");
      return;
    }

    const fetchRoute = async () => {
      setIsFetchingRoute(true);
      setRouteError("");
      try {
        const fromTokenData = tokens.find((t) => t.symbol === fromToken);
        const toTokenData = tokens.find((t) => t.symbol === toToken);

        const amountInRaw = BigInt(
          Math.floor(
            parseFloat(fromAmount) * Math.pow(10, fromTokenData.decimals)
          )
        );

        const route = await aggregatorClient.findRouters({
          from: fromTokenData.type,
          target: toTokenData.type,
          amount: amountInRaw.toString(),
          byAmountIn: true,
        });

        if (route && route.amountOut && !route.insufficientLiquidity) {
          const estimatedOut =
            Number(route.amountOut.toString()) /
            Math.pow(10, toTokenData.decimals);
          setToAmount(estimatedOut.toFixed(6));
          setRouteError("");
        } else {
          setToAmount("");
          setRouteError("No route available");
        }
      } catch (error) {
        console.error("Failed to fetch route:", error);
        setToAmount("");
        setRouteError("Failed to fetch route");
      } finally {
        setIsFetchingRoute(false);
      }
    };

    const debounce = setTimeout(fetchRoute, 800);
    return () => clearTimeout(debounce);
  }, [fromAmount, fromToken, toToken]);

  const handleSwap = async () => {
    if (!currentAccount) {
      setTxOutcome({
        status: "failure",
        message: "Please connect your wallet to swap.",
      });
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setTxOutcome({
        status: "failure",
        message: "Please enter a valid amount.",
      });
      return;
    }

    setIsSwapping(true);

    try {
      const fromTokenData = tokens.find((t) => t.symbol === fromToken);
      const toTokenData = tokens.find((t) => t.symbol === toToken);

      const amountInRaw = BigInt(
        Math.floor(
          parseFloat(fromAmount) * Math.pow(10, fromTokenData.decimals)
        )
      );

      const suiCoins = await suiClient.getCoins({
        owner: currentAccount.address,
        coinType:
          "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
      });

      if (suiCoins.data.length === 0) {
        throw new Error("No SUI coins found for gas fees");
      }

      const totalSuiBalance = suiCoins.data.reduce(
        (sum, coin) => sum + BigInt(coin.balance),
        0n
      );

      let swapCoinIds = [];

      if (fromToken === "SUI") {
        if (totalSuiBalance < amountInRaw) {
          throw new Error(
            `Insufficient SUI balance. Need ${(
              Number(amountInRaw) / 1e9
            ).toFixed(6)} SUI`
          );
        }

        const sortedCoins = [...suiCoins.data].sort((a, b) => {
          const balanceA = BigInt(a.balance);
          const balanceB = BigInt(b.balance);
          return balanceA > balanceB ? -1 : balanceA < balanceB ? 1 : 0;
        });

        swapCoinIds = [sortedCoins[0].coinObjectId];
        let totalForSwap = BigInt(sortedCoins[0].balance);
        let coinIndex = 1;

        while (totalForSwap < amountInRaw && coinIndex < sortedCoins.length) {
          swapCoinIds.push(sortedCoins[coinIndex].coinObjectId);
          totalForSwap += BigInt(sortedCoins[coinIndex].balance);
          coinIndex++;
        }
      } else {
        if (totalSuiBalance < BigInt(GAS_BUDGET)) {
          throw new Error(
            `Insufficient SUI for gas. Need at least ${(
              GAS_BUDGET / 1e9
            ).toFixed(2)} SUI`
          );
        }

        const swapTokenCoins = await suiClient.getCoins({
          owner: currentAccount.address,
          coinType: fromTokenData.type,
        });

        if (swapTokenCoins.data.length === 0) {
          throw new Error(`No ${fromToken} coins found in wallet`);
        }

        const totalSwapBalance = swapTokenCoins.data.reduce(
          (sum, coin) => sum + BigInt(coin.balance),
          0n
        );

        if (totalSwapBalance < amountInRaw) {
          throw new Error(
            `Insufficient ${fromToken} balance. Need ${(
              Number(amountInRaw) / Math.pow(10, fromTokenData.decimals)
            ).toFixed(6)}`
          );
        }

        swapCoinIds = swapTokenCoins.data.map((c) => c.coinObjectId);
      }

      const route = await aggregatorClient.findRouters({
        from: fromTokenData.type,
        target: toTokenData.type,
        amount: amountInRaw.toString(),
        byAmountIn: true,
      });

      if (!route) {
        throw new Error("No swap route found");
      }

      const txb = new Transaction();
      txb.setGasBudget(GAS_BUDGET);

      let coinForSwap;

      if (fromToken === "SUI") {
        const [swapCoin] = txb.splitCoins(txb.gas, [txb.pure.u64(amountInRaw)]);
        coinForSwap = swapCoin;
      } else {
        const baseCoin = txb.object(swapCoinIds[0]);
        if (swapCoinIds.length > 1) {
          const otherCoins = swapCoinIds.slice(1).map((id) => txb.object(id));
          txb.mergeCoins(baseCoin, otherCoins);
        }

        const [swapCoin] = txb.splitCoins(baseCoin, [
          txb.pure.u64(amountInRaw),
        ]);
        coinForSwap = swapCoin;
      }

      const outputCoin = await aggregatorClient.routerSwap({
        router: route,
        txb: txb,
        inputCoin: coinForSwap,
        slippage: slippage,
      });

      txb.transferObjects([outputCoin], currentAccount.address);

      const result = await signAndExecuteTransaction({
        transaction: txb,
      });

      // Redirect to standalone success page
      window.location.href = `/swap/success?digest=${result.digest}&playerId=${playerId}`;

      return;
    } catch (error) {
      console.error("Swap failed:", error);

      const reason = encodeURIComponent(error.message || "Swap failed");
      window.location.href = `/swap/fail?reason=${reason}&playerId=${playerId}`;
      return;
    } finally {
      setIsSwapping(false);
    }
  };

  const handleFlip = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleMaxClick = () => {
    const tokenData = tokens.find((t) => t.symbol === fromToken);
    const rawBalance = actualBalances[fromToken] || 0n;

    if (fromToken === "SUI") {
      const actualSuiBalance = Number(rawBalance) / 1e9;
      const maxAmount = Math.max(0, actualSuiBalance - GAS_BUDGET / 1e9);
      setFromAmount(maxAmount.toFixed(6));
    } else {
      const actualBalance =
        Number(rawBalance) / Math.pow(10, tokenData.decimals);
      setFromAmount(actualBalance.toFixed(tokenData.decimals === 9 ? 9 : 6));
    }
  };

  const handleCloseTxOverlay = async () => {
    setTxOutcome(null);
    if (currentAccount) {
      await fetchBalances();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="z-50 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold gradient-text">
              Swap Tokens
            </DialogTitle>
          </DialogHeader>

          {!currentAccount && (
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Please connect your wallet to start swapping tokens.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {/* From Token */}
            <div>
              <label className="block font-medium text-sm mb-2">From</label>
              <div className="glass-card p-4 rounded-xl space-y-3">
                <TokenSelect
                  value={fromToken}
                  onChange={setFromToken}
                  disabled={isSwapping}
                />
                <input
                  type="text"
                  className="bg-transparent px-0 py-2 w-full text-2xl font-bold focus:outline-none"
                  value={fromAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      setFromAmount(value);
                    }
                  }}
                  placeholder="0.00"
                  disabled={isSwapping}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Balance: {balances[fromToken] || "0.00"}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMaxClick}
                    disabled={isSwapping}
                    className="h-auto py-1 px-2 text-xs font-semibold text-accent hover:text-accent/80"
                  >
                    MAX
                  </Button>
                </div>
              </div>
            </div>

            {/* Flip Button */}
            <div className="flex justify-center -my-2">
              <button
                onClick={handleFlip}
                disabled={isSwapping}
                className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors disabled:opacity-50"
              >
                <ArrowDownUp className="w-5 h-5" />
              </button>
            </div>

            {/* To Token */}
            <div>
              <label className="block font-medium text-sm mb-2">
                To
                {isFetchingRoute && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    (Calculating...)
                  </span>
                )}
                {routeError && (
                  <span className="ml-2 text-xs text-destructive">
                    ({routeError})
                  </span>
                )}
              </label>
              <div className="glass-card p-4 rounded-xl space-y-3">
                <TokenSelect
                  value={toToken}
                  onChange={setToToken}
                  disabled={isSwapping}
                />
                <input
                  type="text"
                  className="bg-transparent px-0 py-2 w-full text-2xl font-bold focus:outline-none"
                  value={toAmount}
                  readOnly
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Balance: {balances[toToken] || "0.00"}
                </p>
              </div>
            </div>

            {/* Swap Button */}
            <Button
              onClick={handleSwap}
              disabled={
                isSwapping ||
                !currentAccount ||
                !fromAmount ||
                isFetchingRoute ||
                routeError !== "" ||
                parseFloat(fromAmount) <= 0
              }
              className="w-full btn-gradient h-12 text-lg font-semibold"
            >
              {isSwapping ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Swapping...
                </>
              ) : !currentAccount ? (
                "Connect Wallet"
              ) : routeError ? (
                "No Route Available"
              ) : (
                "Swap"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* <TxOverlay outcome={txOutcome} onClose={handleCloseTxOverlay} /> */}
    </>
  );
}
