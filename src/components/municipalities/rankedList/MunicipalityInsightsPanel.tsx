import { COLORS } from "@/lib/colors";
import { useTranslation } from "react-i18next";
import { Municipality } from "@/types/municipality";
import { KPIValue } from "@/types/rankings";
import { getSortedEntityKPIValues } from "@/utils/data/sorting";
import {
  calculateEntityStatistics,
  createDefaultColorGetter,
  createSourceLinks,
  buildPerformerProps,
  TOP_N,
} from "@/utils/insights/rankedListUtils";
import KPIDetailsPanel from "../../ranked/KPIDetailsPanel";
import InsightsList from "../../ranked/InsightsList";
import { KPIDistributionChart } from "../../ranked/KPIDistributionChart";
import {
  DistributionBox,
  BooleanSummaryBox,
} from "../../ranked/InsightsPanelParts";

type InsightsPanelSection = "stats" | "top" | "bottom" | "distribution";

interface InsightsPanelProps {
  municipalityData: Municipality[];
  selectedKPI: KPIValue<Municipality>;
  /** Render only one section. Omit to render all three (legacy). */
  section?: InsightsPanelSection;
}

function InsightsPanel({
  municipalityData,
  selectedKPI,
  section,
}: InsightsPanelProps) {
  const { t } = useTranslation();

  if (!municipalityData?.length) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-white text-lg">
          {t("municipalities.list.insights.noData.municipality")}
        </p>
      </div>
    );
  }

  const statistics = calculateEntityStatistics(
    municipalityData,
    selectedKPI,
    (m) => m[selectedKPI.key],
  );

  if (!statistics.validData.length) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-white text-lg">
          {t("municipalities.list.insights.noData.metric", {
            metric: selectedKPI.label,
          })}
        </p>
      </div>
    );
  }

  // Sort only valid data so null-valued entities don't appear in performer/bottom lists
  const sortedData = getSortedEntityKPIValues(
    statistics.validData,
    selectedKPI,
  );

  const colorItem = createDefaultColorGetter(
    municipalityData,
    selectedKPI.key,
    selectedKPI.isBoolean,
    selectedKPI.higherIsBetter,
  );

  const topMunicipalities = sortedData.slice(0, TOP_N);
  const bottomMunicipalities = sortedData.slice(-TOP_N).reverse();
  const sourceLinks = createSourceLinks(selectedKPI);
  const entityPlural = t("header.municipalities").toLowerCase();
  const unit = selectedKPI.unit || "";

  const { topPerformer, bottomPerformer } = buildPerformerProps(
    sortedData,
    {
      key: selectedKPI.key as keyof Municipality,
      unit,
      isBoolean: selectedKPI.isBoolean,
    },
    "/municipalities",
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
            data={municipalityData}
            selectedKPI={selectedKPI}
            entityLabel={t("header.municipalities").toLowerCase()}
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
      chart={
        <KPIDistributionChart
          data={municipalityData}
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
    <InsightsList<Municipality>
      title={t(
        selectedKPI.higherIsBetter
          ? "rankedInsights.titleTop"
          : "rankedInsights.titleBest",
        { entityPlural },
      )}
      entities={topMunicipalities}
      totalCount={municipalityData.length}
      dataPointKey={selectedKPI.key as keyof Municipality}
      unit={selectedKPI.unit}
      nullValues={selectedKPI.nullValues}
      entityType="municipalities"
      nameKey="name"
      showBars
      colorItem={colorItem}
    />
  ) : (
    booleanSummary
  );

  const bottomPanel = !selectedKPI.isBoolean ? (
    <InsightsList<Municipality>
      title={t("rankedInsights.titleWorst", { entityPlural })}
      entities={bottomMunicipalities}
      totalCount={municipalityData.length}
      isBottomRanking
      dataPointKey={selectedKPI.key as keyof Municipality}
      unit={selectedKPI.unit}
      nullValues={selectedKPI.nullValues}
      entityType="municipalities"
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

export default InsightsPanel;
