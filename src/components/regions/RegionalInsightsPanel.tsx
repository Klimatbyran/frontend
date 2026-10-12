import { useTranslation } from "react-i18next";
import { getSortedEntityKPIValues } from "@/utils/data/sorting";
import { Region } from "@/types/region";
import { KPIValue } from "@/types/rankings";
import {
  calculateEntityStatistics,
  createDefaultColorGetter,
  TOP_N,
} from "@/utils/insights/rankedListUtils";
import InsightsList from "../ranked/InsightsList";

interface InsightsPanelProps {
  regionsData: Region[];
  selectedKPI: KPIValue<Region>;
  section: "top" | "bottom";
  /** Shown under the list title for the top and bottom sections. */
  listDescription?: string;
}

function RegionalInsightsPanel({
  regionsData: regionData,
  selectedKPI,
  section,
  listDescription,
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
  const entityPlural = t("header.regions").toLowerCase();

  if (selectedKPI.isBoolean) return null;

  const topPanel = (
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
      nullValues={t(`regions.list.kpis.${kpiKey}.nullValues`, {
        defaultValue: "",
      })}
      entityType="regions"
      nameKey="name"
      showBars
      colorItem={colorItem}
      description={listDescription}
    />
  );

  const bottomPanel = (
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
      nullValues={t(`regions.list.kpis.${kpiKey}.nullValues`, {
        defaultValue: "",
      })}
      entityType="regions"
      nameKey="name"
      showBars
      colorItem={colorItem}
      description={listDescription}
    />
  );

  return section === "bottom" ? bottomPanel : topPanel;
}

export default RegionalInsightsPanel;
