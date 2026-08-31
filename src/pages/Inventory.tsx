import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppDataContext";
import { hasCapability } from "../utils/roleAccess";
import { calculateStockPercentage, getStockStatus } from "../utils/stockStatus";
import { InventorySummaryCards } from "../components/inventory/InventorySummaryCards";
import { InventoryFilters } from "../components/inventory/InventoryFilters";
import { InventoryTable, type InventoryRow } from "../components/inventory/InventoryTable";
import { RestockRequestModal } from "../components/forms/RestockRequestModal";
import type { StockStatus } from "../types";

export default function Inventory() {
  const { currentUser } = useAuth();
  const { inventory, pharmacies, warehouses, medicines } = useAppData();

  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState<string | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StockStatus | "all">("all");
  const [restockTarget, setRestockTarget] = useState<InventoryRow | null>(null);

  if (!currentUser) return null;

  const isNetworkView = hasCapability(currentUser.role, "viewNetworkInventory");
  const isOwnView = hasCapability(currentUser.role, "viewOwnInventory");

  // Pharmacy Administrator hanya melihat pharmacy miliknya (role access + data filtering,
  // bukan hanya UI — inventory difilter sebelum dirender sama sekali).
  const scopedInventory = isNetworkView
    ? inventory
    : inventory.filter((item) => item.pharmacyId === currentUser.pharmacyId);

  const rows: InventoryRow[] = useMemo(() => {
    return scopedInventory.map((item) => {
      const pharmacy = pharmacies.find((p) => p.id === item.pharmacyId);
      const warehouse = warehouses.find((w) => w.id === pharmacy?.warehouseId);
      const medicine = medicines.find((m) => m.id === item.medicineId);
      const percentage = calculateStockPercentage(
        item.currentStock,
        item.maxCapacity
      );

      return {
        id: item.id,
        pharmacyId: item.pharmacyId,
        pharmacyName: pharmacy?.name ?? "-",
        warehouseName: warehouse?.name ?? "-",
        medicineId: item.medicineId,
        medicineName: medicine?.name ?? "-",
        currentStock: item.currentStock,
        maxCapacity: item.maxCapacity,
        percentage,
        status: getStockStatus(percentage),
      };
    });
  }, [scopedInventory, pharmacies, warehouses, medicines]);

  const filteredRows = rows.filter((row) => {
    const matchesSearch =
      search.trim() === "" ||
      row.medicineName.toLowerCase().includes(search.toLowerCase()) ||
      row.pharmacyName.toLowerCase().includes(search.toLowerCase());

    const matchesWarehouse =
      warehouseFilter === "all" ||
      pharmacies.find((p) => p.id === row.pharmacyId)?.warehouseId ===
        warehouseFilter;

    const matchesStatus = statusFilter === "all" || row.status === statusFilter;

    return matchesSearch && matchesWarehouse && matchesStatus;
  });

  const criticalCount = rows.filter((r) => r.status === "Critical").length;
  const lowCount = rows.filter((r) => r.status === "Low").length;
  const safeCount = rows.filter((r) => r.status === "Safe").length;

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Inventory</h1>
        <p className="mt-1 text-sm text-ink-500">
          {isNetworkView
            ? "Pantau kondisi stok obat di seluruh jaringan warehouse dan pharmacy."
            : "Pantau kondisi stok obat di pharmacy Anda."}
        </p>
      </div>

      {isNetworkView && (
        <InventorySummaryCards
          criticalCount={criticalCount}
          lowCount={lowCount}
          safeCount={safeCount}
        />
      )}

      {isNetworkView && (
        <InventoryFilters
          searchValue={search}
          onSearchChange={setSearch}
          warehouses={warehouses}
          selectedWarehouseId={warehouseFilter}
          onWarehouseChange={setWarehouseFilter}
          selectedStatus={statusFilter}
          onStatusChange={setStatusFilter}
        />
      )}

      <InventoryTable
        rows={filteredRows}
        showPharmacyColumn={isNetworkView}
        onRequestRestock={isOwnView ? (row) => setRestockTarget(row) : undefined}
      />

      {isOwnView && restockTarget && (
        <RestockRequestModal
          open={Boolean(restockTarget)}
          onClose={() => setRestockTarget(null)}
          prefilledMedicineId={restockTarget.medicineId}
        />
      )}
    </div>
  );
}
