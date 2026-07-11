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
}

export interface DetailHeaderProps {
  name: string;
  logoUrl?: string | null;
  headerImage?: ReactNode;
  helpItems: DataGuideItemId[];
  stats: DetailStat[];
  supplementalData?: ReactNode;
  /** Compare chip or other actions shown below the title (keeps logo unobstructed). */
  headerChip?: ReactNode;
}

export function DetailHeader({
  name,
  logoUrl,
  headerImage,
  helpItems,
  stats,
  supplementalData,
  headerChip,
}: DetailHeaderProps) {
  return (
    <SectionWithHelp helpItems={helpItems}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <Text className="break-words text-4xl md:text-7xl lg:text-8xl">
            {name}
          </Text>
          {headerChip && <div className="w-fit shrink-0">{headerChip}</div>}
        </div>
        {headerImage ??
          (logoUrl ? (
            <img
              src={logoUrl}
              alt="logo"
              className="h-[50px] shrink-0 md:h-[80px]"
            />
          ) : null)}
      </div>
      <div
        className={cn(
          "mt-8 grid grid-cols-1 gap-6 sm:gap-8 md:gap-10",
          stats.length >= 4
            ? "sm:grid-cols-2"
            : "sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
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
            className="min-w-0"
          />
        ))}
      </div>
      {supplementalData}
    </SectionWithHelp>
  );
}
