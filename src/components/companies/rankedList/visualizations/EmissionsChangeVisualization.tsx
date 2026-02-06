import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { CompanyWithKPIs } from "@/types/company";
import { createSymmetricRangeGradient } from "@/utils/ui/colorGradients";
import { useBeeswarmData } from "@/hooks/companies/useBeeswarmData";
import { useScreenSize } from "@/hooks/useScreenSize";
import { BeeswarmChart } from "./shared/BeeswarmChart";

interface EmissionsChangeVisualizationProps {
  companies: CompanyWithKPIs[];
  onCompanyClick?: (company: CompanyWithKPIs) => void;
}

export function EmissionsChangeVisualization({
  companies,
  onCompanyClick,
}: EmissionsChangeVisualizationProps) {
  const { t } = useTranslation();
  const { isMobile } = useScreenSize();
  const {
    valid: withData,
    invalid: noData,
    min,
    max,
    colorForValue,
  } = useBeeswarmData(
    companies,
    (c) => c.emissionsChangeFromBaseYear ?? null,
    (min, max) => (value: number) =>
      createSymmetricRangeGradient(min, max, value),
  );

  // Calculate ranks: lower is better (negative change is good)
  const rankMap = useMemo(() => {
    const sorted = [...withData].sort(
      (a, b) =>
        (a.emissionsChangeFromBaseYear ?? 0) -
        (b.emissionsChangeFromBaseYear ?? 0),
    );
    const map = new Map<string, number>();
    sorted.forEach((company, index) => {
      map.set(company.wikidataId, index + 1);
    });
    return map;
  }, [withData]);

  if (withData.length === 0) {
    return (
      <div className="bg-black-2 rounded-level-2 p-8 h-full flex items-center justify-center">
        <p className="text-grey text-lg">
          {t("companiesTopListsPage.visualizations.noDataAvailable")}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-3">
      {!isMobile && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-grey">
            {t("companiesTopListsPage.visualizations.emissionsChange.title")}
            {" · "}
            {t(
              "companiesTopListsPage.visualizations.emissionsChange.unknown",
            )}: {noData.length}
          </div>
        </div>
      )}

      <div className="relative flex-1 bg-black-2 rounded-level-2 p-4 overflow-hidden">
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
          getRank={(c) => rankMap.get(c.wikidataId) ?? null}
          totalCount={withData.length}
        />
      </div>
    </div>
  );
}
