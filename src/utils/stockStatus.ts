import type { StockStatus } from "../types";

/**
 * Stock Percentage = Current Stock / Maximum Capacity × 100%
 * (LOCKED formula — Recovery Handoff bagian 5)
 */
export function calculateStockPercentage(
  currentStock: number,
  maxCapacity: number
): number {
  if (maxCapacity <= 0) return 0;
  return (currentStock / maxCapacity) * 100;
}

/**
 * LOCKED threshold:
 * Critical <= 25%
 * Low      26%–50%
 * Safe     > 50%
 */
export function getStockStatus(percentage: number): StockStatus {
  if (percentage <= 25) return "Critical";
  if (percentage <= 50) return "Low";
  return "Safe";
}
