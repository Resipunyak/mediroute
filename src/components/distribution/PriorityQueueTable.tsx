import { PriorityBadge } from "../badges/PriorityBadge";
import { StockStatusBadge } from "../badges/StockStatusBadge";
import type { PriorityLevel, StockStatus } from "../../types";

export interface PriorityQueueTableRow {
  id: string;
  pharmacyId: string;
  warehouseId: string;
  medicineId: string;
  pharmacyName: string;
  warehouseName: string;
  medicineName: string;
  currentStock: number;
  maxCapacity: number;
  stockPercentage: number;
  stockStatus: StockStatus;
  priorityLevel: PriorityLevel;
  requestedQuantity: number | null;
  reason: string;
  /** Derived dari ada/tidaknya restockRequestId — bukan field baru di data model. */
  source: "Automatic Detection" | "Manual Restock Request";
  restockRequestId?: string;
}

interface PriorityQueueTableProps {
  rows: PriorityQueueTableRow[];
  onReview: (row: PriorityQueueTableRow) => void;
}

export function PriorityQueueTable({ rows, onReview }: PriorityQueueTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-ink-200 bg-white p-10 text-center">
        <p className="text-sm text-ink-500">
          Tidak ada entry di Priority Queue saat ini.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-200 bg-ink-50 text-xs font-medium uppercase tracking-wide text-ink-500">
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Medicine</th>
            <th className="px-4 py-3">Pharmacy</th>
            <th className="px-4 py-3">Warehouse</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-ink-100 last:border-0">
              <td className="px-4 py-3">
                <PriorityBadge level={row.priorityLevel} />
              </td>
              <td className="px-4 py-3 font-medium text-ink-900">
                {row.medicineName}
              </td>
              <td className="px-4 py-3 text-ink-700">{row.pharmacyName}</td>
              <td className="px-4 py-3 text-ink-700">{row.warehouseName}</td>
              <td className="px-4 py-3">
                <StockStatusBadge
                  status={row.stockStatus}
                  percentage={row.stockPercentage}
                />
              </td>
              <td className="px-4 py-3 text-xs text-ink-500">{row.source}</td>
              <td
                className="max-w-[220px] truncate px-4 py-3 text-ink-500"
                title={row.reason}
              >
                {row.reason}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onReview(row)}
                  className="rounded-md border border-brand-600 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50"
                >
                  Review
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PriorityQueueTable;
