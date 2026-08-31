import type { RestockRequest } from "../types";

// Mock data restock request — DIPANGKAS (Phase 10, Issue 2) ke jumlah
// minimum yang tetap mencakup setiap status LOCKED (Pending/In Queue/
// Approved) dan skenario priority kunci, supaya initial state bersih
// tapi tetap bisa langsung didemokan tanpa membuat data baru.
//
// Current Stock TIDAK disimpan di sini (sesuai spec: "otomatis berasal
// dari inventory, tidak dapat diedit manual") — nilai current stock
// selalu dibaca langsung dari inventory saat dibutuhkan.
export const restockRequests: RestockRequest[] = [
  {
    id: "rr-1",
    pharmacyId: "ph1",
    warehouseId: "wh-jayapura",
    medicineId: "med-1",
    requestedQuantity: 60,
    reason: "Stok kritis, perlu segera diisi ulang",
    status: "Pending",
    createdAt: "2026-08-18T02:10:00.000Z",
  },
  {
    id: "rr-2",
    pharmacyId: "ph7",
    warehouseId: "wh-timika",
    medicineId: "med-5",
    requestedQuantity: 45,
    reason: "Stok kritis, dibutuhkan segera",
    status: "In Queue",
    createdAt: "2026-08-17T09:20:00.000Z",
  },
  {
    // Skenario kunci: Safe stock + manual restock request -> Low priority
    // di Priority Distribution Queue (LOCKED rule, Recovery Handoff bagian 6).
    id: "rr-3",
    pharmacyId: "ph10",
    warehouseId: "wh-merauke",
    medicineId: "med-6",
    requestedQuantity: 30,
    reason: "Antisipasi lonjakan permintaan bulan depan",
    status: "Pending",
    createdAt: "2026-08-19T04:05:00.000Z",
  },
  {
    id: "rr-4",
    pharmacyId: "ph2",
    warehouseId: "wh-jayapura",
    medicineId: "med-4",
    requestedQuantity: 65,
    reason: "Persiapan stok sebelum permintaan meningkat",
    status: "Approved",
    createdAt: "2026-07-27T01:00:00.000Z",
  },
];
