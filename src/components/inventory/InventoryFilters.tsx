import { Search } from "lucide-react";
import type { StockStatus, Warehouse } from "../../types";

interface InventoryFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  warehouses: Warehouse[];
  selectedWarehouseId: string | "all";
  onWarehouseChange: (warehouseId: string | "all") => void;
  selectedStatus: StockStatus | "all";
  onStatusChange: (status: StockStatus | "all") => void;
}

const STATUS_OPTIONS: (StockStatus | "all")[] = ["all", "Critical", "Low", "Safe"];

export function InventoryFilters({
  searchValue,
  onSearchChange,
  warehouses,
  selectedWarehouseId,
  onWarehouseChange,
  selectedStatus,
  onStatusChange,
}: InventoryFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari pharmacy atau medicine..."
          aria-label="Cari pharmacy atau medicine"
          className="w-full rounded-md border border-ink-300 py-2 pl-9 pr-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
        />
      </div>

      <select
        value={selectedWarehouseId}
        onChange={(e) => onWarehouseChange(e.target.value)}
        aria-label="Filter berdasarkan warehouse"
        className="rounded-md border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
      >
        <option value="all">Semua Warehouse</option>
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>

      <select
        value={selectedStatus}
        onChange={(e) =>
          onStatusChange(e.target.value as StockStatus | "all")
        }
        aria-label="Filter berdasarkan stock status"
        className="rounded-md border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status === "all" ? "Semua Status" : status}
          </option>
        ))}
      </select>
    </div>
  );
}

export default InventoryFilters;
