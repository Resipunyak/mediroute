import { Link } from "react-router-dom";
import {
  Package,
  Truck,
  MapPinned,
  Warehouse as WarehouseIcon,
  ClipboardList,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { hasCapability, type Capability } from "../../utils/roleAccess";
import type { Role } from "../../types";

interface QuickNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  anyOf: Capability[];
}

const ITEMS: QuickNavItem[] = [
  { label: "Inventory", path: "/inventory", icon: Package, anyOf: ["viewNetworkInventory"] },
  { label: "Distribution", path: "/distribution", icon: Truck, anyOf: ["approveDistribution"] },
  { label: "Tracking", path: "/tracking", icon: MapPinned, anyOf: ["viewNetworkTracking"] },
  { label: "Warehouses", path: "/warehouses", icon: WarehouseIcon, anyOf: ["viewWarehouses"] },
  { label: "Restock Request", path: "/restock-request", icon: ClipboardList, anyOf: ["reviewRestockRequests"] },
  { label: "Reports", path: "/reports", icon: BarChart3, anyOf: ["viewReports"] },
];

interface QuickNavGridProps {
  role: Role;
}

export function QuickNavGrid({ role }: QuickNavGridProps) {
  const visibleItems = ITEMS.filter((item) =>
    item.anyOf.some((capability) => hasCapability(role, capability))
  );

  if (visibleItems.length === 0) return null;

  return (
    <div className="rounded-xl border border-ink-200 bg-white p-5">
      <h2 className="mb-3 text-sm font-semibold text-ink-900">
        Quick Navigation
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {visibleItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-2 rounded-lg border border-ink-200 px-3 py-4 text-center transition-colors hover:border-brand-600 hover:bg-brand-50"
          >
            <item.icon className="h-5 w-5 text-brand-700" strokeWidth={2} />
            <span className="text-xs font-medium text-ink-700">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default QuickNavGrid;
