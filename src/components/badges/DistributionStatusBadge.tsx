import {
  ClipboardList,
  Truck,
  PackageCheck,
  Hourglass,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import type { DistributionStatus } from "../../types";

interface DistributionStatusBadgeProps {
  status: DistributionStatus;
}

const STYLES: Record<
  DistributionStatus,
  { bg: string; text: string; icon: LucideIcon }
> = {
  Assigned: { bg: "bg-ink-100", text: "text-ink-700", icon: ClipboardList },
  "In Transit": { bg: "bg-accent-100", text: "text-accent-700", icon: Truck },
  // "Delivered" tidak pernah persisten sebagai status tersendiri (lihat
  // src/utils/distributionLifecycle.ts) — style disediakan untuk
  // kelengkapan type saja.
  Delivered: { bg: "bg-low-100", text: "text-low-700", icon: PackageCheck },
  "Pharmacy Confirmation": {
    bg: "bg-low-100",
    text: "text-low-700",
    icon: Hourglass,
  },
  "Distribution Completed": {
    bg: "bg-safe-100",
    text: "text-safe-700",
    icon: CheckCircle2,
  },
};

export function DistributionStatusBadge({
  status,
}: DistributionStatusBadgeProps) {
  const { bg, text, icon: Icon } = STYLES[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${bg} ${text}`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
      {status}
    </span>
  );
}

export default DistributionStatusBadge;
