import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Package,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAppData } from "../context/AppDataContext";
import { calculateStockPercentage, getStockStatus } from "../utils/stockStatus";
import { StatCard } from "../components/dashboard/StatCard";
import {
  InventoryTable,
  type InventoryRow,
} from "../components/inventory/InventoryTable";

export default function WarehouseDetail() {
  const { name } = useParams<{ name: string }>();
  const { warehouses, pharmacies, medicines, inventory } = useAppData();

  const warehouse = warehouses.find(
    (w) => w.name.toLowerCase() === (name ?? "").toLowerCase()
  );

  const warehousePharmacies = useMemo(
    () => (warehouse ? pharmacies.filter((p) => p.warehouseId === warehouse.id) : []),
    [warehouse, pharmacies]
  );

  const rows: InventoryRow[] = useMemo(() => {
    if (!warehouse) return [];
    const pharmacyIds = warehousePharmacies.map((p) => p.id);

    return inventory
      .filter((i) => pharmacyIds.includes(i.pharmacyId))
      .map((item) => {
        const pharmacy = pharmacies.find((p) => p.id === item.pharmacyId);
        const medicine = medicines.find((m) => m.id === item.medicineId);
        const percentage = calculateStockPercentage(
          item.currentStock,
          item.maxCapacity
        );

        return {
          id: item.id,
          pharmacyId: item.pharmacyId,
          pharmacyName: pharmacy?.name ?? "-",
          warehouseName: warehouse.name,
          medicineId: item.medicineId,
          medicineName: medicine?.name ?? "-",
          currentStock: item.currentStock,
          maxCapacity: item.maxCapacity,
          percentage,
          status: getStockStatus(percentage),
        };
      });
  }, [warehouse, warehousePharmacies, inventory, pharmacies, medicines]);

  const criticalCount = rows.filter((r) => r.status === "Critical").length;
  const lowCount = rows.filter((r) => r.status === "Low").length;
  const safeCount = rows.filter((r) => r.status === "Safe").length;

  if (!warehouse) {
    return (
      <div className="space-y-4 p-4 sm:p-8">
        <Link
          to="/warehouses"
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Warehouses
        </Link>
        <div className="rounded-xl border border-ink-200 bg-white p-10 text-center">
          <p className="text-sm text-ink-500">
            Warehouse "{name}" tidak ditemukan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div>
        <Link
          to="/warehouses"
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Warehouses
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-ink-900">
          {warehouse.name}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {warehousePharmacies.length} pharmacy · {rows.length} inventory item
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <StatCard label="Pharmacies" value={warehousePharmacies.length} icon={Building2} tone="brand" />
        <StatCard label="Inventory Items" value={rows.length} icon={Package} tone="neutral" />
        <StatCard label="Critical" value={criticalCount} icon={AlertTriangle} tone="critical" />
        <StatCard label="Low" value={lowCount} icon={AlertCircle} tone="low" />
        <StatCard label="Safe" value={safeCount} icon={CheckCircle2} tone="safe" />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-ink-900">Pharmacies</h2>
        <div className="flex flex-wrap gap-2">
          {warehousePharmacies.map((p) => (
            <span
              key={p.id}
              className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700"
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-ink-900">Inventory</h2>
        <InventoryTable rows={rows} showPharmacyColumn />
      </div>
    </div>
  );
}
