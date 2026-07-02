import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { CountryFlag } from "@/components/europe/CountryFlag";
import { EuropeanCountryKpiComparisonsPanel } from "@/components/europe/EuropeanCountryKpiComparisonsPanel";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DataGuideItemId } from "@/data-guide/items";
import { DetailStat } from "@/components/detail/DetailHeader";
import { EuropeanCountryKpiComparisons } from "@/hooks/europe/useEuropeanCountryKpiComparisons";
import { cn } from "@/lib/utils";

export type EuropeanCountryDetailHeaderProps = {
  name: string;
  iso2: string;
  helpItems: DataGuideItemId[];
  stats: DetailStat[];
  kpiComparisons: EuropeanCountryKpiComparisons | null;
  headerChip?: ReactNode;
};

function CompactParisStat({ stat }: { stat: DetailStat }) {
  return (
    <div className="flex min-w-0 flex-col justify-center">
      <Text className="text-base leading-snug md:text-lg">{stat.label}</Text>
      <Text
        className={cn("mt-1 text-3xl leading-none md:text-4xl", stat.valueClassName)}
      >
        {stat.value}
      </Text>
    </div>
  );
}

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
    <SectionWithHelp
      helpItems={helpItems}
      compactLayout
      className="px-4 py-4 md:px-6 md:py-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Text className="break-words text-3xl leading-tight lg:text-5xl">
            {name}
          </Text>
          <Text className="text-sm text-grey">{t("europe.detailPage.dataSource")}</Text>
          {headerChip && <div className="mt-1 w-fit shrink-0">{headerChip}</div>}
        </div>
        <CountryFlag iso2={iso2} countryName={name} className="md:h-16" />
      </div>

      {(parisStat || kpiComparisons) && (
        <EuropeanCountryKpiComparisonsPanel
          comparisons={kpiComparisons}
          leadingContent={
            parisStat ? <CompactParisStat stat={parisStat} /> : undefined
          }
        />
      )}
    </SectionWithHelp>
  );
}
