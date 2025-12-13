import { SUI_CONFIG } from "@/config/sui.config";

const BASIS_POINTS = 10000;
const CURVE_STEEPNESS = 1000;

export function calculateMarketPrice(
  baseValue: number,
  totalShares: number,
  circulatingShares: number,
  curveSteepness: number = CURVE_STEEPNESS
): number {
  if (totalShares === 0 || circulatingShares === 0) {
    return baseValue;
  }

  if (circulatingShares > totalShares) {
    return baseValue;
  }

  const utilizationBps = (circulatingShares * BASIS_POINTS) / totalShares;

  const premiumBps = (utilizationBps * curveSteepness) / BASIS_POINTS;

  const multiplier = BASIS_POINTS + premiumBps;

  return (baseValue * multiplier) / BASIS_POINTS;
}

export function calculateBuyCost(
  baseValue: number,
  totalShares: number,
  circulatingShares: number,
  sharesToBuy: number,
  curveSteepness: number = CURVE_STEEPNESS
): number {
  const currentPrice = calculateMarketPrice(
    baseValue,
    totalShares,
    circulatingShares,
    curveSteepness
  );

  const newCirculating = circulatingShares + sharesToBuy;
  const futurePrice = calculateMarketPrice(
    baseValue,
    totalShares,
    newCirculating,
    curveSteepness
  );

  const avgPrice = (currentPrice + futurePrice) / 2;
  return avgPrice * sharesToBuy;
}

export function calculateSellPayout(
  baseValue: number,
  totalShares: number,
  circulatingShares: number,
  sharesToSell: number,
  curveSteepness: number = CURVE_STEEPNESS
): number {
  const currentPrice = calculateMarketPrice(
    baseValue,
    totalShares,
    circulatingShares,
    curveSteepness
  );

  const newCirculating = circulatingShares - sharesToSell;
  const futurePrice = calculateMarketPrice(
    baseValue,
    totalShares,
    newCirculating,
    curveSteepness
  );

  const avgPrice = (currentPrice + futurePrice) / 2;
  return avgPrice * sharesToSell;
}

export function calculatePriceImpact(
  baseValue: number,
  totalShares: number,
  circulatingShares: number,
  shares: number,
  isBuy: boolean,
  curveSteepness: number = CURVE_STEEPNESS
): number {
  const currentPrice = calculateMarketPrice(
    baseValue,
    totalShares,
    circulatingShares,
    curveSteepness
  );

  const newCirculating = isBuy
    ? circulatingShares + shares
    : circulatingShares - shares;

  const newPrice = calculateMarketPrice(
    baseValue,
    totalShares,
    newCirculating,
    curveSteepness
  );

  return ((newPrice - currentPrice) / currentPrice) * 100;
}
