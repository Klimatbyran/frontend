import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { OverviewStat } from "@/components/companies/detail/overview/OverviewStat";
import { DetailTerritoryMap } from "@/components/maps/DetailTerritoryMap";
import { EuropeanCountryKpiComparisonsPanel } from "@/components/europe/EuropeanCountryKpiComparisonsPanel";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DataGuideItemId } from "@/data-guide/items";
import { DetailStat } from "@/components/detail/DetailHeader";
import { useEuropeanCountryDetailMap } from "@/hooks/europe/useEuropeanCountryDetailMap";
import { EuropeanCountryKpiComparisons } from "@/hooks/europe/useEuropeanCountryKpiComparisons";
import { cn } from "@/lib/utils";

const DETAIL_MAP_PANEL_CLASS =
  "relative min-w-0 h-[min(22rem,42vh)] min-h-[14rem] md:h-[min(26rem,48vh)] md:min-h-[18rem]";

export type EuropeanCountryDetailHeaderProps = {
  name: string;
  iso3: string;
  logoUrl?: string | null;
  helpItems: DataGuideItemId[];
  stats: DetailStat[];
  kpiComparisons: EuropeanCountryKpiComparisons | null;
  headerChip?: ReactNode;
};

export function EuropeanCountryDetailHeader({
  name,
  iso3,
  logoUrl,
  helpItems,
  stats,
  kpiComparisons,
  headerChip,
}: EuropeanCountryDetailHeaderProps) {
  const { t } = useTranslation();
  const { geoData, mapData, selectedKPI, countryMapName, isLoading } =
    useEuropeanCountryDetailMap(iso3);

  return (
    <SectionWithHelp helpItems={helpItems}>
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Text className="break-words text-4xl leading-tight md:text-5xl lg:text-6xl">
            {name}
          </Text>
          <Text className="text-sm text-grey md:text-base">
            {t("europe.detailPage.dataSource")}
          </Text>
          {headerChip && <div className="w-fit shrink-0">{headerChip}</div>}
        </div>
        {logoUrl && (
          <img
            src={logoUrl}
            alt="logo"
            className="h-[50px] shrink-0 object-contain md:h-[80px]"
          />
        )}
      </div>

      <div className="mt-8 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-8">
        <div className={cn(DETAIL_MAP_PANEL_CLASS)}>
          {isLoading || !selectedKPI ? (
            <div className="h-full w-full animate-pulse rounded-level-2 bg-black-1" />
          ) : (
            <DetailTerritoryMap
              entityType="europe"
              geoData={geoData}
              data={mapData}
              selectedKPI={selectedKPI}
              defaultCenter={[55, 15]}
              defaultZoom={3}
              propertyNameField="NAME"
              highlightedArea={countryMapName}
              scrollWheelZoom={false}
              className="h-full max-w-none"
            />
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-6 lg:gap-8">
          {stats.length > 0 && (
            <div className="min-w-0">
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
        </div>
      </div>
    </SectionWithHelp>
  );
}
