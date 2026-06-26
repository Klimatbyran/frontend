import { COLORS } from "@/lib/colors";
import { useTranslation } from "react-i18next";
import { getSortedEntityKPIValues } from "@/utils/data/sorting";
import { Region } from "@/types/region";
import { KPIValue } from "@/types/rankings";
import {
  calculateEntityStatistics,
  createSourceLinks,
} from "@/utils/insights/rankedListUtils";
import InsightsList from "../ranked/InsightsList";
import KPIDetailsPanel from "../ranked/KPIDetailsPanel";
import { KPIDistributionChart } from "../ranked/KPIDistributionChart";

export type InsightsPanelSection = "stats" | "top" | "bottom" | "distribution";

interface InsightsPanelProps {
  regionsData: Region[];
  selectedKPI: KPIValue<Region>;
  section?: InsightsPanelSection;
}

const TOP_N = 10;

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

  const sortedData = getSortedEntityKPIValues(regionData, selectedKPI);
  const topRegions = sortedData.slice(0, TOP_N);
  const bottomRegions = sortedData.slice(-TOP_N).reverse();
  const sourceLinks = createSourceLinks(selectedKPI);
  const entityPlural = t("header.regions").toLowerCase();
  const unit = selectedKPI.unit || "";

  const bestItem = sortedData[0];
  const worstItem = sortedData[sortedData.length - 1];

  const statsPanel = (
    <KPIDetailsPanel
      title={selectedKPI.label}
      description={selectedKPI.description}
      isBoolean={selectedKPI.isBoolean}
      higherIsBetter={selectedKPI.higherIsBetter}
      averageValue={statistics.formattedAverage}
      medianValue={statistics.formattedMedian}
      averageLabel={t("municipalities.list.insights.keyStatistics.average")}
      topPerformer={
        !selectedKPI.isBoolean && bestItem
          ? {
              name: bestItem.name,
              value: `${(bestItem[selectedKPI.key as keyof Region] as number)?.toFixed(1)}${unit}`,
              href: `/regions/${bestItem.name}`,
            }
          : undefined
      }
      bottomPerformer={
        !selectedKPI.isBoolean && worstItem && worstItem !== bestItem
          ? {
              name: worstItem.name,
              value: `${(worstItem[selectedKPI.key as keyof Region] as number)?.toFixed(1)}${unit}`,
              href: `/regions/${worstItem.name}`,
            }
          : undefined
      }
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
    <div className="bg-white/5 rounded-level-2 p-6 flex flex-col justify-between h-full gap-6">
      <div>
        <h3 className="text-2xl font-bold text-white">
          {t("municipalities.list.insights.distribution.title")}
        </h3>
        <p className="text-sm text-white/50 mt-1">
          {t("municipalities.list.insights.distribution.subtitle")}
        </p>
      </div>
      <KPIDistributionChart<Region>
        data={regionData}
        selectedKPI={selectedKPI}
        average={!selectedKPI.isBoolean ? statistics.average : undefined}
        entityLabel={entityPlural}
      />
    </div>
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
      nullValues={selectedKPI.nullValues}
      textColor="text-blue-3"
      barColor={COLORS.blue3}
      entityType="regions"
      nameKey="name"
      showBars
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
      nullValues={selectedKPI.nullValues}
      textColor="text-pink-3"
      barColor={COLORS.pink3}
      entityType="regions"
      nameKey="name"
      showBars
    />
  ) : null;

  if (section === "stats") return statsPanel;
  if (section === "distribution") return distributionPanel;
  if (section === "top") return topPanel;
  if (section === "bottom") return bottomPanel ?? statsPanel;

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

export default RegionalInsightsPanel;
