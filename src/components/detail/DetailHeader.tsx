import { type ReactNode } from "react";
import { Text } from "@/components/ui/text";
import { OverviewStat } from "@/components/companies/detail/overview/OverviewStat";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DataGuideItemId } from "@/data-guide/items";
import {
  detailStatItemClassName,
  detailStatsRowClassName,
} from "@/components/detail/detailStatsLayout";
import { cn } from "@/lib/utils";

export interface DetailStat {
  label: string | ReactNode;
  value: string | ReactNode;
  unit?: string;
  valueClassName?: string;
  info?: boolean;
  infoText?: string;
  caption?: string;
}

export interface DetailHeaderProps {
  name: string;
  logoUrl?: string | null;
  helpItems: DataGuideItemId[];
  stats: DetailStat[];
  supplementalData?: ReactNode;
  /** Compare chip or other actions shown below the title (keeps logo unobstructed). */
  headerChip?: ReactNode;
}

function DetailStatItem({ stat }: { stat: DetailStat }) {
  return (
    <OverviewStat
      variant="detail"
      label={stat.label}
      value={stat.value}
      unit={stat.unit}
      valueClassName={stat.valueClassName}
      info={stat.info}
      infoText={stat.infoText}
      caption={stat.caption}
      useFlex1={false}
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
  return (
    <SectionWithHelp helpItems={helpItems}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <Text className="text-4xl md:text-8xl">{name}</Text>
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
        <div className={cn("mt-8", detailStatsRowClassName)}>
          {stats.map((stat, index) => (
            <div key={index} className={detailStatItemClassName}>
              <DetailStatItem stat={stat} />
            </div>
          ))}
        </div>
      )}
      {supplementalData}
    </SectionWithHelp>
  );
}
