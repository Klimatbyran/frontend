import { type ReactNode } from "react";
import { Text } from "@/components/ui/text";
import { OverviewStat } from "@/components/companies/detail/overview/OverviewStat";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DataGuideItemId } from "@/data-guide/items";
import { PoliticalRuleSection } from "./PoliticalRuleSection";

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
  subtitle?: string;
  logoUrl?: string | null;
  politicalRule?: string[];
  politicalKSO?: string;
  helpItems: DataGuideItemId[];
  stats: DetailStat[];
  translateNamespace: string;
  politicalRuleLabelKey?: string;
  politicalXSOLabelKey?: string;
  /** Compare chip or other actions shown beside the logo. */
  headerChip?: ReactNode;
}

export function DetailHeader({
  name,
  subtitle,
  logoUrl,
  politicalRule,
  politicalKSO,
  helpItems,
  stats,
  translateNamespace,
  politicalRuleLabelKey = "politicalRule",
  politicalXSOLabelKey, // XSO = KSO or RSO hence the X
  headerChip,
}: DetailHeaderProps) {
  return (
    <SectionWithHelp helpItems={helpItems}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2 md:gap-3">
          <Text className="text-4xl md:text-8xl">{name}</Text>
          {subtitle && (
            <Text className="text-grey text-sm md:text-base lg:text-lg">
              {subtitle}
            </Text>
          )}
        </div>
        {(headerChip || logoUrl) && (
          <div className="flex shrink-0 flex-col items-end gap-3">
            {headerChip}
            {logoUrl && (
              <img src={logoUrl} alt="logo" className="h-[50px] md:h-[80px]" />
            )}
          </div>
        )}
      </div>
      {politicalRule && politicalRule.length > 0 && (
        <PoliticalRuleSection
          politicalRule={politicalRule}
          translateNamespace={translateNamespace}
          politicalRuleLabelKey={politicalRuleLabelKey}
          politicalXSOLabelKey={politicalXSOLabelKey}
          politicalKSO={politicalKSO}
        />
      )}
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
    </SectionWithHelp>
  );
}
