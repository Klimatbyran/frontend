import { Text } from "@/components/ui/text";
import { OverviewStat } from "@/components/companies/detail/overview/OverviewStat";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DataGuideItemId } from "@/data-guide/items";
import { useTranslation } from "react-i18next";
import { PoliticalRuleLabel } from "./PoliticalRuleLabel";
import { ReactNode } from "react";

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
  helpItems: DataGuideItemId[];
  stats: DetailStat[];
  translateNamespace: string;
  politicalRuleLabelKey?: string;
}

export function DetailHeader({
  name,
  subtitle,
  logoUrl,
  politicalRule,
  helpItems,
  stats,
  translateNamespace,
  politicalRuleLabelKey = "politicalRule",
}: DetailHeaderProps) {
  const { t } = useTranslation();

  const politicalRuleLabels = politicalRule?.map((p, index) => (
    <span key={index}>
      {index ? ", " : ""}
      <PoliticalRuleLabel
        src={`/logos/politicalParties/${p}.png`}
        alt={p}
        fallback={p}
      />
    </span>
  ));

  return (
    <SectionWithHelp helpItems={helpItems}>
      <div className="flex justify-between">
        <div className="flex flex-col">
          <Text className="text-4xl md:text-8xl">{name}</Text>
          {subtitle && (
            <Text className="text-grey text-sm md:text-base lg:text-lg">
              {subtitle}
            </Text>
          )}
        </div>
        {logoUrl && (
          <img src={logoUrl} alt="logo" className="h-[50px] md:h-[80px]" />
        )}
      </div>
      {politicalRule && politicalRule.length > 0 && (
        <div className="flex flex-row items-center gap-2 my-4">
          <Text
            variant="body"
            className="text-grey text-sm md:text-base lg:text-lg"
          >
            {t(`${translateNamespace}.${politicalRuleLabelKey}`)}:
          </Text>
          <Text variant="body" className="text-sm md:text-base lg:text-lg">
            {politicalRuleLabels}
          </Text>
        </div>
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
