import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Truck,
  MapPinned,
  Warehouse as WarehouseIcon,
  ClipboardList,
  BarChart3,
  LogOut,
  Route as RouteIcon,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { hasCapability, ROLE_LABELS, type Capability } from "../../utils/roleAccess";

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  /** Tidak diisi = boleh diakses semua role yang sudah login (Dashboard). */
  anyOf?: Capability[];
}

interface SidebarProps {
  /** Status terbuka di viewport mobile/tablet (di desktop selalu tampil). */
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

// Single source of truth navigasi sidebar. Dipakai juga oleh router.tsx
// (lewat capability yang sama di roleAccess.ts) supaya menu dan proteksi
// route selalu konsisten.
const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  {
    label: "Inventory",
    path: "/inventory",
    icon: Package,
    anyOf: ["viewNetworkInventory", "viewOwnInventory"],
  },
  {
    label: "Distribution",
    path: "/distribution",
    icon: Truck,
    anyOf: ["approveDistribution", "viewOwnDeliveries"],
  },
  {
    label: "Tracking",
    path: "/tracking",
    icon: MapPinned,
    anyOf: ["viewNetworkTracking", "viewOwnTracking"],
  },
  {
    label: "Warehouses",
    path: "/warehouses",
    icon: WarehouseIcon,
    anyOf: ["viewWarehouses"],
  },
  {
    label: "Restock Request",
    path: "/restock-request",
    icon: ClipboardList,
    anyOf: ["reviewRestockRequests", "createRestockRequest"],
  },
  {
    label: "Reports",
    path: "/reports",
    icon: BarChart3,
    anyOf: ["viewReports"],
  },
];

export function Sidebar({ isMobileOpen = false, onCloseMobile }: SidebarProps) {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const visibleItems = NAV_ITEMS.filter(
    (item) =>
      !item.anyOf ||
      item.anyOf.some((capability) =>
        hasCapability(currentUser.role, capability)
      )
  );

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <>
      {/* Backdrop khusus mobile/tablet — klik untuk menutup sidebar */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink-900/50 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 transform flex-col bg-brand-900 text-brand-50 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-6 py-5">
          <div className="flex items-center gap-2">
            <RouteIcon className="h-6 w-6 text-accent-500" />
            <span className="text-lg font-semibold tracking-tight text-white">
              MediRoute
            </span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Tutup menu"
            className="rounded-md p-1 text-brand-100 hover:bg-brand-800 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent-600 text-white"
                    : "text-brand-100 hover:bg-brand-800 hover:text-white"
                }`
              }
            >
              <item.icon className="h-4 w-4" strokeWidth={2} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <p className="truncate text-sm font-medium text-white">
            {currentUser.fullName}
          </p>
          <p className="truncate text-xs text-brand-100">
            {ROLE_LABELS[currentUser.role]}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-brand-100 transition-colors hover:bg-brand-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
