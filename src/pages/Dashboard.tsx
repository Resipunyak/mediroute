import { useMemo } from "react";
import {
  Truck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Building2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppDataContext";
import { calculateStockPercentage, getStockStatus } from "../utils/stockStatus";
import { StatCard } from "../components/dashboard/StatCard";
import {
  PriorityQueueSection,
  type PriorityQueueRow,
} from "../components/dashboard/PriorityQueueSection";
import {
  WarehouseOverviewSection,
  type WarehouseOverviewRow,
} from "../components/dashboard/WarehouseOverviewSection";
import {
  DistributionStatusList,
  type DistributionListRow,
} from "../components/dashboard/DistributionStatusList";
import { QuickNavGrid } from "../components/dashboard/QuickNavGrid";
import { RestockRequestTable } from "../components/restock/RestockRequestTable";
import type { Distribution } from "../types";

const ACTIVE_DISTRIBUTION_STATUSES: Distribution["status"][] = [
  "Assigned",
  "In Transit",
  "Delivered",
  "Pharmacy Confirmation",
];

export default function Dashboard() {
  const { currentUser } = useAuth();
  const {
    warehouses,
    pharmacies,
    medicines,
    inventory,
    restockRequests,
    distributions,
    priorityQueue,
  } = useAppData();

  if (!currentUser) return null;

  if (currentUser.role === "central_supply_administrator") {
    return (
      <CentralDashboard
        warehouses={warehouses}
        pharmacies={pharmacies}
        medicines={medicines}
        inventory={inventory}
        restockRequests={restockRequests}
        distributions={distributions}
        priorityQueue={priorityQueue}
      />
    );
  }

  if (currentUser.role === "distributor") {
    return (
      <DistributorDashboard
        distributorId={currentUser.id}
        distributorName={currentUser.fullName}
        pharmacies={pharmacies}
        warehouses={warehouses}
        medicines={medicines}
        distributions={distributions}
        inventory={inventory}
      />
    );
  }

  // pharmacy_administrator
  return (
    <PharmacyDashboard
      pharmacyId={currentUser.pharmacyId ?? ""}
      pharmacies={pharmacies}
      warehouses={warehouses}
      medicines={medicines}
      inventory={inventory}
      restockRequests={restockRequests}
      distributions={distributions}
    />
  );
}

// ========================================================================
// CENTRAL SUPPLY ADMINISTRATOR — network-level overview
// ========================================================================

interface CentralDashboardProps {
  warehouses: ReturnType<typeof useAppData>["warehouses"];
  pharmacies: ReturnType<typeof useAppData>["pharmacies"];
  medicines: ReturnType<typeof useAppData>["medicines"];
  inventory: ReturnType<typeof useAppData>["inventory"];
  restockRequests: ReturnType<typeof useAppData>["restockRequests"];
  distributions: ReturnType<typeof useAppData>["distributions"];
  priorityQueue: ReturnType<typeof useAppData>["priorityQueue"];
}

function CentralDashboard({
  warehouses,
  pharmacies,
  medicines,
  inventory,
  restockRequests,
  distributions,
  priorityQueue,
}: CentralDashboardProps) {
  const stockCounts = useMemo(() => {
    let critical = 0;
    let low = 0;
    let safe = 0;
    for (const item of inventory) {
      const status = getStockStatus(
        calculateStockPercentage(item.currentStock, item.maxCapacity)
      );
      if (status === "Critical") critical++;
      else if (status === "Low") low++;
      else safe++;
    }
    return { critical, low, safe };
  }, [inventory]);

  const activeDistributions = useMemo(
    () =>
      distributions.filter((d) =>
        ACTIVE_DISTRIBUTION_STATUSES.includes(d.status)
      ),
    [distributions]
  );

  const priorityRows: PriorityQueueRow[] = useMemo(
    () =>
      priorityQueue.slice(0, 6).map((entry) => ({
        id: `${entry.pharmacyId}-${entry.medicineId}`,
        pharmacyName:
          pharmacies.find((p) => p.id === entry.pharmacyId)?.name ?? "-",
        warehouseName:
          warehouses.find((w) => w.id === entry.warehouseId)?.name ?? "-",
        medicineName:
          medicines.find((m) => m.id === entry.medicineId)?.name ?? "-",
        priorityLevel: entry.priorityLevel,
        stockStatus: entry.stockStatus,
        stockPercentage: entry.stockPercentage,
        reason: entry.reason,
      })),
    [priorityQueue, pharmacies, warehouses, medicines]
  );

  const warehouseRows: WarehouseOverviewRow[] = useMemo(
    () =>
      warehouses.map((w) => {
        const warehousePharmacyIds = pharmacies
          .filter((p) => p.warehouseId === w.id)
          .map((p) => p.id);

        const criticalCount = inventory.filter((item) => {
          if (!warehousePharmacyIds.includes(item.pharmacyId)) return false;
          const status = getStockStatus(
            calculateStockPercentage(item.currentStock, item.maxCapacity)
          );
          return status === "Critical";
        }).length;

        return {
          id: w.id,
          name: w.name,
          slug: w.name.toLowerCase(),
          pharmacyCount: warehousePharmacyIds.length,
          criticalCount,
        };
      }),
    [warehouses, pharmacies, inventory]
  );

  const pendingReviewRows = useMemo(
    () =>
      restockRequests
        .filter((r) => r.status === "Pending" || r.status === "In Queue")
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5)
        .map((r) => ({
          id: r.id,
          medicineName: medicines.find((m) => m.id === r.medicineId)?.name ?? "-",
          pharmacyName: pharmacies.find((p) => p.id === r.pharmacyId)?.name ?? "-",
          currentStock:
            inventory.find(
              (i) => i.pharmacyId === r.pharmacyId && i.medicineId === r.medicineId
            )?.currentStock ?? null,
          requestedQuantity: r.requestedQuantity,
          status: r.status,
          reason: r.reason,
          createdAt: r.createdAt,
        })),
    [restockRequests, medicines, pharmacies, inventory]
  );

  const activeDistributionRows: DistributionListRow[] = useMemo(
    () =>
      activeDistributions.slice(0, 6).map((d) => ({
        id: d.id,
        medicineName: medicines.find((m) => m.id === d.medicineId)?.name ?? "-",
        pharmacyName: pharmacies.find((p) => p.id === d.pharmacyId)?.name ?? "-",
        warehouseName: warehouses.find((w) => w.id === d.warehouseId)?.name ?? "-",
        quantity: d.quantity,
        status: d.status,
      })),
    [activeDistributions, medicines, pharmacies, warehouses]
  );

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">
          Network Overview
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Kondisi jaringan distribusi obat MediRoute saat ini.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Critical stock" value={stockCounts.critical} icon={AlertTriangle} tone="critical" />
        <StatCard label="Low stock" value={stockCounts.low} icon={AlertCircle} tone="low" />
        <StatCard label="Safe stock" value={stockCounts.safe} icon={CheckCircle2} tone="safe" />
        <StatCard label="Active distributions" value={activeDistributions.length} icon={Truck} tone="accent" />
        <StatCard label="Priority queue" value={priorityQueue.length} icon={ClipboardList} tone="brand" />
        <StatCard label="Warehouses" value={warehouses.length} icon={Building2} tone="neutral" />
      </div>

      <QuickNavGrid role="central_supply_administrator" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PriorityQueueSection rows={priorityRows} totalCount={priorityQueue.length} />
        <WarehouseOverviewSection warehouses={warehouseRows} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DistributionStatusList
          title="Active Distributions"
          description="Distribusi yang sedang berjalan di seluruh jaringan"
          rows={activeDistributionRows}
          emptyMessage="Tidak ada distribusi aktif saat ini."
        />

        <div className="rounded-xl border border-ink-200 bg-white">
          <div className="border-b border-ink-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-ink-900">
              Restock Requests Perlu Direview
            </h2>
            <p className="mt-0.5 text-xs text-ink-500">
              {pendingReviewRows.length} request menunggu review
            </p>
          </div>
          <div className="p-4">
            <RestockRequestTable rows={pendingReviewRows} showPharmacyColumn />
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================================================
// DISTRIBUTOR / LOGISTICS OFFICER — own assigned deliveries
// ========================================================================

interface DistributorDashboardProps {
  distributorId: string;
  distributorName: string;
  pharmacies: ReturnType<typeof useAppData>["pharmacies"];
  warehouses: ReturnType<typeof useAppData>["warehouses"];
  medicines: ReturnType<typeof useAppData>["medicines"];
  distributions: ReturnType<typeof useAppData>["distributions"];
  inventory: ReturnType<typeof useAppData>["inventory"];
}

function DistributorDashboard({
  distributorId,
  distributorName,
  pharmacies,
  warehouses,
  medicines,
  distributions,
  inventory,
}: DistributorDashboardProps) {
  // Data filtering di level logic (bukan hanya UI) — distributor hanya
  // pernah melihat distribusinya sendiri.
  const ownDistributions = useMemo(
    () => distributions.filter((d) => d.distributorId === distributorId),
    [distributions, distributorId]
  );

  const activeOwn = ownDistributions.filter((d) =>
    ACTIVE_DISTRIBUTION_STATUSES.includes(d.status)
  );
  const completedOwn = ownDistributions.filter(
    (d) => d.status === "Distribution Completed"
  );

  const inTransitCount = ownDistributions.filter(
    (d) => d.status === "In Transit"
  ).length;
  const needsActionCount = ownDistributions.filter(
    (d) => d.status === "Assigned" || d.status === "In Transit"
  ).length;
  const completedCount = completedOwn.length;

  function toRow(d: (typeof ownDistributions)[number]): DistributionListRow {
    // Stock status saat ini untuk medicine+pharmacy terkait — ditampilkan
    // sebagai indikasi tingkat urgensi pengiriman (Phase 5 poin B4:
    // "Priority pengiriman"). Dihitung live via stockStatus.ts (LOCKED
    // threshold), BUKAN field priority baru yang disimpan di Distribution —
    // Distribution tidak pernah menyimpan priority (priority murni derived
    // data di priorityLogic.ts, sesuai Phase 2).
    const inventoryItem = inventory.find(
      (item) =>
        item.pharmacyId === d.pharmacyId && item.medicineId === d.medicineId
    );
    const currentStockStatus = inventoryItem
      ? getStockStatus(
          calculateStockPercentage(
            inventoryItem.currentStock,
            inventoryItem.maxCapacity
          )
        )
      : undefined;

    return {
      id: d.id,
      medicineName: medicines.find((m) => m.id === d.medicineId)?.name ?? "-",
      pharmacyName: pharmacies.find((p) => p.id === d.pharmacyId)?.name ?? "-",
      warehouseName: warehouses.find((w) => w.id === d.warehouseId)?.name ?? "-",
      quantity: d.quantity,
      status: d.status,
      currentStockStatus,
    };
  }

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">
          Dashboard — {distributorName}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Pengiriman yang menjadi tanggung jawab Anda.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Assigned deliveries" value={activeOwn.length} icon={ClipboardList} tone="brand" />
        <StatCard label="In Transit" value={inTransitCount} icon={Truck} tone="accent" />
        <StatCard label="Needs action" value={needsActionCount} icon={AlertCircle} tone="low" />
        <StatCard label="Completed" value={completedCount} icon={CheckCircle2} tone="safe" />
      </div>

      <DistributionStatusList
        title="My Deliveries"
        description="Pengiriman aktif yang ditugaskan kepada Anda"
        rows={activeOwn.map(toRow)}
        emptyMessage="Tidak ada pengiriman aktif saat ini."
      />

      <DistributionStatusList
        title="Delivery History"
        description="Riwayat pengiriman yang sudah Anda selesaikan"
        rows={completedOwn.map(toRow)}
        emptyMessage="Belum ada riwayat pengiriman yang selesai."
      />
    </div>
  );
}

