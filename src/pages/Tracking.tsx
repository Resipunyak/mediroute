import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppDataContext";
import { hasCapability } from "../utils/roleAccess";
import { users } from "../data/users";
import {
  DistributionTable,
  type DistributionTableRow,
} from "../components/distribution/DistributionTable";
import { DistributionFilters } from "../components/distribution/DistributionFilters";
import { TrackingSummaryCards } from "../components/tracking/TrackingSummaryCards";
import { TrackingDetailModal } from "../components/tracking/TrackingDetailModal";
import type { DistributionStatus } from "../types";

export default function Tracking() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const isNetworkView = hasCapability(currentUser.role, "viewNetworkTracking");
  const isPharmacy = hasCapability(currentUser.role, "confirmReceipt");

  if (isNetworkView) return <CentralTrackingView />;
  if (isPharmacy)
    return <PharmacyTrackingView pharmacyId={currentUser.pharmacyId ?? ""} />;
  return <DistributorTrackingView distributorId={currentUser.id} />;
}

// ========================================================================
// Shared helpers
// ========================================================================

function useDistributionRows(
  source: ReturnType<typeof useAppData>["distributions"]
): DistributionTableRow[] {
  const { pharmacies, warehouses, medicines } = useAppData();

  return useMemo(
    () =>
      source.map((d) => ({
        id: d.id,
        medicineName: medicines.find((m) => m.id === d.medicineId)?.name ?? "-",
        pharmacyName: pharmacies.find((p) => p.id === d.pharmacyId)?.name ?? "-",
        warehouseName: warehouses.find((w) => w.id === d.warehouseId)?.name ?? "-",
        distributorName: users.find((u) => u.id === d.distributorId)?.fullName ?? "-",
        quantity: d.quantity,
        status: d.status,
        assignedAt: d.assignedAt,
      })),
    [source, pharmacies, warehouses, medicines]
  );
}

