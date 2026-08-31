import { useMemo } from "react";
import { useAppData } from "../context/AppDataContext";
import { calculateStockPercentage, getStockStatus } from "../utils/stockStatus";
import {
  WarehouseSummaryCard,
  type WarehouseSummaryCardData,
} from "../components/warehouse/WarehouseSummaryCard";

export default function Warehouses() {
  const { warehouses, pharmacies, inventory } = useAppData();

  const cards: WarehouseSummaryCardData[] = useMemo(() => {
    return warehouses.map((w) => {
      const warehousePharmacyIds = pharmacies
        .filter((p) => p.warehouseId === w.id)
        .map((p) => p.id);

      const warehouseInventory = inventory.filter((i) =>
        warehousePharmacyIds.includes(i.pharmacyId)
      );

      let criticalCount = 0;
      let lowCount = 0;
      let safeCount = 0;

      for (const item of warehouseInventory) {
        const status = getStockStatus(
          calculateStockPercentage(item.currentStock, item.maxCapacity)
        );
        if (status === "Critical") criticalCount++;
        else if (status === "Low") lowCount++;
        else safeCount++;
      }

      return {
        id: w.id,
        name: w.name,
        slug: w.name.toLowerCase(),
        pharmacyCount: warehousePharmacyIds.length,
        inventoryItemCount: warehouseInventory.length,
        criticalCount,
        lowCount,
        safeCount,
      };
    });
  }, [warehouses, pharmacies, inventory]);

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Warehouses</h1>
        <p className="mt-1 text-sm text-ink-500">
          Ringkasan seluruh warehouse dalam jaringan MediRoute.
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="rounded-xl border border-ink-200 bg-white p-10 text-center">
          <p className="text-sm text-ink-500">Belum ada data warehouse.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <WarehouseSummaryCard key={card.id} data={card} />
          ))}
        </div>
      )}
    </div>
  );
}
