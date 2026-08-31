import { AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";

interface InventorySummaryCardsProps {
  criticalCount: number;
  lowCount: number;
  safeCount: number;
}

export function InventorySummaryCards({
  criticalCount,
  lowCount,
  safeCount,
}: InventorySummaryCardsProps) {
  const cards = [
    {
      label: "Critical",
      count: criticalCount,
      icon: AlertTriangle,
      bg: "bg-critical-100",
      text: "text-critical-700",
    },
    {
      label: "Low",
      count: lowCount,
      icon: AlertCircle,
      bg: "bg-low-100",
      text: "text-low-700",
    },
    {
      label: "Safe",
      count: safeCount,
      icon: CheckCircle2,
      bg: "bg-safe-100",
      text: "text-safe-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-4 rounded-xl border border-ink-200 bg-white p-4"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.bg} ${card.text}`}
          >
            <card.icon className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-ink-900">
              {card.count}
            </p>
            <p className="text-xs font-medium text-ink-500">
              {card.label} stock
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default InventorySummaryCards;
