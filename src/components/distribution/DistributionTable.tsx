import { DistributionStatusBadge } from "../badges/DistributionStatusBadge";
import type { DistributionStatus } from "../../types";

export interface DistributionTableRow {
  id: string;
  medicineName: string;
  pharmacyName: string;
  warehouseName: string;
  distributorName?: string;
  quantity: number;
  status: DistributionStatus;
  assignedAt: string;
}

interface DistributionTableProps {
  rows: DistributionTableRow[];
  /** Central Admin butuh lihat siapa yang menangani; Distributor tidak perlu. */
  showDistributorColumn?: boolean;
  /** Hanya diisi untuk Distributor — Central tidak melakukan lifecycle action. */
  onMarkInTransit?: (distributionId: string) => void;
  onMarkDelivered?: (distributionId: string) => void;
  /** Hanya diisi untuk Pharmacy Administrator (Tracking). */
  onConfirmReceipt?: (distributionId: string) => void;
  /** Opsional: buka detail/lifecycle view untuk satu row. */
  onViewDetail?: (row: DistributionTableRow) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function DistributionTable({
  rows,
  showDistributorColumn = false,
  onMarkInTransit,
  onMarkDelivered,
  onConfirmReceipt,
  onViewDetail,
}: DistributionTableProps) {
  const showActionColumn = Boolean(
    onMarkInTransit || onMarkDelivered || onConfirmReceipt || onViewDetail
  );

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-ink-200 bg-white p-10 text-center">
        <p className="text-sm text-ink-500">Tidak ada distribusi untuk ditampilkan.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white">
      <table className="w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-200 bg-ink-50 text-xs font-medium uppercase tracking-wide text-ink-500">
            <th className="px-4 py-3">Medicine</th>
            <th className="px-4 py-3">Pharmacy</th>
            <th className="px-4 py-3">Warehouse</th>
            {showDistributorColumn && <th className="px-4 py-3">Distributor</th>}
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Assigned</th>
            <th className="px-4 py-3">Status</th>
            {showActionColumn && <th className="px-4 py-3">Action</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-ink-100 last:border-0">
              <td className="px-4 py-3 font-medium text-ink-900">
                {row.medicineName}
              </td>
              <td className="px-4 py-3 text-ink-700">{row.pharmacyName}</td>
              <td className="px-4 py-3 text-ink-700">{row.warehouseName}</td>
              {showDistributorColumn && (
                <td className="px-4 py-3 text-ink-700">
                  {row.distributorName ?? "-"}
                </td>
              )}
              <td className="px-4 py-3 text-ink-700">{row.quantity} unit</td>
              <td className="px-4 py-3 text-ink-500">
                {formatDate(row.assignedAt)}
              </td>
              <td className="px-4 py-3">
                <DistributionStatusBadge status={row.status} />
              </td>
              {showActionColumn && (
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {row.status === "Assigned" && onMarkInTransit && (
                      <button
                        type="button"
                        onClick={() => onMarkInTransit(row.id)}
                        className="rounded-md border border-brand-600 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50"
                      >
                        Mark In Transit
                      </button>
                    )}
                    {row.status === "In Transit" && onMarkDelivered && (
                      <button
                        type="button"
                        onClick={() => onMarkDelivered(row.id)}
                        className="rounded-md border border-brand-600 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50"
                      >
                        Mark as Delivered
                      </button>
                    )}
                    {row.status === "Pharmacy Confirmation" &&
                      onConfirmReceipt && (
                        <button
                          type="button"
                          onClick={() => onConfirmReceipt(row.id)}
                          className="rounded-md bg-brand-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-800"
                        >
                          Confirm Receipt
                        </button>
                      )}
                    {row.status === "Pharmacy Confirmation" &&
                      !onConfirmReceipt && (
                        <span className="text-xs text-ink-500">
                          Menunggu konfirmasi pharmacy
                        </span>
                      )}
                    {row.status === "Distribution Completed" && (
                      <span className="text-xs text-ink-500">Selesai</span>
                    )}
                    {onViewDetail && (
                      <button
                        type="button"
                        onClick={() => onViewDetail(row)}
                        className="rounded-md border border-ink-300 px-3 py-1.5 text-xs font-medium text-ink-700 transition-colors hover:bg-ink-50"
                      >
                        Detail
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DistributionTable;
