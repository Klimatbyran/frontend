import { type ReactNode } from "react";
import { Text } from "@/components/ui/text";
import { OverviewStat } from "@/components/companies/detail/overview/OverviewStat";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DataGuideItemId } from "@/data-guide/items";
import { detailEntityNameClassName } from "@/components/detail/detailEntityTitle";
import {
  detailStatItemClassName,
  detailStatsRowClassName,
} from "@/components/detail/detailStatsLayout";
import { cn } from "@/lib/utils";
import type { KpiBenchmarkView } from "@/utils/detail/kpiBenchmark";

export interface DetailStat {
  label: string | ReactNode;
  value: string | ReactNode;
  unit?: string;
  valueClassName?: string;
  info?: boolean;
  infoText?: string;
  caption?: string;
  benchmark?: KpiBenchmarkView | null;
}

export interface DetailHeaderProps {
  name: string;
  logoUrl?: string | null;
  helpItems: DataGuideItemId[];
  stats: DetailStat[];
  supplementalData?: ReactNode;
  headerChip?: ReactNode;
}

function DetailStatItem({
  stat,
  dense,
  alignBenchmarks,
}: {
  stat: DetailStat;
  dense: boolean;
  alignBenchmarks: boolean;
}) {
  return (
    <OverviewStat
      variant="detail"
      label={stat.label}
      value={stat.value}
      unit={stat.unit}
      valueClassName={stat.valueClassName}
      info={stat.info}
      infoText={stat.infoText}
      caption={stat.benchmark ? undefined : stat.caption}
      dense={dense}
      useFlex1={false}
      benchmark={stat.benchmark}
      alignBenchmarks={alignBenchmarks}
    />
  );
}

export function DetailHeader({
  name,
  logoUrl,
  helpItems,
  stats,
  supplementalData,
  headerChip,
}: DetailHeaderProps) {
  const dense = stats.length >= 4;
  const alignBenchmarks = stats.some((stat) => stat.benchmark);

  return (
    <SectionWithHelp helpItems={helpItems}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <Text className={detailEntityNameClassName}>{name}</Text>
          {headerChip && <div className="w-fit shrink-0">{headerChip}</div>}
        </div>
        {logoUrl && (
          <img
            src={logoUrl}
            alt="logo"
            className="h-[50px] shrink-0 md:h-[80px]"
          />
        )}
      </div>
      {stats.length > 0 && (
        <div
          className={cn(
            "mt-8",
            detailStatsRowClassName,
            alignBenchmarks && "items-stretch",
          )}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                detailStatItemClassName,
                alignBenchmarks && "flex flex-col",
              )}
            >
              <DetailStatItem
                stat={stat}
                dense={dense}
                alignBenchmarks={alignBenchmarks}
              />
            </div>
          ))}
        </div>
      )}
      {supplementalData}
    </SectionWithHelp>
  );
}
