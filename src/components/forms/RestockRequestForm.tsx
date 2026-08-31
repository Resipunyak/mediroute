import { useState, type FormEvent } from "react";
import { useAppData } from "../../context/AppDataContext";

interface RestockRequestFormProps {
  pharmacyId: string;
  warehouseId: string;
  /** Medicine yang sudah dipilih sebelumnya (misal dari tombol "Request Restock" di Inventory). */
  prefilledMedicineId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function RestockRequestForm({
  pharmacyId,
  warehouseId,
  prefilledMedicineId,
  onSuccess,
  onCancel,
}: RestockRequestFormProps) {
  const { medicines, inventory, warehouses, createRestockRequest } = useAppData();

  const [medicineId, setMedicineId] = useState(prefilledMedicineId ?? "");
  const [requestedQuantity, setRequestedQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{ medicine?: string; quantity?: string }>(
    {}
  );
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Current Stock otomatis berasal dari inventory — TIDAK dapat diedit manual.
  const currentStock =
    inventory.find(
      (item) => item.pharmacyId === pharmacyId && item.medicineId === medicineId
    )?.currentStock ?? null;

  // Destination warehouse SELALU mengikuti warehouse yang sudah ter-assign
  // ke pharmacy ini (LOCKED: satu pharmacy = satu warehouse, tidak ada
  // multi-warehouse sourcing). Ditampilkan read-only, bukan dropdown.
  const destinationWarehouseName =
    warehouses.find((w) => w.id === warehouseId)?.name ?? "-";

  function validate(): boolean {
    const nextErrors: { medicine?: string; quantity?: string } = {};

    if (!medicineId) {
      nextErrors.medicine = "Medicine wajib dipilih.";
    }

    const quantityNumber = Number(requestedQuantity);
    if (
      requestedQuantity.trim() === "" ||
      Number.isNaN(quantityNumber) ||
      quantityNumber <= 0
    ) {
      nextErrors.quantity = "Requested Quantity harus lebih besar dari 0.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    try {
      createRestockRequest({
        pharmacyId,
        warehouseId,
        medicineId,
        requestedQuantity: Number(requestedQuantity),
        reason,
      });
      onSuccess();
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Gagal membuat Restock Request. Silakan coba lagi."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700">
          Destination Warehouse
        </label>
        <input
          type="text"
          disabled
          readOnly
          value={destinationWarehouseName}
          className="w-full cursor-not-allowed rounded-md border border-ink-200 bg-ink-100 px-3 py-2 text-sm text-ink-500"
        />
        <p className="mt-1 text-xs text-ink-500">
          Otomatis mengikuti warehouse yang sudah ditugaskan ke pharmacy Anda.
        </p>
      </div>

      <div>
        <label
          htmlFor="medicine"
          className="mb-1.5 block text-sm font-medium text-ink-700"
        >
          Medicine
        </label>
        <select
          id="medicine"
          value={medicineId}
          onChange={(e) => setMedicineId(e.target.value)}
          className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
        >
          <option value="">Pilih medicine...</option>
          {medicines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        {errors.medicine && (
          <p className="mt-1 text-xs text-critical-700">{errors.medicine}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink-700">
          Current Stock
        </label>
        <input
          type="text"
          disabled
          readOnly
          value={
            medicineId
              ? currentStock !== null
                ? `${currentStock} unit`
                : "-"
              : "Pilih medicine terlebih dahulu"
          }
          className="w-full cursor-not-allowed rounded-md border border-ink-200 bg-ink-100 px-3 py-2 text-sm text-ink-500"
        />
      </div>

      <div>
        <label
          htmlFor="requestedQuantity"
          className="mb-1.5 block text-sm font-medium text-ink-700"
        >
          Requested Quantity
        </label>
        <input
          id="requestedQuantity"
          type="number"
          min={1}
          value={requestedQuantity}
          onChange={(e) => setRequestedQuantity(e.target.value)}
          placeholder="0"
          className="w-full rounded-md border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
        />
        {errors.quantity && (
          <p className="mt-1 text-xs text-critical-700">{errors.quantity}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="reason"
          className="mb-1.5 block text-sm font-medium text-ink-700"
        >
          Reason / Note
        </label>
        <textarea
          id="reason"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Jelaskan alasan permintaan restock..."
          className="w-full resize-none rounded-md border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
        />
      </div>

      {submitError && (
        <p className="text-sm text-critical-700">{submitError}</p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50"
        >
          Batal
        </button>
        <button
          type="submit"
          className="rounded-md bg-brand-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800"
        >
          Kirim Request
        </button>
      </div>
    </form>
  );
}

export default RestockRequestForm;
