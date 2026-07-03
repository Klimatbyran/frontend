import { useTranslation } from "react-i18next";
import { getSortedEntityKPIValues } from "@/utils/data/sorting";
import { Region } from "@/types/region";
import { KPIValue } from "@/types/rankings";
import {
  calculateEntityStatistics,
  createDefaultColorGetter,
  createSourceLinks,
  buildPerformerProps,
  TOP_N,
} from "@/utils/insights/rankedListUtils";
import InsightsList from "../ranked/InsightsList";
import KPIDetailsPanel from "../ranked/KPIDetailsPanel";
import { KPIDistributionChart } from "../ranked/KPIDistributionChart";
import {
  DistributionBox,
  BooleanSummaryBox,
} from "../ranked/InsightsPanelParts";

type InsightsPanelSection = "stats" | "top" | "bottom" | "distribution";

interface InsightsPanelProps {
  regionsData: Region[];
  selectedKPI: KPIValue<Region>;
  section?: InsightsPanelSection;
}

function RegionalInsightsPanel({
  regionsData: regionData,
  selectedKPI,
  section,
}: InsightsPanelProps) {
  const { t } = useTranslation();

  if (!regionData?.length) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-white text-lg">{t("noData")}</p>
      </div>
    );
  }

  const statistics = calculateEntityStatistics(
    regionData,
    selectedKPI,
    (m) => m[selectedKPI.key as keyof Region],
    "regions",
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
    regionData,
    selectedKPI.key,
    selectedKPI.isBoolean,
    selectedKPI.higherIsBetter,
  );

  const topRegions = sortedData.slice(0, TOP_N);
  const bottomRegions = sortedData.slice(-TOP_N).reverse();
  const sourceLinks = createSourceLinks(selectedKPI);
  const entityPlural = t("header.regions").toLowerCase();
  const unit = selectedKPI.unit || "";

  const { topPerformer, bottomPerformer } = buildPerformerProps(
    sortedData,
    {
      key: selectedKPI.key as keyof Region,
      unit,
      isBoolean: selectedKPI.isBoolean,
    },
    "/regions",
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
            data={regionData}
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
      entityType="regions"
      chart={
        <KPIDistributionChart<Region>
          data={regionData}
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
    <InsightsList<Region>
      title={t(
        selectedKPI.higherIsBetter
          ? "rankedInsights.titleTop"
          : "rankedInsights.titleBest",
        { nrOfEntities: topRegions.length, entityPlural: entityPlural },
      )}
      entities={topRegions}
      totalCount={statistics.validData.length}
      dataPointKey={selectedKPI.key as keyof Region}
      unit={selectedKPI.unit}
      nullValues={selectedKPI.nullValues}
      entityType="regions"
      nameKey="name"
      showBars
      colorItem={colorItem}
    />
  ) : (
    booleanSummary
  );

  const bottomPanel = !selectedKPI.isBoolean ? (
    <InsightsList<Region>
      title={t("rankedInsights.titleWorst", {
        nrOfEntities: bottomRegions.length,
        entityPlural: entityPlural,
      })}
      entities={bottomRegions}
      totalCount={statistics.validData.length}
      isBottomRanking
      dataPointKey={selectedKPI.key as keyof Region}
      unit={selectedKPI.unit}
      nullValues={selectedKPI.nullValues}
      entityType="regions"
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

export default RegionalInsightsPanel;
