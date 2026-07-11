import { useTranslation } from "react-i18next";
import { KPIValue } from "@/types/rankings";
import { EuropeanCountry } from "@/types/europe";
import KPIDetailsPanel from "@/components/ranked/KPIDetailsPanel";
import InsightsList from "@/components/ranked/InsightsList";
import { KPIDistributionChart } from "@/components/ranked/KPIDistributionChart";
import {
  DistributionBox,
  BooleanSummaryBox,
} from "@/components/ranked/InsightsPanelParts";
import {
  calculateEntityStatistics,
  createDefaultColorGetter,
  createSourceLinks,
  buildPerformerProps,
  TOP_N,
} from "@/utils/insights/rankedListUtils";
import { getSortedEntityKPIValues } from "@/utils/data/sorting";

type InsightsPanelSection = "stats" | "top" | "bottom" | "distribution";

interface InsightsPanelProps {
  countriesData: EuropeanCountry[];
  selectedKPI: KPIValue<EuropeanCountry>;
  section?: InsightsPanelSection;
}

function EuropeanInsightsPanel({
  countriesData: countryData,
  selectedKPI,
  section,
}: InsightsPanelProps) {
  const { t } = useTranslation();

  if (!countryData?.length) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-white text-lg">{t("noData")}</p>
      </div>
    );
  }

  const statistics = calculateEntityStatistics(
    countryData,
    selectedKPI,
    (country) => country[selectedKPI.key as keyof EuropeanCountry],
    "countries",
  );

  if (!statistics.validData.length) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-white text-lg">
          {t("noData", { metric: selectedKPI.label })}
        </p>
      </div>
    );
  }

  const sortedData = getSortedEntityKPIValues(
    statistics.validData,
    selectedKPI,
  );

  const colorItem = createDefaultColorGetter(
    countryData,
    selectedKPI.key,
    selectedKPI.isBoolean,
    selectedKPI.higherIsBetter,
  );

  const topCountries = sortedData.slice(0, TOP_N);
  const bottomCountries = sortedData.slice(-TOP_N).reverse();
  const sourceLinks = createSourceLinks(selectedKPI);
  const entityPlural = t("header.countries").toLowerCase();
  const unit = selectedKPI.unit || "";

  const { topPerformer, bottomPerformer } = buildPerformerProps(
    sortedData,
    {
      key: selectedKPI.key as keyof EuropeanCountry,
      unit,
      isBoolean: selectedKPI.isBoolean,
    },
    "/europe",
  );

  const statsPanel = (
    <KPIDetailsPanel
      title={selectedKPI.label}
      description={selectedKPI.description}
      isBoolean={selectedKPI.isBoolean}
      higherIsBetter={selectedKPI.higherIsBetter}
      averageValue={statistics.formattedAverage}
      averageLabel={t("municipalities.list.insights.keyStatistics.average")}
      topPerformer={topPerformer}
      bottomPerformer={bottomPerformer}
      chart={
        selectedKPI.isBoolean ? (
          <KPIDistributionChart
            data={countryData}
            selectedKPI={selectedKPI}
            entityLabel={entityPlural}
          />
        ) : undefined
      }
      distributionStats={statistics.distributionStats}
      missingDataCount={statistics.nullCount}
      missingDataLabel={selectedKPI.nullValues}
      sourceLinks={sourceLinks}
    />
  );

  const distributionPanel = (
    <DistributionBox
      entityType="europe"
      chart={
        <KPIDistributionChart<EuropeanCountry>
          data={countryData}
          selectedKPI={selectedKPI}
          average={!selectedKPI.isBoolean ? statistics.average : undefined}
          entityLabel={entityPlural}
        />
      }
    />
  );

  const booleanSummary = (
    <BooleanSummaryBox distributionStats={statistics.distributionStats} />
  );

  const topPanel = !selectedKPI.isBoolean ? (
    <InsightsList<EuropeanCountry>
      title={t(
        selectedKPI.higherIsBetter
          ? "rankedInsights.titleTop"
          : "rankedInsights.titleBest",
        { nrOfEntities: topCountries.length, entityPlural },
      )}
      entities={topCountries}
      totalCount={countryData.length}
      dataPointKey={selectedKPI.key as keyof EuropeanCountry}
      unit={selectedKPI.unit}
      nullValues={selectedKPI.nullValues}
      entityType="europe"
      nameKey="name"
      showBars
      colorItem={colorItem}
    />
  ) : (
    booleanSummary
  );

  const bottomPanel = !selectedKPI.isBoolean ? (
    <InsightsList<EuropeanCountry>
      title={t("rankedInsights.titleWorst", {
        nrOfEntities: bottomCountries.length,
        entityPlural,
      })}
      entities={bottomCountries}
      totalCount={countryData.length}
      isBottomRanking
      dataPointKey={selectedKPI.key as keyof EuropeanCountry}
      unit={selectedKPI.unit}
      nullValues={selectedKPI.nullValues}
      entityType="europe"
      nameKey="name"
      showBars
      colorItem={colorItem}
    />
  ) : null;

  if (section === "stats") return statsPanel;
  if (section === "distribution") return distributionPanel;
  if (section === "top") return topPanel;
  return bottomPanel ?? statsPanel;
}

export default EuropeanInsightsPanel;
