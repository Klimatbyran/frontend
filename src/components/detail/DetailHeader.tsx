import { type ReactNode } from "react";
import { Text } from "@/components/ui/text";
import { OverviewStat } from "@/components/companies/detail/overview/OverviewStat";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DataGuideItemId } from "@/data-guide/items";
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
  /** Verdict or other story content shown before the stat row. */
  lead?: ReactNode;
}

function DetailStatItem({ stat, dense }: { stat: DetailStat; dense: boolean }) {
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
      dense={dense}
      useFlex1={false}
    />
  );
}

function statsGridClass(count: number) {
  if (count >= 4) {
    return "grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-10";
  }
  if (count === 3) {
    return "grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12";
  }
  if (count === 2) {
    return "grid-cols-1 gap-8 md:grid-cols-2 md:gap-12";
  }
  return "grid-cols-1 gap-8";
}

export function DetailHeader({
  name,
  logoUrl,
  helpItems,
  stats,
  supplementalData,
  headerChip,
  lead,
}: DetailHeaderProps) {
  const dense = stats.length >= 4;

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
      {lead}
      {stats.length > 0 && (
        <div className={cn("mt-8 grid", statsGridClass(stats.length))}>
          {stats.map((stat, index) => (
            <DetailStatItem key={index} stat={stat} dense={dense} />
          ))}
        </div>
      )}
      {supplementalData}
    </SectionWithHelp>
  );
}
