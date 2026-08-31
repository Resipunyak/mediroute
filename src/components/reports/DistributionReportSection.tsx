import { ClipboardList, Truck, Hourglass, CheckCircle2 } from "lucide-react";
import { StatCard } from "../dashboard/StatCard";

export interface CompletedDistributionRow {
  id: string;
  medicineName: string;
  pharmacyName: string;
  warehouseName: string;
  distributorName: string;
  quantity: number;
  assignedAt: string;
}

interface DistributionReportSectionProps {
  assignedCount: number;
  inTransitCount: number;
  awaitingConfirmationCount: number;
  completedCount: number;
  recentCompleted: CompletedDistributionRow[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Breakdown mengikuti DistributionStatus LOCKED. "Delivered" sengaja tidak
// ditampilkan sebagai kartu terpisah karena status tersebut tidak pernah
// persisten (lihat distributionLifecycle.ts).
export function DistributionReportSection({
  assignedCount,
  inTransitCount,
  awaitingConfirmationCount,
  completedCount,
  recentCompleted,
}: DistributionReportSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-ink-900">
          Distribution Report
        </h2>
        <p className="text-sm text-ink-500">
          Ringkasan status distribusi dan riwayat distribusi yang selesai.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Assigned" value={assignedCount} icon={ClipboardList} tone="neutral" />
        <StatCard label="In Transit" value={inTransitCount} icon={Truck} tone="accent" />
        <StatCard
          label="Awaiting Confirmation"
          value={awaitingConfirmationCount}
          icon={Hourglass}
          tone="low"
        />
        <StatCard label="Completed" value={completedCount} icon={CheckCircle2} tone="safe" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white">
        <div className="border-b border-ink-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-ink-900">
            Historical Completed Distributions
          </h3>
        </div>
        {recentCompleted.length === 0 ? (
          <p className="p-6 text-center text-sm text-ink-500">
            Belum ada distribusi yang selesai.
          </p>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-xs font-medium uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">Medicine</th>
                <th className="px-4 py-3">Pharmacy</th>
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3">Distributor</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Assigned</th>
              </tr>
            </thead>
            <tbody>
              {recentCompleted.map((row) => (
                <tr key={row.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink-900">
                    {row.medicineName}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{row.pharmacyName}</td>
                  <td className="px-4 py-3 text-ink-700">{row.warehouseName}</td>
                  <td className="px-4 py-3 text-ink-700">{row.distributorName}</td>
                  <td className="px-4 py-3 text-ink-700">{row.quantity} unit</td>
                  <td className="px-4 py-3 text-ink-500">
                    {formatDate(row.assignedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default DistributionReportSection;
