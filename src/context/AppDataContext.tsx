import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  Warehouse,
  Pharmacy,
  Medicine,
  InventoryItem,
  RestockRequest,
  Distribution,
  PriorityQueueEntry,
} from "../types";

import { warehouses as initialWarehouses } from "../data/warehouses";
import { pharmacies as initialPharmacies } from "../data/pharmacies";
import { medicines as initialMedicines } from "../data/medicines";
import { inventory as initialInventory } from "../data/inventory";
import { restockRequests as initialRestockRequests } from "../data/restockRequests";
import { distributions as initialDistributions } from "../data/distributions";

import { generatePriorityQueue } from "../utils/priorityLogic";
import {
  assignDistribution,
  markInTransit as markInTransitLogic,
  markDelivered as markDeliveredLogic,
  confirmReceipt as confirmReceiptLogic,
} from "../utils/distributionLifecycle";

interface CreateRestockRequestInput {
  pharmacyId: string;
  warehouseId: string;
  medicineId: string;
  requestedQuantity: number;
  reason: string;
}

interface AssignDistributionInput {
  warehouseId: string;
  pharmacyId: string;
  medicineId: string;
  quantity: number;
  distributorId: string;
  restockRequestId?: string;
}

interface AppDataContextValue {
  // Static-ish reference data
  warehouses: Warehouse[];
  pharmacies: Pharmacy[];
  medicines: Medicine[];

  // Mutable data
  inventory: InventoryItem[];
  restockRequests: RestockRequest[];
  distributions: Distribution[];

  // Derived data (LOCKED: Priority Queue tidak disimpan sebagai state permanen)
  priorityQueue: PriorityQueueEntry[];

  // Actions
  createRestockRequest: (input: CreateRestockRequestInput) => void;
  approveAndAssignDistribution: (input: AssignDistributionInput) => void;
  /**
   * LOCKED (Phase 2, decision 1 — B1): reject tidak membuat Distribution
   * baru dan tidak mengubah lifecycle apa pun. Entry tetap berada di
   * Priority Queue karena tidak ada perubahan state. Fungsi ini sengaja
   * tidak melakukan apa-apa terhadap data — disediakan sebagai titik
   * ekstensi UI (misalnya untuk menampilkan toast) tanpa memengaruhi state.
   */
  rejectQueueEntry: () => void;
  markDistributionInTransit: (distributionId: string) => void;
  markDistributionDelivered: (distributionId: string) => void;
  confirmDistributionReceipt: (distributionId: string) => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(
  undefined
);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [inventory] = useState<InventoryItem[]>(initialInventory);
  const [restockRequests, setRestockRequests] = useState<RestockRequest[]>(
    initialRestockRequests
  );
  const [distributions, setDistributions] = useState<Distribution[]>(
    initialDistributions
  );

  const priorityQueue = useMemo(
    () =>
      generatePriorityQueue(
        inventory,
        restockRequests,
        distributions,
        initialPharmacies
      ),
    [inventory, restockRequests, distributions]
  );

  function createRestockRequest(input: CreateRestockRequestInput): void {
    if (!input.medicineId) {
      throw new Error("Medicine wajib dipilih.");
    }
    if (input.requestedQuantity <= 0) {
      throw new Error("Requested Quantity harus lebih besar dari 0.");
    }

    const newRequest: RestockRequest = {
      id: `rr-${crypto.randomUUID()}`,
      pharmacyId: input.pharmacyId,
      warehouseId: input.warehouseId,
      medicineId: input.medicineId,
      requestedQuantity: input.requestedQuantity,
      reason: input.reason,
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    setRestockRequests((prev) => [...prev, newRequest]);
  }

  function approveAndAssignDistribution(
    input: AssignDistributionInput
  ): void {
    const newDistribution = assignDistribution({
      id: `dst-${crypto.randomUUID()}`,
      ...input,
    });

    setDistributions((prev) => [...prev, newDistribution]);

    if (input.restockRequestId) {
      setRestockRequests((prev) =>
        prev.map((r) =>
          r.id === input.restockRequestId ? { ...r, status: "Approved" } : r
        )
      );
    }
  }

  function rejectQueueEntry(): void {
    // Sesuai LOCKED decision B1: tidak ada perubahan state.
  }

  function markDistributionInTransit(distributionId: string): void {
    setDistributions((prev) =>
      prev.map((d) =>
        d.id === distributionId ? markInTransitLogic(d) : d
      )
    );
  }

  function markDistributionDelivered(distributionId: string): void {
    setDistributions((prev) =>
      prev.map((d) =>
        d.id === distributionId ? markDeliveredLogic(d) : d
      )
    );
  }

  function confirmDistributionReceipt(distributionId: string): void {
    setDistributions((prev) =>
      prev.map((d) =>
        d.id === distributionId ? confirmReceiptLogic(d) : d
      )
    );
  }

  return (
    <AppDataContext.Provider
      value={{
        warehouses: initialWarehouses,
        pharmacies: initialPharmacies,
        medicines: initialMedicines,
        inventory,
        restockRequests,
        distributions,
        priorityQueue,
        createRestockRequest,
        approveAndAssignDistribution,
        rejectQueueEntry,
        markDistributionInTransit,
        markDistributionDelivered,
        confirmDistributionReceipt,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
}
