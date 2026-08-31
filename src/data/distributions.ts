import type { Distribution } from "../types";

// Mock data distribution — DIPANGKAS (Phase 10, Issue 2) ke jumlah minimum
// yang tetap mencakup keempat status LOCKED yang bisa persisten (Assigned,
// In Transit, Pharmacy Confirmation, Distribution Completed), diarahkan ke
// pharmacy yang punya demo account (ph1/ph7/ph10) supaya setiap lifecycle
// action bisa langsung dites begitu login, tanpa perlu membuat data baru.
//
// Kombinasi pharmacy+medicine sengaja dibuat TIDAK bentrok dengan restock
// request aktif di restockRequests.ts, supaya exclusion rule Priority Queue
// tidak menyembunyikan skenario demo yang sengaja disiapkan di sana.
//
// Catatan lifecycle: sesuai rekonsiliasi final (Recovery Handoff bagian 8),
// aksi "Mark as Delivered" oleh Distributor langsung membawa status internal
// ke "Pharmacy Confirmation" — status "Delivered" tidak pernah persisten
// sebagai state tersendiri di mock data ini.
export const distributions: Distribution[] = [
  {
    // Siap untuk demo "Mark In Transit" oleh Distributor.
    id: "dst-1",
    warehouseId: "wh-jayapura",
    pharmacyId: "ph1",
    medicineId: "med-2",
    quantity: 70,
    distributorId: "user-distributor-1",
    status: "Assigned",
    assignedAt: "2026-08-19T03:00:00.000Z",
  },
  {
    // Siap untuk demo "Mark Delivered" oleh Distributor.
    id: "dst-2",
    warehouseId: "wh-merauke",
    pharmacyId: "ph10",
    medicineId: "med-1",
    quantity: 55,
    distributorId: "user-distributor-2",
    status: "In Transit",
    assignedAt: "2026-08-17T05:30:00.000Z",
  },
  {
    // Siap untuk demo "Confirm Receipt" oleh Pharmacy Admin (login ph7.admin).
    id: "dst-3",
    warehouseId: "wh-timika",
    pharmacyId: "ph7",
    medicineId: "med-2",
    quantity: 50,
    distributorId: "user-distributor-1",
    status: "Pharmacy Confirmation",
    assignedAt: "2026-08-15T02:15:00.000Z",
  },
  {
    // Historical completed distribution untuk Reports — berasal dari rr-4
    // (Approved) di restockRequests.ts.
    id: "dst-4",
    warehouseId: "wh-jayapura",
    pharmacyId: "ph2",
    medicineId: "med-4",
    quantity: 65,
    distributorId: "user-distributor-2",
    status: "Distribution Completed",
    restockRequestId: "rr-4",
    assignedAt: "2026-07-28T01:20:00.000Z",
  },
];
