import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { CompanyWithKPIs } from "@/types/company";
import { createSymmetricRangeGradient } from "@/utils/ui/colorGradients";
import { filterValidNumericData } from "@/utils/data/filtering";
import { BeeswarmChart } from "./shared/BeeswarmChart";
import type { ColorFunction } from "@/types/visualizations";

interface EmissionsChangeVisualizationProps {
  companies: CompanyWithKPIs[];
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

export function EmissionsChangeVisualization({
  companies,
  onCompanyClick,
}: EmissionsChangeVisualizationProps) {
  const { t } = useTranslation();
  const { valid: withData, invalid: noData } = useMemo(
    () =>
      filterValidNumericData(companies, (c) => c.emissionsChangeFromBaseYear),
    [companies],
  );

  const values = useMemo(
    () => withData.map((c) => c.emissionsChangeFromBaseYear as number),
    [withData],
  );

  const min = useMemo(
    () => (values.length ? Math.min(...values) : 0),
    [values],
  );
  const max = useMemo(
    () => (values.length ? Math.max(...values) : 0),
    [values],
  );

  // Color function: range-based
  const colorForValue: ColorFunction = useMemo(() => {
    return (value: number) => createSymmetricRangeGradient(min, max, value);
  }, [min, max]);

  if (withData.length === 0) {
    return (
      <div className="bg-black-2 rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-grey text-lg">
          {t("companiesRankedPage.visualizations.noDataAvailable")}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-grey">
          {t("companiesRankedPage.visualizations.emissionsChange.title")}
          {" · "}
          {t("companiesRankedPage.visualizations.emissionsChange.unknown")}:{" "}
          {noData.length}
        </div>
      </div>

      <div className="relative flex-1 bg-black-2 rounded-level-2 p-4 overflow-auto">
        <BeeswarmChart
          data={withData}
          getValue={(c) => c.emissionsChangeFromBaseYear as number}
          getCompanyName={(c) => c.name}
          getCompanyId={(c) => c.wikidataId}
          colorForValue={colorForValue}
          min={min}
          max={max}
          unit="%"
          onCompanyClick={onCompanyClick}
        />
      </div>
    </div>
  );
}
