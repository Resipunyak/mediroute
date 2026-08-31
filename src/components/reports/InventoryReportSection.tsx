import { AlertTriangle, AlertCircle, CheckCircle2, Package } from "lucide-react";
import { StatCard } from "../dashboard/StatCard";

export interface WarehouseBreakdownRow {
  id: string;
  name: string;
  pharmacyCount: number;
  criticalCount: number;
  lowCount: number;
  safeCount: number;
}

export interface PharmacyBreakdownRow {
  id: string;
  name: string;
  warehouseName: string;
  criticalCount: number;
  lowCount: number;
  safeCount: number;
}

interface InventoryReportSectionProps {
  totalItems: number;
  criticalCount: number;
  lowCount: number;
  safeCount: number;
  warehouseBreakdown: WarehouseBreakdownRow[];
  pharmacyBreakdown: PharmacyBreakdownRow[];
}

export function InventoryReportSection({
  totalItems,
  criticalCount,
  lowCount,
  safeCount,
  warehouseBreakdown,
  pharmacyBreakdown,
}: InventoryReportSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-ink-900">
          Inventory Report
        </h2>
        <p className="text-sm text-ink-500">
          Ringkasan kondisi stok di seluruh jaringan.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Items" value={totalItems} icon={Package} tone="neutral" />
        <StatCard label="Critical" value={criticalCount} icon={AlertTriangle} tone="critical" />
        <StatCard label="Low" value={lowCount} icon={AlertCircle} tone="low" />
        <StatCard label="Safe" value={safeCount} icon={CheckCircle2} tone="safe" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white">
          <div className="border-b border-ink-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-ink-900">By Warehouse</h3>
          </div>
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-xs font-medium uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3">Pharmacy</th>
                <th className="px-4 py-3">Critical</th>
                <th className="px-4 py-3">Low</th>
                <th className="px-4 py-3">Safe</th>
              </tr>
            </thead>
            <tbody>
              {warehouseBreakdown.map((w) => (
                <tr key={w.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink-900">{w.name}</td>
                  <td className="px-4 py-3 text-ink-700">{w.pharmacyCount}</td>
                  <td className="px-4 py-3 text-critical-700">{w.criticalCount}</td>
                  <td className="px-4 py-3 text-low-700">{w.lowCount}</td>
                  <td className="px-4 py-3 text-safe-700">{w.safeCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white">
          <div className="border-b border-ink-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-ink-900">By Pharmacy</h3>
          </div>
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50 text-xs font-medium uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">Pharmacy</th>
                <th className="px-4 py-3">Warehouse</th>
                <th className="px-4 py-3">Critical</th>
                <th className="px-4 py-3">Low</th>
                <th className="px-4 py-3">Safe</th>
              </tr>
            </thead>
            <tbody>
              {pharmacyBreakdown.map((p) => (
                <tr key={p.id} className="border-b border-ink-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink-900">{p.name}</td>
                  <td className="px-4 py-3 text-ink-700">{p.warehouseName}</td>
                  <td className="px-4 py-3 text-critical-700">{p.criticalCount}</td>
                  <td className="px-4 py-3 text-low-700">{p.lowCount}</td>
                  <td className="px-4 py-3 text-safe-700">{p.safeCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default InventoryReportSection;
