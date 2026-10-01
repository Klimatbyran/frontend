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

function supportingGridClass(count: number) {
  if (count >= 3) return "grid-cols-1 lg:grid-cols-3";
  if (count === 2) return "grid-cols-1 md:grid-cols-2";
  return "grid-cols-1";
}

export function DetailHeader({
  name,
  logoUrl,
  helpItems,
  stats,
  supplementalData,
  headerChip,
}: DetailHeaderProps) {
  const [primary, ...supporting] = stats;

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
      {primary && (
        <div className="mt-8 max-w-2xl">
          <DetailStatItem stat={primary} />
        </div>
      )}
      {supporting.length > 0 && (
        <div
          className={cn(
            "grid gap-8 md:gap-16",
            primary ? "mt-8 md:mt-12" : "mt-8",
            supportingGridClass(supporting.length),
          )}
        >
          {supporting.map((stat, index) => (
            <DetailStatItem key={index} stat={stat} />
          ))}
        </div>
      )}
      {supplementalData}
    </SectionWithHelp>
  );
}
