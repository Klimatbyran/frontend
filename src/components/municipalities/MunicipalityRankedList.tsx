import { useTranslation } from "react-i18next";
import RankedList from "@/components/ranked/RankedList";
import { useScreenSize } from "@/hooks/useScreenSize";
import { DataPoint, KPIValue, RankedListItem } from "@/types/rankings";
import { Municipality } from "@/types/municipality";

interface MunicipalityRankedListProps {
  municipalityEntities: RankedListItem[];
  selectedKPI: KPIValue<Municipality>;
  onItemClick: (item: RankedListItem) => void;
  headerAction?: React.ReactNode;
}

export function MunicipalityRankedList({
  municipalityEntities,
  selectedKPI,
  onItemClick,
  headerAction,
}: MunicipalityRankedListProps) {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();

  const asDataPoint = (kpi: unknown): DataPoint<RankedListItem> =>
    kpi as DataPoint<RankedListItem>;

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return t(
        `municipalities.list.kpis.${String(selectedKPI.key)}.nullValues`,
        {
          defaultValue: t("noData"),
        },
      );
    }

    if (typeof value === "boolean") {
      return value
        ? t(`municipalities.list.kpis.${selectedKPI.key}.booleanLabels.true`)
        : t(`municipalities.list.kpis.${selectedKPI.key}.booleanLabels.false`);
    }

    if (typeof value === "number") {
      return value.toFixed(1);
    }

    return String(value);
  };

  const selectedDataPoint = asDataPoint({
    label: selectedKPI.label,
    key: selectedKPI.key as keyof RankedListItem,
    unit: selectedKPI.unit,
    description: selectedKPI.description,
    higherIsBetter: selectedKPI.higherIsBetter,
    nullValues: selectedKPI.nullValues,
    isBoolean: selectedKPI.isBoolean,
    booleanLabels: selectedKPI.booleanLabels,
    formatter: formatValue,
  });

  return (
    <RankedList
      data={municipalityEntities}
      selectedDataPoint={selectedDataPoint}
      onItemClick={onItemClick}
      searchKey="name"
      searchPlaceholder={t("rankedList.search.placeholder")}
      itemsPerPage={isMobile ? 6 : 8}
      headerAction={headerAction}
    />
  );
}
