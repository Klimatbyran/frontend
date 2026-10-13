import { useTranslation } from "react-i18next";
import { KPIValue } from "@/types/rankings";
import { getSortedEntityKPIValues } from "@/utils/data/sorting";
import {
  calculateEntityStatistics,
  createDefaultColorGetter,
  TOP_N,
} from "@/utils/insights/rankedListUtils";
import InsightsList from "./InsightsList";

interface TerritoryInsightsPanelProps<T extends { name: string }> {
  entities: T[];
  selectedKPI: KPIValue<T>;
  entityType: "municipalities" | "regions";
  /** i18n prefix, e.g. "municipalities.list" */
  translationPrefix: string;
  section: "top" | "bottom";
  /** Shown under the list title. */
  listDescription?: string;
}

function EmptyInsights({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-level-2 bg-white/5 p-8 backdrop-blur-sm">
      <p className="text-lg text-white">{message}</p>
    </div>
  );
}

/** Best or worst ranked list for a municipality or region overview. */
export function TerritoryInsightsPanel<T extends { name: string }>({
  entities,
  selectedKPI,
  entityType,
  translationPrefix,
  section,
  listDescription,
}: TerritoryInsightsPanelProps<T>) {
  const { t } = useTranslation();
  const kpiKey = String(selectedKPI.key);
  const emptyEntityKey =
    entityType === "municipalities" ? "municipality" : "region";

  if (!entities.length) {
    return (
      <EmptyInsights
        message={t(`${translationPrefix}.insights.noData.${emptyEntityKey}`, {
          defaultValue: t("noData"),
        })}
      />
    );
  }

  const statistics = calculateEntityStatistics(
    entities,
    selectedKPI,
    (entity) => entity[selectedKPI.key],
    entityType,
  );

  if (!statistics.validData.length) {
    return (
      <EmptyInsights
        message={t(`${translationPrefix}.insights.noData.metric`, {
          metric: t(`${translationPrefix}.kpis.${kpiKey}.label`),
          defaultValue: t("noData"),
        })}
      />
    );
  }

  if (selectedKPI.isBoolean) return null;

  const sortedData = getSortedEntityKPIValues(
    statistics.validData,
    selectedKPI,
  );
  const ranked =
    section === "bottom"
      ? sortedData.slice(-TOP_N).reverse()
      : sortedData.slice(0, TOP_N);
  const entityPlural = t(`header.${entityType}`).toLowerCase();
  const title =
    section === "bottom"
      ? t("rankedInsights.titleWorst", {
          nrOfEntities: ranked.length,
          entityPlural,
        })
      : t(
          selectedKPI.higherIsBetter
            ? "rankedInsights.titleTop"
            : "rankedInsights.titleBest",
          { nrOfEntities: ranked.length, entityPlural },
        );

  return (
    <InsightsList<T>
      title={title}
      entities={ranked}
      totalCount={statistics.validData.length}
      isBottomRanking={section === "bottom"}
      dataPointKey={selectedKPI.key}
      unit={selectedKPI.unit}
      nullValues={t(`${translationPrefix}.kpis.${kpiKey}.nullValues`, {
        defaultValue: "",
      })}
      entityType={entityType}
      nameKey="name"
      showBars
      deferAnimationUntilVisible
      entranceOnce
      colorItem={createDefaultColorGetter(
        entities,
        selectedKPI.key,
        selectedKPI.isBoolean,
        selectedKPI.higherIsBetter,
      )}
      description={listDescription}
    />
  );
}
