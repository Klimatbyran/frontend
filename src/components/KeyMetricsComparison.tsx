import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricValue {
  value: string;
  label: string;
}

interface ComparisonData {
  name: string;
  icon: React.ReactNode;
  category: string;
  metrics: {
    local: MetricValue;
    national: MetricValue;
    target: MetricValue;
  };
  source: string;
  year: number;
}

interface KeyMetricsComparisonProps {
  title?: string;
  data: ComparisonData[];
  onPrevious?: () => void;
  onNext?: () => void;
  className?: string;
}

export function KeyMetricsComparison({
  title = "Nyckeltal",
  data,
  onPrevious,
  onNext,
  className,
}: KeyMetricsComparisonProps) {
  return (
    <div className={cn("bg-black-2 rounded-level-2 p-8", className)}>
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-3xl font-light">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={onPrevious}
            className="p-2 rounded-full bg-black-1 hover:bg-black-1/80 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={onNext}
            className="p-2 rounded-full bg-black-1 hover:bg-black-1/80 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {data.map((item, index) => (
          <div key={index} className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-4xl font-light">{item.name}</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-2 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-grey uppercase text-sm tracking-wide">
                  {item.category}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <MetricCard
                value={item.metrics.local.value}
                label={item.metrics.local.label}
                className="bg-blue-5/30"
              />
              <MetricCard
                value={item.metrics.national.value}
                label={item.metrics.national.label}
                className="bg-blue-5/30"
              />
              <MetricCard
                value={item.metrics.target.value}
                label={item.metrics.target.label}
                className="bg-blue-5/30"
              />
            </div>

            <p className="text-grey text-sm">
              {item.source}, {item.year}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MetricCardProps {
  value: string;
  label: string;
  className?: string;
}

function MetricCard({ value, label, className }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-level-2 p-4 flex flex-col justify-between min-h-[120px]",
        className,
      )}
    >
      <span className="text-3xl font-light">{value}</span>
      <span className="text-xs text-grey uppercase">{label}</span>
    </div>
  );
}
