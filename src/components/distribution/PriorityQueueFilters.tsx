import { Search } from "lucide-react";
import type { PriorityLevel } from "../../types";

interface PriorityQueueFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedPriority: PriorityLevel | "all";
  onPriorityChange: (priority: PriorityLevel | "all") => void;
}

const PRIORITY_OPTIONS: (PriorityLevel | "all")[] = ["all", "High", "Medium", "Low"];

export function PriorityQueueFilters({
  searchValue,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
}: PriorityQueueFiltersProps) {
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
        value={selectedPriority}
        onChange={(e) =>
          onPriorityChange(e.target.value as PriorityLevel | "all")
        }
        aria-label="Filter berdasarkan priority"
        className="rounded-md border border-ink-300 px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-brand-600 focus:ring-1 focus:ring-brand-600"
      >
        {PRIORITY_OPTIONS.map((p) => (
          <option key={p} value={p}>
            {p === "all" ? "Semua Priority" : p}
          </option>
        ))}
      </select>
    </div>
  );
}

export default PriorityQueueFilters;
