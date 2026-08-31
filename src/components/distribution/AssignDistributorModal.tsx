import { useState, type FormEvent } from "react";
import { Modal } from "../common/Modal";
import { useAppData } from "../../context/AppDataContext";
import { users } from "../../data/users";
import type { PriorityQueueTableRow } from "./PriorityQueueTable";

interface AssignDistributorModalProps {
  open: boolean;
  row: PriorityQueueTableRow | null;
  onClose: () => void;
  onSuccess: () => void;
}

// Hanya user dengan role "distributor" yang boleh dipilih — diambil
// langsung dari data existing (src/data/users.ts), bukan dummy baru.
const DISTRIBUTOR_OPTIONS = users.filter((u) => u.role === "distributor");

export function AssignDistributorModal({
  open,
  row,
  onClose,
  onSuccess,
}: AssignDistributorModalProps) {
  const { approveAndAssignDistribution } = useAppData();

  const [distributorId, setDistributorId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [errors, setErrors] = useState<{ distributor?: string; quantity?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  function resetAndClose() {
    setDistributorId("");
    setQuantity("");
    setErrors({});
    setSubmitError(null);
    onClose();
  }

  if (!row) return null;

  // Prefill quantity dari requestedQuantity jika entry berasal dari manual
  // restock request (sesuai QUANTITY RULE). Untuk automatic detection,
  // tidak ada sumber quantity di data model — Central Admin mengisi manual
  // (konsisten dengan signature approveAndAssignDistribution existing yang
  // sudah mensyaratkan quantity sebagai input, bukan hasil formula).
  const defaultQuantity =
    row.requestedQuantity !== null ? String(row.requestedQuantity) : quantity;

  function validate(): boolean {
    const nextErrors: { distributor?: string; quantity?: string } = {};

    if (!distributorId) {
      nextErrors.distributor = "Distributor wajib dipilih.";
    }

    const quantityValue = Number(quantity || defaultQuantity);
    if (
      (quantity || defaultQuantity).trim() === "" ||
      Number.isNaN(quantityValue) ||
      quantityValue <= 0
    ) {
      nextErrors.quantity = "Quantity harus lebih besar dari 0.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!row || !validate()) return;

    const finalQuantity = Number(quantity || defaultQuantity);

    try {
      approveAndAssignDistribution({
        warehouseId: row.warehouseId,
        pharmacyId: row.pharmacyId,
        medicineId: row.medicineId,
        quantity: finalQuantity,
        distributorId,
        restockRequestId: row.restockRequestId,
      });
      onSuccess();
      resetAndClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Gagal melakukan assignment. Silakan coba lagi."
      );
    }
  }

  return (
    <Modal open={open} onClose={resetAndClose} title="Assign Distributor">
      <div className="mb-4 space-y-1 rounded-md bg-ink-50 p-3 text-sm">
        <p className="text-ink-900">
          <span className="font-medium">{row.medicineName}</span> —{" "}
          {row.pharmacyName}
        </p>
        <p className="text-xs text-ink-500">
          {row.warehouseName} · {row.source}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="distributor"
            className="mb-1.5 block text-sm font-medium text-ink-700"
          >
            Distributor
          </label>
          <select
            id="distributor"
            value={distributorId}
            onChange={(e) => setDistributorId(e.target.value)}
            className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          >
            <option value="">Pilih distributor...</option>
            {DISTRIBUTOR_OPTIONS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName}
              </option>
            ))}
          </select>
          {errors.distributor && (
            <p className="mt-1 text-xs text-critical-700">
              {errors.distributor}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="quantity"
            className="mb-1.5 block text-sm font-medium text-ink-700"
          >
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            value={quantity || defaultQuantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
          />
          {row.requestedQuantity !== null ? (
            <p className="mt-1 text-xs text-ink-500">
              Prefilled dari Requested Quantity ({row.requestedQuantity} unit).
              Dapat disesuaikan bila perlu.
            </p>
          ) : (
            <p className="mt-1 text-xs text-ink-500">
              Entry ini berasal dari automatic detection — masukkan quantity
              distribusi secara manual.
            </p>
          )}
          {errors.quantity && (
            <p className="mt-1 text-xs text-critical-700">{errors.quantity}</p>
          )}
        </div>

        {submitError && (
          <p className="text-sm text-critical-700">{submitError}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={resetAndClose}
            className="rounded-md border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-md bg-brand-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800"
          >
            Confirm Assignment
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AssignDistributorModal;
