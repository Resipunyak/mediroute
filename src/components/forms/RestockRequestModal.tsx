import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "../common/Modal";
import { RestockRequestForm } from "./RestockRequestForm";
import { useAuth } from "../../context/AuthContext";
import { useAppData } from "../../context/AppDataContext";

interface RestockRequestModalProps {
  open: boolean;
  onClose: () => void;
  prefilledMedicineId?: string;
}

export function RestockRequestModal({
  open,
  onClose,
  prefilledMedicineId,
}: RestockRequestModalProps) {
  const { currentUser } = useAuth();
  const { pharmacies } = useAppData();
  const [justSubmitted, setJustSubmitted] = useState(false);

  function handleClose() {
    setJustSubmitted(false);
    onClose();
  }

  if (!currentUser?.pharmacyId) return null;

  const pharmacy = pharmacies.find((p) => p.id === currentUser.pharmacyId);
  if (!pharmacy) return null;

  return (
    <Modal open={open} onClose={handleClose} title="Restock Request">
      {justSubmitted ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle2 className="h-10 w-10 text-safe-600" />
          <p className="text-sm font-medium text-ink-900">
            Restock Request berhasil dibuat.
          </p>
          <p className="text-sm text-ink-500">
            Request Anda akan direview oleh Central Supply Administrator.
          </p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-2 rounded-md bg-brand-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800"
          >
            Tutup
          </button>
        </div>
      ) : (
        <RestockRequestForm
          pharmacyId={pharmacy.id}
          warehouseId={pharmacy.warehouseId}
          prefilledMedicineId={prefilledMedicineId}
          onSuccess={() => setJustSubmitted(true)}
          onCancel={handleClose}
        />
      )}
    </Modal>
  );
}

export default RestockRequestModal;
