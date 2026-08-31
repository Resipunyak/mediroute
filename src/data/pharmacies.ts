import type { Pharmacy } from "../types";

// LOCKED mapping (Phase 2, decision 2):
// Jayapura: ph1, ph2, ph3
// Wamena:   ph4, ph5, ph6
// Timika:   ph7, ph8, ph9
// Merauke:  ph10, ph11, ph12
export const pharmacies: Pharmacy[] = [
  { id: "ph1", name: "Pharmacy Jayapura Kota", warehouseId: "wh-jayapura" },
  { id: "ph2", name: "Pharmacy Jayapura Selatan", warehouseId: "wh-jayapura" },
  { id: "ph3", name: "Pharmacy Jayapura Abepura", warehouseId: "wh-jayapura" },

  { id: "ph4", name: "Pharmacy Wamena Kota", warehouseId: "wh-wamena" },
  { id: "ph5", name: "Pharmacy Wamena Utara", warehouseId: "wh-wamena" },
  { id: "ph6", name: "Pharmacy Wamena Selatan", warehouseId: "wh-wamena" },

  { id: "ph7", name: "Pharmacy Timika Kota", warehouseId: "wh-timika" },
  { id: "ph8", name: "Pharmacy Timika Utara", warehouseId: "wh-timika" },
  { id: "ph9", name: "Pharmacy Timika Selatan", warehouseId: "wh-timika" },

  { id: "ph10", name: "Pharmacy Merauke Kota", warehouseId: "wh-merauke" },
  { id: "ph11", name: "Pharmacy Merauke Utara", warehouseId: "wh-merauke" },
  { id: "ph12", name: "Pharmacy Merauke Selatan", warehouseId: "wh-merauke" },
];
