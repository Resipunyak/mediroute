import { Link } from "react-router-dom";
import { Warehouse as WarehouseIcon, ChevronRight } from "lucide-react";

export interface WarehouseOverviewRow {
  id: string;
  name: string;
  slug: string;
  pharmacyCount: number;
  criticalCount: number;
}

interface WarehouseOverviewSectionProps {
  warehouses: WarehouseOverviewRow[];
}

export function WarehouseOverviewSection({
  warehouses,
}: WarehouseOverviewSectionProps) {
  return (
    <div className="rounded-xl border border-ink-200 bg-white">
      <div className="border-b border-ink-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-ink-900">
          Warehouse Overview
        </h2>
        <p className="mt-0.5 text-xs text-ink-500">
          Kondisi seluruh warehouse dalam jaringan
        </p>
      </div>

      <ul className="divide-y divide-ink-100">
        {warehouses.map((w) => (
          <li key={w.id}>
            <Link
              to={`/warehouses/${w.slug}`}
              className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-ink-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                  <WarehouseIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-900">{w.name}</p>
                  <p className="text-xs text-ink-500">
                    {w.pharmacyCount} pharmacy
                    {w.criticalCount > 0 && (
                      <span className="text-critical-700">
                        {" "}
                        · {w.criticalCount} critical stock
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-500" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default WarehouseOverviewSection;
