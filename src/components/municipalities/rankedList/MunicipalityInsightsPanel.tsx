import { useTranslation } from "react-i18next";
import { Municipality } from "@/types/municipality";
import { KPIValue } from "@/types/rankings";
import { getSortedEntityKPIValues } from "@/utils/data/sorting";
import {
  calculateEntityStatistics,
  createDefaultColorGetter,
  TOP_N,
} from "@/utils/insights/rankedListUtils";
import InsightsList from "../../ranked/InsightsList";

interface InsightsPanelProps {
  municipalityData: Municipality[];
  selectedKPI: KPIValue<Municipality>;
  section: "top" | "bottom";
  /** Shown under the list title for the top and bottom sections. */
  listDescription?: string;
}

function InsightsPanel({
  municipalityData,
  selectedKPI,
  section,
  listDescription,
}: InsightsPanelProps) {
  const { t } = useTranslation();
  const kpiKey = String(selectedKPI.key);

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
            metric: t(
              `municipalities.list.kpis.${String(selectedKPI.key)}.label`,
            ),
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
  const entityPlural = t("header.municipalities").toLowerCase();

  if (selectedKPI.isBoolean) return null;

  const topPanel = (
    <InsightsList<Municipality>
      title={t(
        selectedKPI.higherIsBetter
          ? "rankedInsights.titleTop"
          : "rankedInsights.titleBest",
        { nrOfEntities: topMunicipalities.length, entityPlural: entityPlural },
      )}
      entities={topMunicipalities}
      totalCount={statistics.validData.length}
      dataPointKey={selectedKPI.key as keyof Municipality}
      unit={selectedKPI.unit}
      nullValues={t(`municipalities.list.kpis.${kpiKey}.nullValues`, {
        defaultValue: "",
      })}
      entityType="municipalities"
      nameKey="name"
      showBars
      colorItem={colorItem}
      description={listDescription}
    />
  );

  const bottomPanel = (
    <InsightsList<Municipality>
      title={t("rankedInsights.titleWorst", {
        nrOfEntities: bottomMunicipalities.length,
        entityPlural: entityPlural,
      })}
      entities={bottomMunicipalities}
      totalCount={statistics.validData.length}
      isBottomRanking
      dataPointKey={selectedKPI.key as keyof Municipality}
      unit={selectedKPI.unit}
      nullValues={t(`municipalities.list.kpis.${kpiKey}.nullValues`, {
        defaultValue: "",
      })}
      entityType="municipalities"
      nameKey="name"
      showBars
      colorItem={colorItem}
      description={listDescription}
    />
  );

  return section === "bottom" ? bottomPanel : topPanel;
}

export default InsightsPanel;
