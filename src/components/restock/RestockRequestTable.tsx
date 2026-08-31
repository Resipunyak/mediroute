import type { RestockRequestStatus } from "../../types";

export interface RestockRequestRow {
  id: string;
  medicineName: string;
  pharmacyName: string;
  currentStock: number | null;
  requestedQuantity: number;
  status: RestockRequestStatus;
  reason: string;
  createdAt: string;
}

interface RestockRequestTableProps {
  rows: RestockRequestRow[];
  showPharmacyColumn?: boolean;
}

const STATUS_STYLES: Record<RestockRequestStatus, string> = {
  Pending: "bg-ink-100 text-ink-700",
  "In Queue": "bg-low-100 text-low-700",
  Approved: "bg-safe-100 text-safe-700",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function RestockRequestTable({
  rows,
  showPharmacyColumn = false,
}: RestockRequestTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-ink-200 bg-white p-10 text-center">
        <p className="text-sm text-ink-500">Belum ada restock request.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-ink-200 bg-ink-50 text-xs font-medium uppercase tracking-wide text-ink-500">
            <th className="px-4 py-3">Medicine</th>
            {showPharmacyColumn && <th className="px-4 py-3">Pharmacy</th>}
            <th className="px-4 py-3">Current Stock</th>
            <th className="px-4 py-3">Requested Qty</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-ink-100 last:border-0">
              <td className="px-4 py-3 font-medium text-ink-900">
                {row.medicineName}
              </td>
              {showPharmacyColumn && (
                <td className="px-4 py-3 text-ink-700">{row.pharmacyName}</td>
              )}
              <td className="px-4 py-3 text-ink-700">
                {row.currentStock ?? "-"}
              </td>
              <td className="px-4 py-3 text-ink-700">
                {row.requestedQuantity}
              </td>
              <td className="max-w-[220px] truncate px-4 py-3 text-ink-500" title={row.reason}>
                {row.reason || "-"}
              </td>
              <td className="px-4 py-3 text-ink-500">
                {formatDate(row.createdAt)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[row.status]}`}
                >
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RestockRequestTable;
