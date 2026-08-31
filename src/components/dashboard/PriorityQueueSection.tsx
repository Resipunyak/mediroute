import { Link } from "react-router-dom";
import { PriorityBadge } from "../badges/PriorityBadge";
import { StockStatusBadge } from "../badges/StockStatusBadge";

export interface PriorityQueueRow {
  id: string;
  pharmacyName: string;
  warehouseName: string;
  medicineName: string;
  priorityLevel: "High" | "Medium" | "Low";
  stockStatus: "Critical" | "Low" | "Safe";
  stockPercentage: number;
  reason: string;
}

interface PriorityQueueSectionProps {
  rows: PriorityQueueRow[];
  totalCount: number;
}

export function PriorityQueueSection({
  rows,
  totalCount,
}: PriorityQueueSectionProps) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white">
      <div className="flex items-center justify-between border-b border-ink-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-ink-900">
            Priority Distribution Queue
          </h2>
          <p className="mt-0.5 text-xs text-ink-500">
            {totalCount} entry membutuhkan perhatian
          </p>
        </div>
        <Link
          to="/distribution"
          className="text-xs font-medium text-brand-700 hover:underline"
        >
          Lihat semua →
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-ink-500">
          Tidak ada entry di Priority Queue saat ini.
        </p>
      ) : (
        <ul className="divide-y divide-ink-100">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center justify-between px-5 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-900">
                  {row.medicineName} — {row.pharmacyName}
                </p>
                <p className="mt-0.5 truncate text-xs text-ink-500">
                  {row.warehouseName} · {row.reason}
                </p>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-2">
                <StockStatusBadge status={row.stockStatus} />
                <PriorityBadge level={row.priorityLevel} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PriorityQueueSection;
