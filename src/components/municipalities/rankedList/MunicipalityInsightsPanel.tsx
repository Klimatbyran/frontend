import { COLORS } from "@/lib/colors";
import { useTranslation } from "react-i18next";
import { Municipality } from "@/types/municipality";
import { KPIValue } from "@/types/rankings";
import { getSortedEntityKPIValues } from "@/utils/data/sorting";
import {
  calculateEntityStatistics,
  createSourceLinks,
} from "@/utils/insights/rankedListUtils";
import KPIDetailsPanel from "../../ranked/KPIDetailsPanel";
import InsightsList from "../../ranked/InsightsList";
import { KPIDistributionChart } from "../../ranked/KPIDistributionChart";

export type InsightsPanelSection = "stats" | "top" | "bottom";

interface InsightsPanelProps {
  municipalityData: Municipality[];
  selectedKPI: KPIValue<Municipality>;
  /** Render only one section. Omit to render all three (legacy). */
  section?: InsightsPanelSection;
}

const TOP_N = 10;

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

  const sortedData = getSortedEntityKPIValues(municipalityData, selectedKPI);
  const topMunicipalities = sortedData.slice(0, TOP_N);
  const bottomMunicipalities = sortedData.slice(-TOP_N).reverse();
  const sourceLinks = createSourceLinks(selectedKPI);
  const entityPlural = t("header.municipalities").toLowerCase();

  const statsPanel = (
    <KPIDetailsPanel
      title={selectedKPI.label}
      description={selectedKPI.description}
      higherIsBetter={selectedKPI.higherIsBetter}
      averageValue={statistics.formattedAverage}
      averageLabel={t("municipalities.list.insights.keyStatistics.average")}
      distributionStats={statistics.distributionStats}
      missingDataCount={statistics.nullCount}
      missingDataLabel={selectedKPI.nullValues}
      sourceLinks={sourceLinks}
    >
      <KPIDistributionChart
        data={municipalityData}
        selectedKPI={selectedKPI}
        average={!selectedKPI.isBoolean ? statistics.average : undefined}
      />
    </KPIDetailsPanel>
  );

  const booleanSummary = (
    <div className="bg-white/5 rounded-level-2 p-6 flex flex-col justify-center gap-6 h-full">
      <h3 className="text-lg font-semibold text-white">
        {t("municipalities.list.insights.distribution.summary")}
      </h3>
      {statistics.distributionStats.map((stat, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className="text-4xl font-bold"
            style={{ color: i === 0 ? COLORS.blue3 : COLORS.pink3 }}
          >
            {stat.count}
          </div>
          <div className="text-white/70 text-sm leading-tight">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
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
      textColor="text-blue-3"
      barColor={COLORS.blue3}
      entityType="municipalities"
      nameKey="name"
      showBars
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
      textColor="text-pink-3"
      barColor={COLORS.pink3}
      entityType="municipalities"
      nameKey="name"
      showBars
    />
  ) : null;

  // Single-section mode
  if (section === "stats") return statsPanel;
  if (section === "top") return topPanel;
  if (section === "bottom") return bottomPanel ?? statsPanel;

  // Legacy all-in-one mode
  return (
    <div>
      <div
        className={
          !selectedKPI.isBoolean
            ? "grid grid-cols-1 md:grid-cols-3 gap-6"
            : "grid grid-cols-1 md:grid-cols-2 gap-6"
        }
      >
        {statsPanel}
        {topPanel}
        {!selectedKPI.isBoolean && bottomPanel}
      </div>
    </div>
  );
}

export default InsightsPanel;
