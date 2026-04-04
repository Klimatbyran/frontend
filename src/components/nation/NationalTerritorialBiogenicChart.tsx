import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CardHeader } from "@/components/layout/CardHeader";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { useLanguage } from "@/components/LanguageProvider";
import { useScreenSize } from "@/hooks/useScreenSize";
import type { NationDetails } from "@/hooks/nation/useNationDetails";
import { NationalTerritorialBarChartPanel } from "./NationalTerritorialBarChartPanel";
import {
  buildLegendItems,
  computeNationTerritorialChartModel,
} from "./nationalTerritorialBiogenicChartModel";
import { TotalEmissionsComparisonBox } from "./TotalEmissionsComparisonBox";

export type NationalTerritorialBiogenicChartProps = {
  nation: NationDetails;
};

export const NationalTerritorialBiogenicChart: FC<
  NationalTerritorialBiogenicChartProps
> = ({ nation }) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isMobile } = useScreenSize();

  const model = useMemo(
    () => computeNationTerritorialChartModel(nation),
    [nation.territorialFossilEmissions, nation.biogenicEmissions],
  );

  const legendItems = useMemo(
    () => buildLegendItems(t, model.showBiogenic, model.showTotal),
    [t, model.showBiogenic, model.showTotal],
  );

  if (model.chartData.length === 0) {
    return null;
  }

  return (
    <SectionWithHelp helpItems={[]}>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start md:gap-8 lg:gap-10">
        <div className="flex min-w-0 flex-col gap-4">
          <CardHeader
            title={t("nation.detailPage.territorialBiogenic.title")}
            description={t("nation.detailPage.territorialBiogenic.description")}
            unit={t("detailPage.inTons")}
            className="[&>div]:!mb-0"
          />
          <TotalEmissionsComparisonBox
            comparisonTotals={model.comparisonTotals}
            currentLanguage={currentLanguage}
            t={t}
          />
          {!model.showBiogenic ? (
            <p className="text-sm text-grey">
              {t("nation.detailPage.territorialBiogenic.biogenicUnavailable")}
            </p>
          ) : null}
        </div>
        <NationalTerritorialBarChartPanel
          chartData={model.chartData}
          showBiogenic={model.showBiogenic}
          showTotal={model.showTotal}
          legendItems={legendItems}
          isMobile={isMobile}
          currentLanguage={currentLanguage}
          t={t}
        />
      </div>
    </SectionWithHelp>
  );
};
