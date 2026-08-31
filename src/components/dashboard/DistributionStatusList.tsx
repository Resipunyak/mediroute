import { DistributionStatusBadge } from "../badges/DistributionStatusBadge";
import { StockStatusBadge } from "../badges/StockStatusBadge";
import type { DistributionStatus, StockStatus } from "../../types";

export interface DistributionListRow {
  id: string;
  medicineName: string;
  pharmacyName: string;
  warehouseName: string;
  quantity: number;
  status: DistributionStatus;
  /** Ditampilkan hanya jika relevan (misal untuk Central: siapa yang menangani). */
  distributorName?: string;
  /**
   * Opsional: kondisi stok medicine terkait saat ini (dari inventory).
   * Membantu Distributor memahami tingkat urgensi pengiriman tanpa
   * menyimpan/menambah field priority baru ke Distribution — status stok
   * dihitung live via stockStatus.ts (LOCKED threshold), bukan snapshot.
   */
  currentStockStatus?: StockStatus;
}

interface DistributionStatusListProps {
  title: string;
  description?: string;
  rows: DistributionListRow[];
  emptyMessage: string;
}

export function DistributionStatusList({
  title,
  description,
  rows,
  emptyMessage,
}: DistributionStatusListProps) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white">
      <div className="border-b border-ink-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
        {description && (
          <p className="mt-0.5 text-xs text-ink-500">{description}</p>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-ink-500">
          {emptyMessage}
        </p>
      ) : (
        <ul className="divide-y divide-ink-100">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between px-5 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-900">
                  {row.medicineName} ({row.quantity} unit)
                </p>
                <p className="mt-0.5 truncate text-xs text-ink-500">
                  {row.warehouseName} → {row.pharmacyName}
                  {row.distributorName && ` · ${row.distributorName}`}
                </p>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-2">
                {row.currentStockStatus && (
                  <StockStatusBadge status={row.currentStockStatus} />
                )}
                <DistributionStatusBadge status={row.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default DistributionStatusList;
