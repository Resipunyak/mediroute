import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppDataContext";
import { hasCapability } from "../utils/roleAccess";
import {
  RestockRequestTable,
  type RestockRequestRow,
} from "../components/restock/RestockRequestTable";
import { RestockRequestModal } from "../components/forms/RestockRequestModal";

export default function RestockRequest() {
  const { currentUser } = useAuth();
  const { restockRequests, pharmacies, medicines, inventory } = useAppData();
  const [isCreateOpen, setCreateOpen] = useState(false);

  if (!currentUser) return null;

  const canReviewAll = hasCapability(currentUser.role, "reviewRestockRequests");
  const canCreate = hasCapability(currentUser.role, "createRestockRequest");

  // Pharmacy Administrator hanya melihat request miliknya sendiri —
  // difilter di level data, bukan hanya disembunyikan secara visual.
  const scopedRequests = canReviewAll
    ? restockRequests
    : restockRequests.filter((r) => r.pharmacyId === currentUser.pharmacyId);

  const rows: RestockRequestRow[] = useMemo(() => {
    return scopedRequests
      .map((request) => {
        const pharmacy = pharmacies.find((p) => p.id === request.pharmacyId);
        const medicine = medicines.find((m) => m.id === request.medicineId);
        const currentStock =
          inventory.find(
            (item) =>
              item.pharmacyId === request.pharmacyId &&
              item.medicineId === request.medicineId
          )?.currentStock ?? null;

        return {
          id: request.id,
          medicineName: medicine?.name ?? "-",
          pharmacyName: pharmacy?.name ?? "-",
          currentStock,
          requestedQuantity: request.requestedQuantity,
          status: request.status,
          reason: request.reason,
          createdAt: request.createdAt,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [scopedRequests, pharmacies, medicines, inventory]);

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">
            Restock Request
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {canReviewAll
              ? "Review seluruh restock request dari jaringan pharmacy."
              : "Buat dan pantau restock request pharmacy Anda."}
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex items-center justify-center gap-2 rounded-md bg-brand-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800 sm:justify-start"
          >
            <Plus className="h-4 w-4" />
            New Request
          </button>
        )}
      </div>

      <RestockRequestTable rows={rows} showPharmacyColumn={canReviewAll} />

      {canCreate && (
        <RestockRequestModal
          open={isCreateOpen}
          onClose={() => setCreateOpen(false)}
        />
      )}
    </div>
  );
}
