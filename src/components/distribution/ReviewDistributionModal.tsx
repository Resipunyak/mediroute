import { Modal } from "../common/Modal";
import { PriorityBadge } from "../badges/PriorityBadge";
import { StockStatusBadge } from "../badges/StockStatusBadge";
import type { PriorityQueueTableRow } from "./PriorityQueueTable";

interface ReviewDistributionModalProps {
  open: boolean;
  row: PriorityQueueTableRow | null;
  onClose: () => void;
  /** Lanjut ke step Assign Distributor. Belum melakukan mutasi apa pun. */
  onApprove: (row: PriorityQueueTableRow) => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  );
}

export function ReviewDistributionModal({
  open,
  row,
  onClose,
  onApprove,
}: ReviewDistributionModalProps) {
  if (!row) return null;

  return (
    <Modal open={open} onClose={onClose} title="Review Priority Queue Entry">
      <div className="divide-y divide-ink-100">
        <InfoRow label="Medicine" value={row.medicineName} />
        <InfoRow label="Pharmacy" value={row.pharmacyName} />
        <InfoRow label="Warehouse" value={row.warehouseName} />
        <InfoRow
          label="Current Stock"
          value={`${row.currentStock} / ${row.maxCapacity} unit`}
        />
        <div className="flex items-center justify-between py-2 text-sm">
          <span className="text-ink-500">Stock Status</span>
          <StockStatusBadge
            status={row.stockStatus}
            percentage={row.stockPercentage}
          />
        </div>
        <div className="flex items-center justify-between py-2 text-sm">
          <span className="text-ink-500">Priority</span>
          <PriorityBadge level={row.priorityLevel} />
        </div>
        {row.requestedQuantity !== null && (
          <InfoRow
            label="Requested Quantity"
            value={`${row.requestedQuantity} unit`}
          />
        )}
        <InfoRow label="Source" value={row.source} />
        <div className="py-2">
          <p className="text-sm text-ink-500">Reason / Note</p>
          <p className="mt-1 text-sm text-ink-900">{row.reason}</p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
        >
          Close
        </button>
        <button
          type="button"
          onClick={() => onApprove(row)}
          className="rounded-md bg-brand-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800"
        >
          Approve
        </button>
      </div>
    </Modal>
  );
}

export default ReviewDistributionModal;
