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

function useListMetricLayout(count: number): boolean {
  return count >= 3;
}

function MobileMetricRow({
  metric,
  items,
}: {
  metric: ComparisonMetric;
  items: ListCardProps[];
}) {
  const { t } = useTranslation();
  const listLayout = useListMetricLayout(items.length);

  if (listLayout) {
    return (
      <div className="px-4 py-3 border-b border-black-1 last:border-b-0">
        <p className="text-grey text-sm mb-3">{metric.label}</p>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={`${metric.id}-${item.linkTo}`}
              className="flex items-start justify-between gap-3 bg-black-1/30 rounded-lg p-3"
            >
              <p className="text-sm font-light w-[38%] shrink-0 break-words leading-snug">
                {item.name}
              </p>
              <div className="flex-1 min-w-0">
                <ComparisonCell
                  value={metric.getValue(item, t)}
                  compact
                  align="end"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-b border-black-1 last:border-b-0">
      <p className="text-grey text-sm mb-3">{metric.label}</p>
      <div
        className={cn(
          "grid gap-2",
          items.length === 1 ? "grid-cols-1" : "grid-cols-2",
        )}
      >
        {items.map((item) => (
          <div
            key={`${metric.id}-${item.linkTo}`}
            className="bg-black-1/30 rounded-lg p-3 min-w-0"
          >
            <p className="text-xs text-grey mb-2 break-words leading-snug">
              {item.name}
            </p>
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

function getEntityHeaderLayout(count: number): string {
  if (count >= 4) return "grid grid-cols-2 gap-2";
  return "space-y-2";
}

export function ComparisonMobileLayout({ items }: ComparisonMobileLayoutProps) {
  const { t } = useTranslation();
  const sections = useComparisonSections(items);
  const useDenseHeaders = items.length >= 4;

  return (
    <div className="space-y-4">
      <div className={getEntityHeaderLayout(items.length)}>
        {items.map((item) => (
          <ComparisonEntityHeader
            key={item.linkTo}
            item={item}
            compact={!useDenseHeaders}
            dense={useDenseHeaders}
          />
        ))}
      </div>

      {items.length >= 3 && (
        <p className="text-grey text-xs px-1">
          {t("explorePage.comparison.mobileScrollHint")}
        </p>
      )}

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
