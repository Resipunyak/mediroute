import { useMemo } from "react";
import { useAppData } from "../context/AppDataContext";
import { users } from "../data/users";
import { calculateStockPercentage, getStockStatus } from "../utils/stockStatus";
import {
  InventoryReportSection,
  type WarehouseBreakdownRow,
  type PharmacyBreakdownRow,
} from "../components/reports/InventoryReportSection";
import { RestockReportSection } from "../components/reports/RestockReportSection";
import {
  DistributionReportSection,
  type CompletedDistributionRow,
} from "../components/reports/DistributionReportSection";

export default function Reports() {
  const {
    inventory,
    pharmacies,
    warehouses,
    medicines,
    restockRequests,
    distributions,
  } = useAppData();

  // --- Inventory Report ---
  const inventoryReport = useMemo(() => {
    let criticalCount = 0;
    let lowCount = 0;
    let safeCount = 0;

    for (const item of inventory) {
      const status = getStockStatus(
        calculateStockPercentage(item.currentStock, item.maxCapacity)
      );
      if (status === "Critical") criticalCount++;
      else if (status === "Low") lowCount++;
      else safeCount++;
    }

    const warehouseBreakdown: WarehouseBreakdownRow[] = warehouses.map((w) => {
      const warehousePharmacyIds = pharmacies
        .filter((p) => p.warehouseId === w.id)
        .map((p) => p.id);
      const items = inventory.filter((i) =>
        warehousePharmacyIds.includes(i.pharmacyId)
      );

      let c = 0;
      let l = 0;
      let s = 0;
      for (const item of items) {
        const status = getStockStatus(
          calculateStockPercentage(item.currentStock, item.maxCapacity)
        );
        if (status === "Critical") c++;
        else if (status === "Low") l++;
        else s++;
      }

      return {
        id: w.id,
        name: w.name,
        pharmacyCount: warehousePharmacyIds.length,
        criticalCount: c,
        lowCount: l,
        safeCount: s,
      };
    });

    const pharmacyBreakdown: PharmacyBreakdownRow[] = pharmacies.map((p) => {
      const items = inventory.filter((i) => i.pharmacyId === p.id);
      const warehouseName = warehouses.find((w) => w.id === p.warehouseId)?.name ?? "-";

      let c = 0;
      let l = 0;
      let s = 0;
      for (const item of items) {
        const status = getStockStatus(
          calculateStockPercentage(item.currentStock, item.maxCapacity)
        );
        if (status === "Critical") c++;
        else if (status === "Low") l++;
        else s++;
      }

      return {
        id: p.id,
        name: p.name,
        warehouseName,
        criticalCount: c,
        lowCount: l,
        safeCount: s,
      };
    });

    return {
      totalItems: inventory.length,
      criticalCount,
      lowCount,
      safeCount,
      warehouseBreakdown,
      pharmacyBreakdown,
    };
  }, [inventory, pharmacies, warehouses]);

  // --- Restock Request Report ---
  const restockReport = useMemo(() => {
    return {
      totalRequests: restockRequests.length,
      pendingCount: restockRequests.filter((r) => r.status === "Pending").length,
      inQueueCount: restockRequests.filter((r) => r.status === "In Queue").length,
      approvedCount: restockRequests.filter((r) => r.status === "Approved").length,
    };
  }, [restockRequests]);

  // --- Distribution Report ---
  const distributionReport = useMemo(() => {
    const recentCompleted: CompletedDistributionRow[] = distributions
      .filter((d) => d.status === "Distribution Completed")
      .sort(
        (a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
      )
      .map((d) => ({
        id: d.id,
        medicineName: medicines.find((m) => m.id === d.medicineId)?.name ?? "-",
        pharmacyName: pharmacies.find((p) => p.id === d.pharmacyId)?.name ?? "-",
        warehouseName: warehouses.find((w) => w.id === d.warehouseId)?.name ?? "-",
        distributorName: users.find((u) => u.id === d.distributorId)?.fullName ?? "-",
        quantity: d.quantity,
        assignedAt: d.assignedAt,
      }));

    return {
      assignedCount: distributions.filter((d) => d.status === "Assigned").length,
      inTransitCount: distributions.filter((d) => d.status === "In Transit").length,
      awaitingConfirmationCount: distributions.filter(
        (d) => d.status === "Pharmacy Confirmation"
      ).length,
      completedCount: recentCompleted.length,
      recentCompleted,
    };
  }, [distributions, medicines, pharmacies, warehouses]);

  const hasAnyData =
    inventory.length > 0 || restockRequests.length > 0 || distributions.length > 0;

  return (
    <div className="space-y-8 p-4 sm:p-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Reports</h1>
        <p className="mt-1 text-sm text-ink-500">
          Ringkasan historis kondisi jaringan MediRoute.
        </p>
      </div>

      {!hasAnyData ? (
        <div className="rounded-xl border border-ink-200 bg-white p-10 text-center">
          <p className="text-sm text-ink-500">Belum ada data untuk ditampilkan.</p>
        </div>
      ) : (
        <>
          <InventoryReportSection {...inventoryReport} />
          <RestockReportSection {...restockReport} />
          <DistributionReportSection {...distributionReport} />
        </>
      )}
    </div>
  );
}
