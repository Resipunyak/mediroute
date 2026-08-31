import { AlertTriangle, AlertCircle, ArrowDownCircle, type LucideIcon } from "lucide-react";
import type { PriorityLevel } from "../../types";

interface PriorityBadgeProps {
  level: PriorityLevel;
}

const STYLES: Record<
  PriorityLevel,
  { bg: string; text: string; icon: LucideIcon }
> = {
  High: { bg: "bg-critical-100", text: "text-critical-700", icon: AlertTriangle },
  Medium: { bg: "bg-low-100", text: "text-low-700", icon: AlertCircle },
  Low: { bg: "bg-safe-100", text: "text-safe-700", icon: ArrowDownCircle },
};

export function PriorityBadge({ level }: PriorityBadgeProps) {
  const { bg, text, icon: Icon } = STYLES[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${bg} ${text}`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
      {level}
    </span>
  );
}

export default PriorityBadge;
