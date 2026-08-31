// MediRoute — Type Definitions
// Source of truth: MediRoute Recovery Handoff + Phase 2 LOCKED decisions.

// ----------------------------------------------------------------------
// Role
// ----------------------------------------------------------------------

export type Role =
  | "central_supply_administrator"
  | "distributor"
  | "pharmacy_administrator";

// ----------------------------------------------------------------------
// User
// ----------------------------------------------------------------------

export interface User {
  id: string;
  fullName: string;
  email: string;
  /** Mock authentication only — never a real credential. */
  password: string;
  role: Role;
  /** Only set when role === "pharmacy_administrator". */
  pharmacyId?: string;
}

// ----------------------------------------------------------------------
// Network structure: Warehouse / Pharmacy / Medicine
// ----------------------------------------------------------------------

export interface Warehouse {
  id: string;
  name: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  /** Every pharmacy has exactly one assigned warehouse (LOCKED). */
  warehouseId: string;
}

export interface Medicine {
  id: string;
  name: string;
  unit: string;
}

// ----------------------------------------------------------------------
// Inventory
// ----------------------------------------------------------------------

export interface InventoryItem {
  id: string;
  pharmacyId: string;
  medicineId: string;
  currentStock: number;
  maxCapacity: number;
}

// ----------------------------------------------------------------------
// Stock classification (LOCKED thresholds)
// ----------------------------------------------------------------------

export type StockStatus = "Critical" | "Low" | "Safe";

// ----------------------------------------------------------------------
// Restock Request
// ----------------------------------------------------------------------

export type RestockRequestStatus = "Pending" | "In Queue" | "Approved";

export interface RestockRequest {
  id: string;
  pharmacyId: string;
  warehouseId: string;
  medicineId: string;
  requestedQuantity: number;
  reason: string;
  status: RestockRequestStatus;
  /** LOCKED (Phase 2, decision 3): minimal metadata for sorting/history. */
  createdAt: string;
}

// ----------------------------------------------------------------------
// Dynamic Priority Distribution — derived/computed, never persisted.
// ----------------------------------------------------------------------

export type PriorityLevel = "High" | "Medium" | "Low";

export interface PriorityQueueEntry {
  pharmacyId: string;
  warehouseId: string;
  medicineId: string;
  stockPercentage: number;
  stockStatus: StockStatus;
  priorityLevel: PriorityLevel;
  hasActiveRequest: boolean;
  restockRequestId?: string;
  /** Human-readable explanation, e.g. "Critical stock level (18%)". */
  reason: string;
}

// ----------------------------------------------------------------------
// Distribution lifecycle (LOCKED — do not reorder or add statuses)
// ----------------------------------------------------------------------

export type DistributionStatus =
  | "Assigned"
  | "In Transit"
  | "Delivered"
  | "Pharmacy Confirmation"
  | "Distribution Completed";

export interface Distribution {
  id: string;
  warehouseId: string;
  pharmacyId: string;
  medicineId: string;
  quantity: number;
  distributorId: string;
  status: DistributionStatus;
  /** Present when this distribution originated from a manual restock request. */
  restockRequestId?: string;
  assignedAt: string;
}
