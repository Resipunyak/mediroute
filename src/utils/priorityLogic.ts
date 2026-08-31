import type {
  InventoryItem,
  RestockRequest,
  Distribution,
  Pharmacy,
  PriorityQueueEntry,
  PriorityLevel,
  StockStatus,
} from "../types";
import { calculateStockPercentage, getStockStatus } from "./stockStatus";

/**
 * LOCKED priority mapping (Recovery Handoff bagian 6):
 *
 *   Critical -> High
 *   Low      -> Medium
 *   Safe (tanpa manual request) -> tidak masuk queue
 *   Safe + manual restock request -> Low
 *
 * Tidak ada AI/ML/forecasting — murni rule-based.
 */
function getBasePriorityFromStockStatus(
  status: StockStatus
): PriorityLevel | null {
  if (status === "Critical") return "High";
  if (status === "Low") return "Medium";
  return null; // Safe alone never queues
}

/** Restock request masih dianggap "aktif" untuk queue selama belum Approved. */
function isActiveRequestStatus(
  status: RestockRequest["status"]
): boolean {
  return status === "Pending" || status === "In Queue";
}

function buildReason(
  stockStatus: StockStatus,
  percentage: number,
  hasActiveRequest: boolean
): string {
  const roundedPercentage = Math.round(percentage);

  if (stockStatus === "Safe") {
    // Hanya mungkin muncul di sini kalau hasActiveRequest === true,
    // karena Safe tanpa request tidak pernah masuk queue.
    return "Safe stock with manual restock request";
  }

  const base = `${stockStatus} stock level (${roundedPercentage}%)`;
  return hasActiveRequest ? `${base} + active restock request` : base;
}

/**
 * Menghasilkan Priority Distribution Queue.
 *
 * Menggabungkan automatic stock detection + manual restock request.
 * Entry yang sudah memiliki Distribution aktif (belum "Distribution
 * Completed") untuk pharmacy+medicine yang sama TIDAK dimunculkan lagi
 * (exclusion rule, Recovery Handoff bagian 6).
 *
 * Urutan (Recovery Handoff bagian 6):
 *   1. Priority level: High > Medium > Low
 *   2. Jika sama: stock percentage terendah lebih dulu
 *   3. Jika masih sama: active restock request didahulukan
 */
export function generatePriorityQueue(
  inventory: InventoryItem[],
  restockRequests: RestockRequest[],
  distributions: Distribution[],
  pharmacies: Pharmacy[]
): PriorityQueueEntry[] {
  const entries: PriorityQueueEntry[] = [];
  const warehouseIdByPharmacyId = new Map(
    pharmacies.map((p) => [p.id, p.warehouseId])
  );

  for (const item of inventory) {
    const hasActiveDistribution = distributions.some(
      (d) =>
        d.pharmacyId === item.pharmacyId &&
        d.medicineId === item.medicineId &&
        d.status !== "Distribution Completed"
    );
    if (hasActiveDistribution) continue; // exclusion rule

    const activeRequest = restockRequests.find(
      (r) =>
        r.pharmacyId === item.pharmacyId &&
        r.medicineId === item.medicineId &&
        isActiveRequestStatus(r.status)
    );
    const hasActiveRequest = Boolean(activeRequest);

    const percentage = calculateStockPercentage(
      item.currentStock,
      item.maxCapacity
    );
    const stockStatus = getStockStatus(percentage);
    const basePriority = getBasePriorityFromStockStatus(stockStatus);

    let priorityLevel: PriorityLevel;
    if (basePriority === null) {
      if (!hasActiveRequest) continue; // Safe tanpa request -> tidak masuk queue
      priorityLevel = "Low";
    } else {
      priorityLevel = basePriority;
    }

    entries.push({
      pharmacyId: item.pharmacyId,
      warehouseId: warehouseIdByPharmacyId.get(item.pharmacyId) ?? "",
      medicineId: item.medicineId,
      stockPercentage: percentage,
      stockStatus,
      priorityLevel,
      hasActiveRequest,
      restockRequestId: activeRequest?.id,
      reason: buildReason(stockStatus, percentage, hasActiveRequest),
    });
  }

  const priorityRank: Record<PriorityLevel, number> = {
    High: 0,
    Medium: 1,
    Low: 2,
  };

  return entries.sort((a, b) => {
    if (priorityRank[a.priorityLevel] !== priorityRank[b.priorityLevel]) {
      return priorityRank[a.priorityLevel] - priorityRank[b.priorityLevel];
    }
    if (a.stockPercentage !== b.stockPercentage) {
      return a.stockPercentage - b.stockPercentage;
    }
    // active request didahulukan (true sebelum false)
    return Number(b.hasActiveRequest) - Number(a.hasActiveRequest);
  });
}
