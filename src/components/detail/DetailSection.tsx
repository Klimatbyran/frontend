import { ReactNode } from "react";
import { Text } from "@/components/ui/text";
import { DataGuideItemId } from "@/data-guide/items";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { OverviewStat } from "@/components/companies/detail/overview/OverviewStat";
import type { KpiBenchmarkView } from "@/utils/detail/kpiBenchmark";
import { cn } from "@/lib/utils";

interface DetailSectionProps {
  title: string;
  items: Array<{
    title: string;
    value: ReactNode;
    valueClassName?: string;
    benchmark?: KpiBenchmarkView | null;
  }>;
  helpItems: DataGuideItemId[];
}

export function DetailSection({ title, items, helpItems }: DetailSectionProps) {
  const alignBenchmarks = items.some((item) => item.benchmark);

  return (
    <SectionWithHelp helpItems={helpItems}>
      <div className="gap-8 md:gap-16">
        <Text variant={"h3"}>{title}</Text>
      </div>
      <div
        className={cn(
          "mt-8 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-16",
          alignBenchmarks && "items-stretch",
        )}
      >
        {items.map((item, index) => (
          <OverviewStat
            key={index}
            variant="detail"
            label={item.title}
            value={item.value}
            valueClassName={item.valueClassName}
            benchmark={item.benchmark}
            useFlex1={false}
            alignBenchmarks={alignBenchmarks}
          />
        ))}
      </div>
    </SectionWithHelp>
  );
}
