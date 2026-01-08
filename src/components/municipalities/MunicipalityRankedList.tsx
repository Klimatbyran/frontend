import { useTranslation } from "react-i18next";
import RankedList from "@/components/ranked/RankedList";
import { DataPoint, KPIValue, RankedListItem } from "@/types/rankings";
import { Municipality } from "@/types/municipality";

interface MunicipalityRankedListProps {
  municipalityEntities: RankedListItem[];
  selectedKPI: KPIValue<Municipality>;
}

export function MunicipalityRankedList({
  municipalityEntities,
  selectedKPI,
}: MunicipalityRankedListProps) {
  const { t } = useTranslation();

  const asDataPoint = (kpi: unknown): DataPoint<RankedListItem> =>
    kpi as DataPoint<RankedListItem>;

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return selectedKPI.nullValues ? t(selectedKPI.nullValues) : t("noData");
    }

    if (typeof value === "boolean") {
      return value
        ? t(`municipality.list.kpis.${selectedKPI.key}.booleanLabels.true`)
        : t(`municipality.list.kpis.${selectedKPI.key}.booleanLabels.false`);
    }

    if (typeof value === "number") {
      return value.toFixed(1);
    }

    return String(value);
  };

  return (
    <RankedList
      data={municipalityEntities}
      selectedDataPoint={asDataPoint({
        label: selectedKPI.label,
        key: selectedKPI.key as keyof RankedListItem,
        unit: selectedKPI.unit,
        description: selectedKPI.description,
        higherIsBetter: selectedKPI.higherIsBetter,
        nullValues: selectedKPI.nullValues,
        isBoolean: selectedKPI.isBoolean,
        booleanLabels: selectedKPI.booleanLabels,
        formatter: formatValue,
      })}
      onItemClick={() => {}}
      searchKey="displayName"
      searchPlaceholder={t("rankedList.search.placeholder")}
    />
  );
}
