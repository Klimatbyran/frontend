import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useScreenSize } from "@/hooks/useScreenSize";
import {
  useComparisonSections,
  type ComparisonMetric,
} from "@/hooks/compare/useComparisonMetrics";
import type { ListCardProps } from "./ListCard";
import { ComparisonCell } from "./ComparisonCell";
import { ComparisonEntityHeader } from "./ComparisonEntityHeader";
import { ComparisonMobileLayout } from "./ComparisonMobileLayout";

interface ComparisonTableProps {
  items: ListCardProps[];
}

export function ComparisonTable({ items }: ComparisonTableProps) {
  const { isMobile } = useScreenSize();

  if (isMobile) {
    return <ComparisonMobileLayout items={items} />;
  }

  return <ComparisonDesktopTable items={items} />;
}

function ComparisonDesktopTable({ items }: ComparisonTableProps) {
  const { t } = useTranslation();
  const sections = useComparisonSections(items);
  const columnWidth =
    items.length <= 2 ? "minmax(180px, 1fr)" : "minmax(160px, 1fr)";

  const gridTemplateColumns = `minmax(140px, 200px) repeat(${items.length}, ${columnWidth})`;

  return (
    <div className="bg-black-2 rounded-level-2 overflow-hidden">
      <div className="overflow-x-auto">
        <div
          className="min-w-full"
          style={{ display: "grid", gridTemplateColumns }}
        >
          <div className="sticky left-0 z-20 bg-black-2 border-b border-black-1 py-4 px-4 text-grey text-sm uppercase tracking-wide shadow-[4px_0_8px_rgba(0,0,0,0.4)]">
            {t("explorePage.comparison.metric")}
          </div>
          {items.map((item) => (
            <div
              key={item.linkTo}
              className="border-b border-l border-black-1 bg-black-1/40"
            >
              <ComparisonEntityHeader item={item} />
            </div>
          ))}

          {sections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              items={items}
              t={t}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionBlock({
  section,
  items,
  t,
}: {
  section: ReturnType<typeof useComparisonSections>[number];
  items: ListCardProps[];
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
    <>
      <div
        className="sticky left-0 z-10 col-span-full px-4 py-3 bg-black border-y border-black-1 text-grey text-sm uppercase tracking-wide"
        style={{
          gridColumn: `1 / span ${items.length + 1}`,
        }}
      >
        {section.label}
      </div>

      {section.metrics.map((metric, rowIndex) => (
        <MetricRow
          key={metric.id}
          metric={metric}
          items={items}
          t={t}
          isAlternate={rowIndex % 2 === 1}
        />
      ))}
    </>
  );
}

function MetricRow({
  metric,
  items,
  t,
  isAlternate,
}: {
  metric: ComparisonMetric;
  items: ListCardProps[];
  t: ReturnType<typeof useTranslation>["t"];
  isAlternate: boolean;
}) {
  const rowBg = isAlternate ? "bg-black-1/20" : "bg-transparent";

  return (
    <>
      <div
        className={cn(
          "sticky left-0 z-10 border-b border-black-1 py-3 px-4 text-grey text-sm md:text-base shadow-[4px_0_8px_rgba(0,0,0,0.4)]",
          rowBg,
          "bg-black-2",
        )}
      >
        {metric.label}
      </div>
      {items.map((item) => (
        <div
          key={`${metric.id}-${item.linkTo}`}
          className={cn("border-b border-l border-black-1", rowBg)}
        >
          <ComparisonCell value={metric.getValue(item, t)} />
        </div>
      ))}
    </>
  );
}
