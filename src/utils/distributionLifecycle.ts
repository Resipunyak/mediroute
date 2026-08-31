import type { Distribution, DistributionStatus } from "../types";

/**
 * LOCKED lifecycle (Recovery Handoff bagian 8):
 *
 *   Assigned -> In Transit -> Delivered -> Pharmacy Confirmation -> Distribution Completed
 *
 * Rekonsiliasi final: aksi "Mark as Delivered" oleh Distributor membawa
 * status internal LANGSUNG ke "Pharmacy Confirmation" (bukan berhenti di
 * "Delivered" sebagai state persisten terpisah). Pharmacy Confirmation
 * TIDAK PERNAH terjadi otomatis — hanya lewat aksi aktif confirmReceipt()
 * oleh Pharmacy Administrator.
 */

interface AssignDistributionInput {
  id: string;
  warehouseId: string;
  pharmacyId: string;
  medicineId: string;
  quantity: number;
  distributorId: string;
  restockRequestId?: string;
}

export function assignDistribution(
  input: AssignDistributionInput
): Distribution {
  return {
    ...input,
    status: "Assigned",
    assignedAt: new Date().toISOString(),
  };
}

function assertStatus(
  distribution: Distribution,
  expected: DistributionStatus
): void {
  if (distribution.status !== expected) {
    throw new Error(
      `Invalid transition: distribution "${distribution.id}" is "${distribution.status}", expected "${expected}".`
    );
  }
}

/** Assigned -> In Transit (dilakukan oleh Distributor). */
export function markInTransit(distribution: Distribution): Distribution {
  assertStatus(distribution, "Assigned");
  return { ...distribution, status: "In Transit" };
}

/**
 * In Transit -> Pharmacy Confirmation (dilakukan oleh Distributor,
 * aksi berlabel "Mark as Delivered").
 */
export function markDelivered(distribution: Distribution): Distribution {
  assertStatus(distribution, "In Transit");
  return { ...distribution, status: "Pharmacy Confirmation" };
}

/**
 * Pharmacy Confirmation -> Distribution Completed (dilakukan secara aktif
 * oleh Pharmacy Administrator — TIDAK otomatis).
 */
export function confirmReceipt(distribution: Distribution): Distribution {
  assertStatus(distribution, "Pharmacy Confirmation");
  return { ...distribution, status: "Distribution Completed" };
}
