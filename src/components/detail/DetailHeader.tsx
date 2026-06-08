import { ReactNode } from "react";
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
  metadata?: ReactNode;
}

export function DetailHeader({
  name,
  logoUrl,
  helpItems,
  stats,
  metadata,
}: DetailHeaderProps) {
  return (
    <SectionWithHelp helpItems={helpItems}>
      <div className="flex justify-between">
        <Text className="text-4xl md:text-8xl">{name}</Text>
        {logoUrl && (
          <img src={logoUrl} alt="logo" className="h-[50px] md:h-[80px]" />
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
      {metadata}
    </SectionWithHelp>
  );
}
