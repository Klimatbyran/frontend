import { useTranslation } from "react-i18next";
import RankedList from "@/components/ranked/RankedList";
import { DataPoint, KPIValue } from "@/types/entity-rankings";
import { Region, RegionListItem } from "@/types/region";

interface RegionalRankedListProps {
  regionEntities: RegionListItem[];
  selectedKPI: KPIValue<Region>;
}

export function RegionalRankedList({ regionEntities, selectedKPI }: RegionalRankedListProps) {
  const { t } = useTranslation();

  const asDataPoint = (kpi: unknown): DataPoint<RegionListItem> =>
    kpi as DataPoint<RegionListItem>;

  return (
    <RankedList
      data={regionEntities}
      selectedDataPoint={asDataPoint({
        label: selectedKPI.label,
        key: selectedKPI.key as keyof RegionListItem,
        unit: selectedKPI.unit,
        description: selectedKPI.description,
        higherIsBetter: selectedKPI.higherIsBetter,
        nullValues: selectedKPI.nullValues,
        isBoolean: selectedKPI.isBoolean,
        booleanLabels: selectedKPI.booleanLabels,
        formatter: (value: unknown) => {
          if (value === null || value === undefined) {
            return selectedKPI.nullValues
              ? t(selectedKPI.nullValues)
              : t("noData");
          }

          if (typeof value === "boolean") {
            return value
              ? t(`regions.list.kpis.${selectedKPI.key}.booleanLabels.true`)
              : t(`regions.list.kpis.${selectedKPI.key}.booleanLabels.false`);
          }

          if (typeof value === "number") {
            return value.toFixed(1);
          }

          return String(value);
        },
      })}
      onItemClick={() => {}}
      searchKey="displayName"
      searchPlaceholder={t("rankedList.search.placeholder")}
    />
  );
}
