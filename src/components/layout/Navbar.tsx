import { useLocation, useNavigate } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ROLE_LABELS } from "../../utils/roleAccess";

// Judul halaman aktif berdasarkan path. Mapping sederhana khusus untuk
// display Navbar — tidak memengaruhi routing/permission.
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/inventory": "Inventory",
  "/distribution": "Distribution",
  "/tracking": "Tracking",
  "/warehouses": "Warehouses",
  "/restock-request": "Restock Request",
  "/reports": "Reports",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/warehouses/")) return "Warehouse Detail";
  return "MediRoute";
}

interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

export function Navbar({ onOpenMobileMenu }: NavbarProps) {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!currentUser) return null;

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-ink-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Buka menu"
          className="rounded-md p-1.5 text-ink-700 hover:bg-ink-50 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-base font-semibold text-ink-900">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-ink-900">
            {currentUser.fullName}
          </p>
          <p className="text-xs text-ink-500">
            {ROLE_LABELS[currentUser.role]}
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-md border border-ink-200 px-2.5 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 sm:px-3"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
