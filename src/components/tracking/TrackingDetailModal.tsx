import { CheckCircle2 } from "lucide-react";
import { Modal } from "../common/Modal";
import type { DistributionTableRow } from "../distribution/DistributionTable";
import type { DistributionStatus } from "../../types";

interface TrackingDetailModalProps {
  open: boolean;
  row: DistributionTableRow | null;
  onClose: () => void;
}

// 4 tahap yang benar-benar PERSISTEN (lihat distributionLifecycle.ts —
// "Delivered" adalah nama aksi Distributor, bukan status yang pernah
// tersimpan). Stepper ini sengaja tidak menampilkan "Delivered" sebagai
// node terpisah agar konsisten dengan implementasi lifecycle yang LOCKED.
const LIFECYCLE_STEPS: DistributionStatus[] = [
  "Assigned",
  "In Transit",
  "Pharmacy Confirmation",
  "Distribution Completed",
];

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function TrackingDetailModal({
  open,
  row,
  onClose,
}: TrackingDetailModalProps) {
  if (!row) return null;

  const currentStepIndex = LIFECYCLE_STEPS.indexOf(row.status);

  return (
    <Modal open={open} onClose={onClose} title="Distribution Detail">
      <div className="mb-5">
        <ol className="flex items-center">
          {LIFECYCLE_STEPS.map((step, index) => {
            const isDone = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            return (
              <li key={step} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isDone
                        ? "bg-safe-600 text-white"
                        : isCurrent
                          ? "bg-brand-900 text-white"
                          : "bg-ink-100 text-ink-500"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                  </div>
                  <span
                    className={`w-16 text-center text-[10px] leading-tight ${
                      isCurrent ? "font-semibold text-ink-900" : "text-ink-500"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {index < LIFECYCLE_STEPS.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 flex-1 ${
                      isDone ? "bg-safe-600" : "bg-ink-200"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="divide-y divide-ink-100">
        <InfoRow label="Medicine" value={row.medicineName} />
        <InfoRow label="Quantity" value={`${row.quantity} unit`} />
        <InfoRow label="Source Warehouse" value={row.warehouseName} />
        <InfoRow label="Destination Pharmacy" value={row.pharmacyName} />
        {row.distributorName && (
          <InfoRow label="Distributor" value={row.distributorName} />
        )}
        <InfoRow label="Assigned Date" value={formatDate(row.assignedAt)} />
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

export default TrackingDetailModal;
