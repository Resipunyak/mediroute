import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppDataContext";
import { hasCapability } from "../utils/roleAccess";
import {
  PriorityQueueTable,
  type PriorityQueueTableRow,
} from "../components/distribution/PriorityQueueTable";
import { PriorityQueueFilters } from "../components/distribution/PriorityQueueFilters";
import { ReviewDistributionModal } from "../components/distribution/ReviewDistributionModal";
import { AssignDistributorModal } from "../components/distribution/AssignDistributorModal";
import {
  DistributionTable,
  type DistributionTableRow,
} from "../components/distribution/DistributionTable";
import { DistributionFilters } from "../components/distribution/DistributionFilters";
import { users } from "../data/users";
import type { DistributionStatus, PriorityLevel } from "../types";

export default function Distribution() {
  const { currentUser } = useAuth();
  const canApprove = currentUser
    ? hasCapability(currentUser.role, "approveDistribution")
    : false;

  if (!currentUser) return null;

  return canApprove ? (
    <CentralDistributionView />
  ) : (
    <DistributorDistributionView distributorId={currentUser.id} />
  );
}

// ========================================================================
// CENTRAL SUPPLY ADMINISTRATOR
// ========================================================================

function CentralDistributionView() {
  const {
    inventory,
    pharmacies,
    warehouses,
    medicines,
    restockRequests,
    distributions,
    priorityQueue,
  } = useAppData();

  const [queueSearch, setQueueSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | "all">("all");
  const [distSearch, setDistSearch] = useState("");
  const [distStatusFilter, setDistStatusFilter] = useState<DistributionStatus | "all">("all");

  const [reviewRow, setReviewRow] = useState<PriorityQueueTableRow | null>(null);
  const [isReviewOpen, setReviewOpen] = useState(false);
  const [assignRow, setAssignRow] = useState<PriorityQueueTableRow | null>(null);
  const [isAssignOpen, setAssignOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const queueRows: PriorityQueueTableRow[] = useMemo(
    () =>
      priorityQueue.map((entry) => {
        const inventoryItem = inventory.find(
          (i) => i.pharmacyId === entry.pharmacyId && i.medicineId === entry.medicineId
        );
        const restockRequest = entry.restockRequestId
          ? restockRequests.find((r) => r.id === entry.restockRequestId)
          : undefined;

        return {
          id: `${entry.pharmacyId}-${entry.medicineId}`,
          pharmacyId: entry.pharmacyId,
          warehouseId: entry.warehouseId,
          medicineId: entry.medicineId,
          pharmacyName: pharmacies.find((p) => p.id === entry.pharmacyId)?.name ?? "-",
          warehouseName: warehouses.find((w) => w.id === entry.warehouseId)?.name ?? "-",
          medicineName: medicines.find((m) => m.id === entry.medicineId)?.name ?? "-",
          currentStock: inventoryItem?.currentStock ?? 0,
          maxCapacity: inventoryItem?.maxCapacity ?? 0,
          stockPercentage: entry.stockPercentage,
          stockStatus: entry.stockStatus,
          priorityLevel: entry.priorityLevel,
          requestedQuantity: restockRequest?.requestedQuantity ?? null,
          reason: entry.reason,
          source: entry.restockRequestId
            ? ("Manual Restock Request" as const)
            : ("Automatic Detection" as const),
          restockRequestId: entry.restockRequestId,
        };
      }),
    [priorityQueue, inventory, pharmacies, warehouses, medicines, restockRequests]
  );

  const filteredQueueRows = queueRows.filter((row) => {
    const matchesSearch =
      queueSearch.trim() === "" ||
      row.medicineName.toLowerCase().includes(queueSearch.toLowerCase()) ||
      row.pharmacyName.toLowerCase().includes(queueSearch.toLowerCase());
    const matchesPriority =
      priorityFilter === "all" || row.priorityLevel === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const distributionRows: DistributionTableRow[] = useMemo(
    () =>
      distributions.map((d) => ({
        id: d.id,
        medicineName: medicines.find((m) => m.id === d.medicineId)?.name ?? "-",
        pharmacyName: pharmacies.find((p) => p.id === d.pharmacyId)?.name ?? "-",
        warehouseName: warehouses.find((w) => w.id === d.warehouseId)?.name ?? "-",
        distributorName: users.find((u) => u.id === d.distributorId)?.fullName ?? "-",
        quantity: d.quantity,
        status: d.status,
        assignedAt: d.assignedAt,
      })),
    [distributions, medicines, pharmacies, warehouses]
  );

  const filteredDistributionRows = distributionRows.filter((row) => {
    const matchesSearch =
      distSearch.trim() === "" ||
      row.medicineName.toLowerCase().includes(distSearch.toLowerCase()) ||
      row.pharmacyName.toLowerCase().includes(distSearch.toLowerCase());
    const matchesStatus = distStatusFilter === "all" || row.status === distStatusFilter;
    return matchesSearch && matchesStatus;
  });

  function handleReview(row: PriorityQueueTableRow) {
    setReviewRow(row);
    setReviewOpen(true);
  }

  function handleApproveFromReview(row: PriorityQueueTableRow) {
    // Review -> Approve -> Assign Distributor: langkah "Approve" membawa ke
    // step Assign Distributor. Belum ada mutasi state di titik ini.
    setReviewOpen(false);
    setAssignRow(row);
    setAssignOpen(true);
  }

  function handleAssignSuccess() {
    setAssignOpen(false);
    setSuccessMessage("Distribution berhasil dibuat dan distributor sudah ditugaskan.");
    setTimeout(() => setSuccessMessage(null), 4000);
  }

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Distribution</h1>
        <p className="mt-1 text-sm text-ink-500">
          Review Priority Distribution Queue, approve, dan assign distributor.
        </p>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-md bg-safe-100 px-4 py-3 text-sm text-safe-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-ink-900">
          Priority Distribution Queue
        </h2>
        <PriorityQueueFilters
          searchValue={queueSearch}
          onSearchChange={setQueueSearch}
          selectedPriority={priorityFilter}
          onPriorityChange={setPriorityFilter}
        />
        <PriorityQueueTable rows={filteredQueueRows} onReview={handleReview} />
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-ink-900">
          Distribution Management
        </h2>
        <DistributionFilters
          searchValue={distSearch}
          onSearchChange={setDistSearch}
          selectedStatus={distStatusFilter}
          onStatusChange={setDistStatusFilter}
        />
        <DistributionTable rows={filteredDistributionRows} showDistributorColumn />
      </div>

      <ReviewDistributionModal
        open={isReviewOpen}
        row={reviewRow}
        onClose={() => setReviewOpen(false)}
        onApprove={handleApproveFromReview}
      />

      <AssignDistributorModal
        open={isAssignOpen}
        row={assignRow}
        onClose={() => setAssignOpen(false)}
        onSuccess={handleAssignSuccess}
      />
    </div>
  );
}

// ========================================================================
// DISTRIBUTOR / LOGISTICS OFFICER
// ========================================================================

function DistributorDistributionView({ distributorId }: { distributorId: string }) {
  const { distributions, pharmacies, warehouses, medicines, markDistributionInTransit, markDistributionDelivered } =
    useAppData();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DistributionStatus | "all">("all");
  const [actionError, setActionError] = useState<string | null>(null);

  const ownDistributions = useMemo(
    () => distributions.filter((d) => d.distributorId === distributorId),
    [distributions, distributorId]
  );

  const rows: DistributionTableRow[] = useMemo(
    () =>
      ownDistributions.map((d) => ({
        id: d.id,
        medicineName: medicines.find((m) => m.id === d.medicineId)?.name ?? "-",
        pharmacyName: pharmacies.find((p) => p.id === d.pharmacyId)?.name ?? "-",
        warehouseName: warehouses.find((w) => w.id === d.warehouseId)?.name ?? "-",
        quantity: d.quantity,
        status: d.status,
        assignedAt: d.assignedAt,
      })),
    [ownDistributions, medicines, pharmacies, warehouses]
  );

  const filteredRows = rows.filter((row) => {
    const matchesSearch =
      search.trim() === "" ||
      row.medicineName.toLowerCase().includes(search.toLowerCase()) ||
      row.pharmacyName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || row.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function handleMarkInTransit(distributionId: string) {
    setActionError(null);
    try {
      markDistributionInTransit(distributionId);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Gagal memperbarui status."
      );
    }
  }

  function handleMarkDelivered(distributionId: string) {
    setActionError(null);
    try {
      markDistributionDelivered(distributionId);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Gagal memperbarui status."
      );
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">
          Distribution — My Deliveries
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Pengiriman yang ditugaskan kepada Anda.
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
      />
    </div>
  );
}