// ========================================================================
// PHARMACY ADMINISTRATOR — own pharmacy overview
// ========================================================================

interface PharmacyDashboardProps {
  pharmacyId: string;
  pharmacies: ReturnType<typeof useAppData>["pharmacies"];
  warehouses: ReturnType<typeof useAppData>["warehouses"];
  medicines: ReturnType<typeof useAppData>["medicines"];
  inventory: ReturnType<typeof useAppData>["inventory"];
  restockRequests: ReturnType<typeof useAppData>["restockRequests"];
  distributions: ReturnType<typeof useAppData>["distributions"];
}

function PharmacyDashboard({
  pharmacyId,
  pharmacies,
  warehouses,
  medicines,
  inventory,
  restockRequests,
  distributions,
}: PharmacyDashboardProps) {
  const pharmacy = pharmacies.find((p) => p.id === pharmacyId);

  // Data filtering di level logic — pharmacy hanya melihat data miliknya.
  const ownInventory = useMemo(
    () => inventory.filter((item) => item.pharmacyId === pharmacyId),
    [inventory, pharmacyId]
  );
  const ownRequests = useMemo(
    () => restockRequests.filter((r) => r.pharmacyId === pharmacyId),
    [restockRequests, pharmacyId]
  );
  const ownDistributions = useMemo(
    () => distributions.filter((d) => d.pharmacyId === pharmacyId),
    [distributions, pharmacyId]
  );

  const stockCounts = useMemo(() => {
    let critical = 0;
    let low = 0;
    let safe = 0;
    for (const item of ownInventory) {
      const status = getStockStatus(
        calculateStockPercentage(item.currentStock, item.maxCapacity)
      );
      if (status === "Critical") critical++;
      else if (status === "Low") low++;
      else safe++;
    }
    return { critical, low, safe };
  }, [ownInventory]);

  const needsAttention = ownInventory
    .map((item) => {
      const percentage = calculateStockPercentage(
        item.currentStock,
        item.maxCapacity
      );
      return {
        item,
        percentage,
        status: getStockStatus(percentage),
      };
    })
    .filter((x) => x.status === "Critical" || x.status === "Low")
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 5);

  const incomingDistributionRows: DistributionListRow[] = ownDistributions
    .filter((d) => d.status !== "Distribution Completed")
    .map((d) => ({
      id: d.id,
      medicineName: medicines.find((m) => m.id === d.medicineId)?.name ?? "-",
      pharmacyName: pharmacy?.name ?? "-",
      warehouseName: warehouses.find((w) => w.id === d.warehouseId)?.name ?? "-",
      quantity: d.quantity,
      status: d.status,
    }));

  const requestRows = ownRequests
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      medicineName: medicines.find((m) => m.id === r.medicineId)?.name ?? "-",
      pharmacyName: pharmacy?.name ?? "-",
      currentStock:
        inventory.find(
          (i) => i.pharmacyId === r.pharmacyId && i.medicineId === r.medicineId
        )?.currentStock ?? null,
      requestedQuantity: r.requestedQuantity,
      status: r.status,
      reason: r.reason,
      createdAt: r.createdAt,
    }));

  return (
    <div className="space-y-6 p-4 sm:p-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">
          Dashboard — {pharmacy?.name ?? "Pharmacy"}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Kondisi stok dan proses restock/distribusi pharmacy Anda.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Critical stock" value={stockCounts.critical} icon={AlertTriangle} tone="critical" />
        <StatCard label="Low stock" value={stockCounts.low} icon={AlertCircle} tone="low" />
        <StatCard label="Safe stock" value={stockCounts.safe} icon={CheckCircle2} tone="safe" />
      </div>

      <div className="rounded-xl border border-ink-200 bg-white">
        <div className="border-b border-ink-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-ink-900">
            Obat yang Membutuhkan Perhatian
          </h2>
          <p className="mt-0.5 text-xs text-ink-500">
            Diurutkan dari stok paling rendah
          </p>
        </div>
        {needsAttention.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-ink-500">
            Semua stok dalam kondisi aman.
          </p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {needsAttention.map(({ item, percentage, status }) => {
              const medicine = medicines.find((m) => m.id === item.medicineId);
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <p className="text-sm font-medium text-ink-900">
                    {medicine?.name ?? "-"}
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-ink-500">
                      {item.currentStock}/{item.maxCapacity} unit
                    </span>
                    <span
                      className={
                        status === "Critical"
                          ? "font-medium text-critical-700"
                          : "font-medium text-low-700"
                      }
                    >
                      {status} ({Math.round(percentage)}%)
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DistributionStatusList
          title="Incoming Distributions"
          description="Distribusi yang sedang menuju pharmacy Anda"
          rows={incomingDistributionRows}
          emptyMessage="Tidak ada distribusi yang sedang menuju pharmacy Anda."
        />

        <div className="rounded-xl border border-ink-200 bg-white">
          <div className="border-b border-ink-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-ink-900">
              Restock Request Saya
            </h2>
            <p className="mt-0.5 text-xs text-ink-500">
              {ownRequests.length} total request
            </p>
          </div>
          <div className="p-4">
            <RestockRequestTable rows={requestRows} />
          </div>
        </div>
      </div>
    </div>
  );
}
