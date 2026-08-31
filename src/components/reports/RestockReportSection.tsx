import { ClipboardList, Clock, ListOrdered, CheckCircle2 } from "lucide-react";
import { StatCard } from "../dashboard/StatCard";

interface RestockReportSectionProps {
  totalRequests: number;
  pendingCount: number;
  inQueueCount: number;
  approvedCount: number;
}

// Hanya 3 status yang benar-benar ada di RestockRequestStatus (types/index.ts):
// Pending, In Queue, Approved. Tidak ada status "Completed" — union tersebut
// tidak pernah didefinisikan di data model, jadi tidak ditampilkan di sini.
export function RestockReportSection({
  totalRequests,
  pendingCount,
  inQueueCount,
  approvedCount,
}: RestockReportSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-ink-900">
          Restock Request Report
        </h2>
        <p className="text-sm text-ink-500">
          Ringkasan status restock request di seluruh jaringan.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Requests"
          value={totalRequests}
          icon={ClipboardList}
          tone="neutral"
        />
        <StatCard label="Pending" value={pendingCount} icon={Clock} tone="low" />
        <StatCard
          label="In Queue"
          value={inQueueCount}
          icon={ListOrdered}
          tone="accent"
        />
        <StatCard
          label="Approved"
          value={approvedCount}
          icon={CheckCircle2}
          tone="safe"
        />
      </div>
    </section>
  );
}

export default RestockReportSection;
