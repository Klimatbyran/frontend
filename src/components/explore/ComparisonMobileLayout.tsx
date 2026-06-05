import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  useComparisonSections,
  type ComparisonMetric,
} from "@/hooks/explore/useComparisonMetrics";
import type { ListCardProps } from "./ListCard";
import { ComparisonCell } from "./ComparisonCell";
import { ComparisonEntityHeader } from "./ComparisonEntityHeader";

interface ComparisonMobileLayoutProps {
  items: ListCardProps[];
}

function getValueGridClass(count: number): string {
  if (count === 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  return "grid-cols-2";
}

function MobileMetricRow({
  metric,
  items,
}: {
  metric: ComparisonMetric;
  items: ListCardProps[];
}) {
  const { t } = useTranslation();

  return (
    <div className="px-4 py-3 border-b border-black-1 last:border-b-0">
      <p className="text-grey text-sm mb-3">{metric.label}</p>
      <div className={cn("grid gap-2", getValueGridClass(items.length))}>
        {items.map((item) => (
          <div
            key={`${metric.id}-${item.linkTo}`}
            className="bg-black-1/30 rounded-lg p-3 min-w-0"
          >
            <p className="text-xs text-grey truncate mb-2">{item.name}</p>
            <ComparisonCell
              value={metric.getValue(item, t)}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ComparisonMobileLayout({ items }: ComparisonMobileLayoutProps) {
  const sections = useComparisonSections(items);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {items.map((item) => (
          <ComparisonEntityHeader
            key={item.linkTo}
            item={item}
            compact
          />
        ))}
      </div>

      {sections.map((section) => (
        <div
          key={section.id}
          className="bg-black-2 rounded-level-2 overflow-hidden"
        >
          <div className="px-4 py-3 bg-black border-b border-black-1 text-grey text-sm uppercase tracking-wide">
            {section.label}
          </div>
          {section.metrics.map((metric) => (
            <MobileMetricRow
              key={metric.id}
              metric={metric}
              items={items}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
