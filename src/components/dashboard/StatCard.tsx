import type { LucideIcon } from "lucide-react";

type StatCardTone = "neutral" | "critical" | "low" | "safe" | "accent" | "brand";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: StatCardTone;
}

const TONE_STYLES: Record<StatCardTone, { bg: string; text: string }> = {
  neutral: { bg: "bg-ink-100", text: "text-ink-700" },
  critical: { bg: "bg-critical-100", text: "text-critical-700" },
  low: { bg: "bg-low-100", text: "text-low-700" },
  safe: { bg: "bg-safe-100", text: "text-safe-700" },
  accent: { bg: "bg-accent-100", text: "text-accent-700" },
  brand: { bg: "bg-brand-100", text: "text-brand-700" },
};

export function StatCard({ label, value, icon: Icon, tone = "neutral" }: StatCardProps) {
  const { bg, text } = TONE_STYLES[tone];

  return (
    <div className="flex items-center gap-4 rounded-xl border border-ink-200 bg-white p-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg} ${text}`}
      >
        <Icon className="h-5 w-5" strokeWidth={2.25} />
      </div>
      <div>
        <p className="text-2xl font-semibold text-ink-900">{value}</p>
        <p className="text-xs font-medium text-ink-500">{label}</p>
      </div>
    </div>
  );
}

export default StatCard;
