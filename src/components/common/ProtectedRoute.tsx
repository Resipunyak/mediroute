import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { hasCapability, type Capability } from "../../utils/roleAccess";

interface ProtectedRouteProps {
  /**
   * Jika diisi, current user harus memiliki minimal satu capability ini
   * untuk boleh mengakses route. Jika tidak diisi, cukup harus sudah
   * login (dipakai untuk /dashboard yang bisa diakses semua role).
   */
  anyOfCapabilities?: Capability[];
}

/**
 * Route guard (Phase 3 bagian 4 & 5):
 * - Belum login -> redirect ke /login
 * - Sudah login tapi tidak punya capability yang dibutuhkan -> redirect
 *   ke /dashboard (tidak ada halaman Access Denied terpisah untuk
 *   prototype ini).
 * - Sudah login & punya akses -> render child route via <Outlet />.
 */
export function ProtectedRoute({ anyOfCapabilities }: ProtectedRouteProps) {
  const { isAuthenticated, currentUser } = useAuth();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isPermitted =
    !anyOfCapabilities ||
    anyOfCapabilities.some((capability) =>
      hasCapability(currentUser.role, capability)
    );

  if (!isPermitted) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
