import { COLORS } from "@/lib/colors";
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
  const kpiKey = String(selectedKPI.key);

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
          {t("noData", {
            metric: t(`regions.list.kpis.${kpiKey}.label`),
          })}
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
      title={t(`regions.list.kpis.${kpiKey}.label`)}
      description={t(`regions.list.kpis.${kpiKey}.description`)}
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
            translationPrefix="regions.list"
          />
        ) : undefined
      }
      distributionStats={statistics.distributionStats}
      missingDataCount={statistics.nullCount}
      missingDataLabel={t(`regions.list.kpis.${kpiKey}.nullValues`, {
        defaultValue: "",
      })}
      sourceLinks={sourceLinks}
    />
  );

  const distributionPanel = (
    <DistributionBox
      chart={
        <KPIDistributionChart<Region>
          data={regionData}
          selectedKPI={selectedKPI}
          average={!selectedKPI.isBoolean ? statistics.average : undefined}
          entityLabel={entityPlural}
          translationPrefix="regions.list"
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
        { entityPlural },
      )}
      entities={topRegions}
      totalCount={regionData.length}
      dataPointKey={selectedKPI.key as keyof Region}
      unit={selectedKPI.unit}
      nullValues={t(`regions.list.kpis.${kpiKey}.nullValues`, {
        defaultValue: "",
      })}
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
      title={t("rankedInsights.titleWorst", { entityPlural })}
      entities={bottomRegions}
      totalCount={regionData.length}
      isBottomRanking
      dataPointKey={selectedKPI.key as keyof Region}
      unit={selectedKPI.unit}
      nullValues={t(`regions.list.kpis.${kpiKey}.nullValues`, {
        defaultValue: "",
      })}
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
