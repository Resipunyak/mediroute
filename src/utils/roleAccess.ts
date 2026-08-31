import type { Role } from "../types";

export const ROLE_LABELS: Record<Role, string> = {
  central_supply_administrator: "Central Supply Administrator",
  distributor: "Distributor / Logistics Officer",
  pharmacy_administrator: "Pharmacy Administrator",
};

/**
 * Capability per role (Recovery Handoff bagian 10 & Phase 2 bagian 16).
 * Ini adalah fondasi permission — role guard di routing/UI akan
 * memanfaatkan helper ini pada phase implementasi berikutnya.
 */
export type Capability =
  // Central Supply Administrator
  | "viewNetworkDashboard"
  | "viewNetworkInventory"
  | "reviewRestockRequests"
  | "reviewPriorityQueue"
  | "approveDistribution"
  | "assignDistributor"
  | "viewNetworkTracking"
  | "viewWarehouses"
  | "viewReports"
  // Distributor
  | "viewOwnDeliveries"
  | "updateDeliveryStatus"
  | "viewOwnTracking"
  // Pharmacy Administrator
  | "viewOwnInventory"
  | "createRestockRequest"
  | "viewOwnRestockRequests"
  | "viewIncomingDistributions"
  | "confirmReceipt";

const ROLE_CAPABILITIES: Record<Role, Capability[]> = {
  central_supply_administrator: [
    "viewNetworkDashboard",
    "viewNetworkInventory",
    "reviewRestockRequests",
    "reviewPriorityQueue",
    "approveDistribution",
    "assignDistributor",
    "viewNetworkTracking",
    "viewWarehouses",
    "viewReports",
  ],
  distributor: ["viewOwnDeliveries", "updateDeliveryStatus", "viewOwnTracking"],
  pharmacy_administrator: [
    "viewOwnInventory",
    "createRestockRequest",
    "viewOwnRestockRequests",
    "viewIncomingDistributions",
    "confirmReceipt",
    "viewOwnTracking",
  ],
};

export function hasCapability(role: Role, capability: Capability): boolean {
  return ROLE_CAPABILITIES[role].includes(capability);
}
