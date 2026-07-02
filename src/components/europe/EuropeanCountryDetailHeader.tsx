import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { OverviewStat } from "@/components/companies/detail/overview/OverviewStat";
import { CountryFlag } from "@/components/europe/CountryFlag";
import { EuropeanCountryKpiComparisonsPanel } from "@/components/europe/EuropeanCountryKpiComparisonsPanel";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DataGuideItemId } from "@/data-guide/items";
import { DetailStat } from "@/components/detail/DetailHeader";
import { EuropeanCountryKpiComparisons } from "@/hooks/europe/useEuropeanCountryKpiComparisons";

export type EuropeanCountryDetailHeaderProps = {
  name: string;
  iso2: string;
  helpItems: DataGuideItemId[];
  stats: DetailStat[];
  kpiComparisons: EuropeanCountryKpiComparisons | null;
  headerChip?: ReactNode;
};

export function EuropeanCountryDetailHeader({
  name,
  iso2,
  helpItems,
  stats,
  kpiComparisons,
  headerChip,
}: EuropeanCountryDetailHeaderProps) {
  const { t } = useTranslation();

  return (
    <SectionWithHelp helpItems={helpItems}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <Text className="break-words text-4xl leading-tight lg:text-6xl">
            {name}
          </Text>
          <Text className="text-sm text-grey md:text-base">
            {t("europe.detailPage.dataSource")}
          </Text>
          {headerChip && <div className="w-fit shrink-0">{headerChip}</div>}
        </div>
        <CountryFlag iso2={iso2} countryName={name} />
      </div>

      {stats.length > 0 && (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      )}

      {kpiComparisons && (
        <EuropeanCountryKpiComparisonsPanel comparisons={kpiComparisons} />
      )}
    </SectionWithHelp>
  );
}
