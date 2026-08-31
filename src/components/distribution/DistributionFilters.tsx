import { Search } from "lucide-react";
import type { DistributionStatus } from "../../types";

interface DistributionFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedStatus: DistributionStatus | "all";
  onStatusChange: (status: DistributionStatus | "all") => void;
}

// "Delivered" sengaja tidak dimasukkan sebagai opsi filter — status ini
// tidak pernah persisten (lihat distributionLifecycle.ts), jadi filter
// tersebut tidak akan pernah menghasilkan data.
const STATUS_OPTIONS: (DistributionStatus | "all")[] = [
  "all",
  "Assigned",
  "In Transit",
  "Pharmacy Confirmation",
  "Distribution Completed",
];

export function DistributionFilters({
  searchValue,
  onSearchChange,
  selectedStatus,
  onStatusChange,
}: DistributionFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari pharmacy atau medicine..."
          aria-label="Cari pharmacy atau medicine"
          className="w-full rounded-md border border-ink-300 py-2 pl-9 pr-3 text-sm text-ink-900 outline-none transition-colors focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
        />
      </div>

      <select
        value={selectedStatus}
        onChange={(e) =>
          onStatusChange(e.target.value as DistributionStatus | "all")
        }
        aria-label="Filter berdasarkan status"
        className="rounded-md border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s === "all" ? "Semua Status" : s}
          </option>
        ))}
      </select>
    </div>
  );
}

export default DistributionFilters;
