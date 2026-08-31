import { createBrowserRouter, Navigate } from "react-router-dom";

import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Distribution from "./pages/Distribution";
import Tracking from "./pages/Tracking";
import Warehouses from "./pages/Warehouses";
import WarehouseDetail from "./pages/WarehouseDetail";
import RestockRequest from "./pages/RestockRequest";
import Reports from "./pages/Reports";

// Struktur route (Phase 3):
// - "/" redirect ke "/login" (auth check dilakukan di dalam Login.tsx
//   sendiri: jika sudah login, Login.tsx redirect balik ke "/dashboard").
// - "/login" public, TIDAK memakai AppLayout.
// - Semua route aplikasi berada di dalam ProtectedRoute (auth-only guard)
//   yang membungkus AppLayout, lalu tiap route punya ProtectedRoute
//   kedua untuk capability check spesifik (role-based access) sesuai
//   src/utils/roleAccess.ts.
export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },

  {
    element: <ProtectedRoute />, // auth-only guard
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },

          {
            element: (
              <ProtectedRoute
                anyOfCapabilities={["viewNetworkInventory", "viewOwnInventory"]}
              />
            ),
            children: [{ path: "/inventory", element: <Inventory /> }],
          },
          {
            element: (
              <ProtectedRoute
                anyOfCapabilities={["approveDistribution", "viewOwnDeliveries"]}
              />
            ),
            children: [{ path: "/distribution", element: <Distribution /> }],
          },
          {
            element: (
              <ProtectedRoute
                anyOfCapabilities={["viewNetworkTracking", "viewOwnTracking"]}
              />
            ),
            children: [{ path: "/tracking", element: <Tracking /> }],
          },
          {
            element: <ProtectedRoute anyOfCapabilities={["viewWarehouses"]} />,
            children: [
              { path: "/warehouses", element: <Warehouses /> },
              { path: "/warehouses/:name", element: <WarehouseDetail /> },
            ],
          },
          {
            element: (
              <ProtectedRoute
                anyOfCapabilities={[
                  "reviewRestockRequests",
                  "createRestockRequest",
                ]}
              />
            ),
            children: [
              { path: "/restock-request", element: <RestockRequest /> },
            ],
          },
          {
            element: <ProtectedRoute anyOfCapabilities={["viewReports"]} />,
            children: [{ path: "/reports", element: <Reports /> }],
          },
        ],
      },
    ],
  },
]);
