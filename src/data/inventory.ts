import type { InventoryItem } from "../types";
import { pharmacies } from "./pharmacies";
import { medicines } from "./medicines";

// Setiap pharmacy memiliki 6 medicine -> 12 x 6 = 72 inventory rows (LOCKED).
//
// Persentase stok dibuat DETERMINISTIK (bukan random/AI) menggunakan pola
// tetap yang digeser per pharmacy, supaya data selalu sama setiap kali
// aplikasi dimuat dan sengaja mencakup ketiga status stok (Critical/Low/Safe).
const STOCK_PERCENTAGE_PATTERN = [18, 35, 62, 45, 12, 78];
const MAX_CAPACITY = 200;

export const inventory: InventoryItem[] = pharmacies.flatMap(
  (pharmacy, pharmacyIndex) =>
    medicines.map((medicine, medicineIndex) => {
      const percentage =
        STOCK_PERCENTAGE_PATTERN[
          (medicineIndex + pharmacyIndex) % STOCK_PERCENTAGE_PATTERN.length
        ];
      const currentStock = Math.round((percentage / 100) * MAX_CAPACITY);

      return {
        id: `inv-${pharmacy.id}-${medicine.id}`,
        pharmacyId: pharmacy.id,
        medicineId: medicine.id,
        currentStock,
        maxCapacity: MAX_CAPACITY,
      };
    })
);
