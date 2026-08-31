import { ClipboardList, Truck, Hourglass, CheckCircle2 } from "lucide-react";

interface TrackingSummaryCardsProps {
  activeCount: number;
  inTransitCount: number;
  awaitingConfirmationCount: number;
  completedCount: number;
}

export function TrackingSummaryCards({
  activeCount,
  inTransitCount,
  awaitingConfirmationCount,
  completedCount,
}: TrackingSummaryCardsProps) {
  const cards = [
    {
      label: "Active Deliveries",
      count: activeCount,
      icon: ClipboardList,
      bg: "bg-brand-100",
      text: "text-brand-700",
    },
    {
      label: "In Transit",
      count: inTransitCount,
      icon: Truck,
      bg: "bg-accent-100",
      text: "text-accent-700",
    },
    {
      label: "Awaiting Confirmation",
      count: awaitingConfirmationCount,
      icon: Hourglass,
      bg: "bg-low-100",
      text: "text-low-700",
    },
    {
      label: "Completed",
      count: completedCount,
      icon: CheckCircle2,
      bg: "bg-safe-100",
      text: "text-safe-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-4"
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
            <p className="text-xs font-medium text-ink-500">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TrackingSummaryCards;