function applyFilters(
  rows: DistributionTableRow[],
  search: string,
  statusFilter: DistributionStatus | "all"
): DistributionTableRow[] {
  return rows.filter((row) => {
    const matchesSearch =
      search.trim() === "" ||
      row.medicineName.toLowerCase().includes(search.toLowerCase()) ||
      row.pharmacyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || row.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
}

// ========================================================================
// CENTRAL SUPPLY ADMINISTRATOR — network visibility, view-only
// ========================================================================

function CentralTrackingView() {
  const { distributions } = useAppData();
  const rows = useDistributionRows(distributions);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DistributionStatus | "all">("all");
  const [detailRow, setDetailRow] = useState<DistributionTableRow | null>(null);

  const filteredRows = applyFilters(rows, search, statusFilter);

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Tracking</h1>
        <p className="mt-1 text-sm text-ink-500">
          Visibilitas seluruh distribusi di jaringan MediRoute.
        </p>
      </div>

      <DistributionFilters
        searchValue={search}
        onSearchChange={setSearch}
        selectedStatus={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <DistributionTable
        rows={filteredRows}
        showDistributorColumn
        onViewDetail={setDetailRow}
      />

      <TrackingDetailModal
        open={detailRow !== null}
        row={detailRow}
        onClose={() => setDetailRow(null)}
      />
    </div>
  );
}

// ========================================================================
// DISTRIBUTOR / LOGISTICS OFFICER — own deliveries, lifecycle update
// ========================================================================

function DistributorTrackingView({ distributorId }: { distributorId: string }) {
  const { distributions, markDistributionInTransit, markDistributionDelivered } =
    useAppData();

  const ownDistributions = useMemo(
    () => distributions.filter((d) => d.distributorId === distributorId),
    [distributions, distributorId]
  );
  const rows = useDistributionRows(ownDistributions);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DistributionStatus | "all">("all");
  const [detailRow, setDetailRow] = useState<DistributionTableRow | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredRows = applyFilters(rows, search, statusFilter);

  function handleMarkInTransit(id: string) {
    setActionError(null);
    try {
      markDistributionInTransit(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal memperbarui status.");
    }
  }

  function handleMarkDelivered(id: string) {
    setActionError(null);
    try {
      markDistributionDelivered(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal memperbarui status.");
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Tracking</h1>
        <p className="mt-1 text-sm text-ink-500">
          Pantau dan perbarui status pengiriman Anda.
        </p>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-md bg-critical-100 px-4 py-3 text-sm text-critical-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {actionError}
        </div>
      )}

      <DistributionFilters
        searchValue={search}
        onSearchChange={setSearch}
        selectedStatus={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <DistributionTable
        rows={filteredRows}
        onMarkInTransit={handleMarkInTransit}
        onMarkDelivered={handleMarkDelivered}
        onViewDetail={setDetailRow}
      />

      <TrackingDetailModal
        open={detailRow !== null}
        row={detailRow}
        onClose={() => setDetailRow(null)}
      />
    </div>
  );
}

// ========================================================================
// PHARMACY ADMINISTRATOR — own incoming deliveries, Confirm Receipt
// ========================================================================

function PharmacyTrackingView({ pharmacyId }: { pharmacyId: string }) {
  const { distributions, confirmDistributionReceipt } = useAppData();

  // Data difilter di level data sebelum render (bukan hanya disembunyikan
  // secara visual) — Pharmacy Admin hanya pernah melihat distribusi miliknya.
  const ownDistributions = useMemo(
    () => distributions.filter((d) => d.pharmacyId === pharmacyId),
    [distributions, pharmacyId]
  );
  const rows = useDistributionRows(ownDistributions);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DistributionStatus | "all">("all");
  const [detailRow, setDetailRow] = useState<DistributionTableRow | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filteredRows = applyFilters(rows, search, statusFilter);

  const activeCount = ownDistributions.filter(
    (d) => d.status !== "Distribution Completed"
  ).length;
  const inTransitCount = ownDistributions.filter(
    (d) => d.status === "In Transit"
  ).length;
  const awaitingConfirmationCount = ownDistributions.filter(
    (d) => d.status === "Pharmacy Confirmation"
  ).length;
  const completedCount = ownDistributions.filter(
    (d) => d.status === "Distribution Completed"
  ).length;

  function handleConfirmReceipt(distributionId: string) {
    setActionError(null);
    setSuccessMessage(null);

    // Defensive validation di level UI sebelum memanggil context — mencegah
    // Confirm Receipt terhadap distribution yang bukan milik pharmacy ini
    // atau yang statusnya bukan "Pharmacy Confirmation", meskipun secara
    // praktis baris yang dirender sudah pasti milik pharmacy ini (data
    // sudah difilter di atas).
    const target = ownDistributions.find((d) => d.id === distributionId);
    if (!target) {
      setActionError("Distribution tidak ditemukan atau bukan milik pharmacy Anda.");
      return;
    }
    if (target.status !== "Pharmacy Confirmation") {
      setActionError("Confirm Receipt hanya berlaku untuk status Pharmacy Confirmation.");
      return;
    }

    try {
      confirmDistributionReceipt(distributionId);
      setSuccessMessage("Distribution berhasil dikonfirmasi diterima.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Gagal melakukan Confirm Receipt."
      );
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Tracking</h1>
        <p className="mt-1 text-sm text-ink-500">
          Pantau distribusi yang masuk ke pharmacy Anda.
        </p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-md bg-safe-100 px-4 py-3 text-sm text-safe-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      )}
      {actionError && (
        <div className="flex items-center gap-2 rounded-md bg-critical-100 px-4 py-3 text-sm text-critical-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {actionError}
        </div>
      )}

      <TrackingSummaryCards
        activeCount={activeCount}
        inTransitCount={inTransitCount}
        awaitingConfirmationCount={awaitingConfirmationCount}
        completedCount={completedCount}
      />

      <DistributionFilters
        searchValue={search}
        onSearchChange={setSearch}
        selectedStatus={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {rows.length === 0 ? (
        <div className="rounded-xl border border-ink-200 bg-white p-10 text-center">
          <p className="text-sm text-ink-500">Belum ada delivery masuk.</p>
        </div>
      ) : (
        <DistributionTable
          rows={filteredRows}
          onConfirmReceipt={handleConfirmReceipt}
          onViewDetail={setDetailRow}
        />
      )}

      <TrackingDetailModal
        open={detailRow !== null}
        row={detailRow}
        onClose={() => setDetailRow(null)}
      />
    </div>
  );
}
