import { useTranslation } from "react-i18next";
import RankedList from "@/components/ranked/RankedList";
import { DataPoint, KPIValue, RankedListItem } from "@/types/rankings";
import { EuropeanCountry } from "@/types/europe";

interface EuropeanRankedListProps {
  countryEntities: RankedListItem[];
  selectedKPI: KPIValue<EuropeanCountry>;
  onItemClick: (item: RankedListItem) => void;
}

export function EuropeanRankedList({
  countryEntities,
  selectedKPI,
  onItemClick,
}: EuropeanRankedListProps) {
  const { t } = useTranslation();

  const asDataPoint = (kpi: unknown): DataPoint<RankedListItem> =>
    kpi as DataPoint<RankedListItem>;

  const selectedDataPoint = asDataPoint({
    label: selectedKPI.label,
    key: selectedKPI.key as keyof RankedListItem,
    unit: selectedKPI.unit,
    description: selectedKPI.description,
    higherIsBetter: selectedKPI.higherIsBetter,
    nullValues: selectedKPI.nullValues,
    isBoolean: selectedKPI.isBoolean,
    booleanLabels: selectedKPI.booleanLabels,
    formatter: (value: unknown) => {
      if (value === null || value === undefined) {
        return selectedKPI.nullValues ? t(selectedKPI.nullValues) : t("noData");
      }

      if (typeof value === "boolean") {
        return value
          ? t(`europe.list.kpis.${selectedKPI.key}.booleanLabels.true`)
          : t(`europe.list.kpis.${selectedKPI.key}.booleanLabels.false`);
      }

      if (typeof value === "number") {
        return value.toFixed(1);
      }

      return String(value);
    },
  });

  return (
    <RankedList
      data={countryEntities}
      selectedDataPoint={selectedDataPoint}
      onItemClick={onItemClick}
      searchKey="displayName"
      searchPlaceholder={t("rankedList.search.placeholder")}
    />
  );
}
