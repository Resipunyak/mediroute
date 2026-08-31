import { AlertTriangle, AlertCircle, CheckCircle2, type LucideIcon } from "lucide-react";
import type { StockStatus } from "../../types";

interface StockStatusBadgeProps {
  status: StockStatus;
  /** Jika diisi, persentase ditampilkan di samping label status. */
  percentage?: number;
}

const STYLES: Record<
  StockStatus,
  { bg: string; text: string; icon: LucideIcon }
> = {
  Critical: { bg: "bg-critical-100", text: "text-critical-700", icon: AlertTriangle },
  Low: { bg: "bg-low-100", text: "text-low-700", icon: AlertCircle },
  Safe: { bg: "bg-safe-100", text: "text-safe-700", icon: CheckCircle2 },
};

export function StockStatusBadge({ status, percentage }: StockStatusBadgeProps) {
  const { bg, text, icon: Icon } = STYLES[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${bg} ${text}`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
      {status}
      {percentage !== undefined && (
        <span className="opacity-80">({Math.round(percentage)}%)</span>
      )}
    </span>
  );
}

export default StockStatusBadge;
