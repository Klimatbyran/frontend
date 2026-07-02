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
  const parisStat = stats[0];

  return (
    <SectionWithHelp helpItems={helpItems}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <Text className="break-words text-4xl md:text-8xl">{name}</Text>
          <Text className="text-sm text-grey md:text-base">
            {t("europe.detailPage.dataSource")}
          </Text>
          {headerChip && <div className="w-fit shrink-0">{headerChip}</div>}
        </div>
        <CountryFlag
          iso2={iso2}
          countryName={name}
          className="h-[50px] md:h-[80px]"
        />
      </div>

      {(parisStat || kpiComparisons) && (
        <EuropeanCountryKpiComparisonsPanel
          countryName={name}
          comparisons={kpiComparisons}
          className="mt-6 md:mt-8"
          leadingContent={
            parisStat ? (
              <OverviewStat
                variant="detail"
                label={parisStat.label}
                value={parisStat.value}
                unit={parisStat.unit}
                valueClassName={parisStat.valueClassName}
                info={parisStat.info}
                infoText={parisStat.infoText}
                useFlex1={false}
              />
            ) : undefined
          }
        />
      )}
    </SectionWithHelp>
  );
}
