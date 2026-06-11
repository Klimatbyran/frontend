import { type ReactNode } from "react";
import { Text } from "@/components/ui/text";
import { OverviewStat } from "@/components/companies/detail/overview/OverviewStat";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DataGuideItemId } from "@/data-guide/items";

export interface DetailStat {
  label: string | ReactNode;
  value: string | ReactNode;
  unit?: string;
  valueClassName?: string;
  info?: boolean;
  infoText?: string;
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-16 mt-8">
        {stats.map((stat, index) => (
          <OverviewStat
            key={index}
            variant="detail"
            label={stat.label}
            value={stat.value}
            unit={stat.unit}
            valueClassName={stat.valueClassName}
            info={stat.info}
            infoText={stat.infoText}
            useFlex1={false}
          />
        ))}
      </div>
      {supplementalData}
    </SectionWithHelp>
  );
}
