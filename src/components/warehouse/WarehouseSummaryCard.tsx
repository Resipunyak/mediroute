import { Link } from "react-router-dom";
import { Warehouse as WarehouseIcon, ChevronRight } from "lucide-react";

export interface WarehouseSummaryCardData {
  id: string;
  name: string;
  slug: string;
  pharmacyCount: number;
  inventoryItemCount: number;
  criticalCount: number;
  lowCount: number;
  safeCount: number;
}

interface WarehouseSummaryCardProps {
  data: WarehouseSummaryCardData;
}

export function WarehouseSummaryCard({ data }: WarehouseSummaryCardProps) {
  return (
    <Link
      to={`/warehouses/${data.slug}`}
      className="block rounded-xl border border-ink-200 bg-white p-5 transition-colors hover:border-brand-300 hover:bg-brand-50/40"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
            <WarehouseIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">{data.name}</p>
            <p className="text-xs text-ink-500">
              {data.pharmacyCount} pharmacy · {data.inventoryItemCount} item
            </p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-ink-500" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md bg-critical-100 py-2">
          <p className="text-sm font-semibold text-critical-700">
            {data.criticalCount}
          </p>
          <p className="text-[10px] font-medium text-critical-700">Critical</p>
        </div>
        <div className="rounded-md bg-low-100 py-2">
          <p className="text-sm font-semibold text-low-700">{data.lowCount}</p>
          <p className="text-[10px] font-medium text-low-700">Low</p>
        </div>
        <div className="rounded-md bg-safe-100 py-2">
          <p className="text-sm font-semibold text-safe-700">
            {data.safeCount}
          </p>
          <p className="text-[10px] font-medium text-safe-700">Safe</p>
        </div>
      </div>
    </Link>
  );
}

export default WarehouseSummaryCard;
