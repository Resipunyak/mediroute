import type { User } from "../types";

export const users: User[] = [
  {
    id: "user-central-1",
    fullName: "Rina Setiawan",
    email: "admin@mediroute.id",
    password: "admin123",
    role: "central_supply_administrator",
  },
  {
    id: "user-distributor-1",
    fullName: "Budi Santoso",
    email: "budi.distributor@mediroute.id",
    password: "dist123",
    role: "distributor",
  },
  {
    id: "user-distributor-2",
    fullName: "Sari Wijaya",
    email: "sari.distributor 1 @mediroute.id",
    password: "dist123",
    role: "distributor",
  },
  {
    id: "user-pharmacy-1",
    fullName: "Admin Pharmacy Jayapura Kota",
    email: "ph1.admin@mediroute.id",
    password: "pharm123",
    role: "pharmacy_administrator",
    pharmacyId: "ph1",
  },
  {
    id: "user-pharmacy-7",
    fullName: "Admin Pharmacy Timika Kota",
    email: "ph7.admin@mediroute.id",
    password: "pharm123",
    role: "pharmacy_administrator",
    pharmacyId: "ph7",
  },
  {
    id: "user-pharmacy-10",
    fullName: "Admin Pharmacy Merauke Kota",
    email: "ph10.admin@mediroute.id",
    password: "pharm123",
    role: "pharmacy_administrator",
    pharmacyId: "ph10",
  },
];
