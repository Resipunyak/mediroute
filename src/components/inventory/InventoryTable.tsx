import { StockStatusBadge } from "../badges/StockStatusBadge";
import type { StockStatus } from "../../types";

export interface InventoryRow {
  id: string;
  pharmacyName: string;
  warehouseName: string;
  medicineName: string;
  medicineId: string;
  pharmacyId: string;
  currentStock: number;
  maxCapacity: number;
  percentage: number;
  status: StockStatus;
}

interface InventoryTableProps {
  rows: InventoryRow[];
  /** Tampilkan kolom Pharmacy & Warehouse (hanya relevan untuk Central Admin). */
  showPharmacyColumn?: boolean;
  /** Jika diisi, menampilkan kolom aksi "Request Restock" (Pharmacy Admin). */
  onRequestRestock?: (row: InventoryRow) => void;
}

export function InventoryTable({
  rows,
  showPharmacyColumn = false,
  onRequestRestock,
}: InventoryTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-ink-200 bg-white p-10 text-center">
        <p className="text-sm text-ink-500">
          Tidak ada data inventory yang cocok dengan filter saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-200 bg-ink-50 text-xs font-medium uppercase tracking-wide text-ink-500">
            {showPharmacyColumn && (
              <>
                <th className="px-4 py-3">Pharmacy</th>
                <th className="px-4 py-3">Warehouse</th>
              </>
            )}
            <th className="px-4 py-3">Medicine</th>
            <th className="px-4 py-3">Current Stock</th>
            <th className="px-4 py-3">Max Capacity</th>
            <th className="px-4 py-3">Stock Percentage</th>
            <th className="px-4 py-3">Status</th>
            {onRequestRestock && <th className="px-4 py-3">Action</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-ink-100 last:border-0">
              {showPharmacyColumn && (
                <>
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {row.pharmacyName}
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {row.warehouseName}
                  </td>
                </>
              )}
              <td className="px-4 py-3 text-ink-900">{row.medicineName}</td>
              <td className="px-4 py-3 text-ink-700">{row.currentStock}</td>
              <td className="px-4 py-3 text-ink-700">{row.maxCapacity}</td>
              <td className="px-4 py-3 text-ink-700">
                {Math.round(row.percentage)}%
              </td>
              <td className="px-4 py-3">
                <StockStatusBadge status={row.status} />
              </td>
              {onRequestRestock && (
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onRequestRestock(row)}
                    className="rounded-md border border-brand-600 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50"
                  >
                    Request Restock
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryTable;
