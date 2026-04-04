import { FC } from "react";
import type { TFunction } from "i18next";
import type { SupportedLanguage } from "@/lib/languageDetection";
import { OverviewStat } from "@/components/companies/detail/overview/OverviewStat";
import { Text } from "@/components/ui/text";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import {
  YEAR_TOTAL_TEXT_CLASS,
  type NationTerritorialChartModel,
} from "./nationalTerritorialBiogenicChartModel";

type TotalEmissionsComparisonBoxProps = {
  comparisonTotals: NationTerritorialChartModel["comparisonTotals"];
  currentLanguage: SupportedLanguage;
  t: TFunction;
};

export const TotalEmissionsComparisonBox: FC<
  TotalEmissionsComparisonBoxProps
> = ({ comparisonTotals, currentLanguage, t }) => (
  <div className="space-y-6">
    <div>
      <Text className="text-lg md:text-xl">
        {t(
          "nation.detailPage.territorialBiogenic.totalEmissionsComparisonTitle",
        )}
      </Text>
      <Text className="mt-1 text-sm text-grey md:text-base">
        {t(
          "nation.detailPage.territorialBiogenic.totalEmissionsComparisonSubline",
        )}
      </Text>
    </div>
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-16">
      {comparisonTotals.map(({ year, totalTons }) => {
        const hasValue = totalTons != null;
        return (
          <OverviewStat
            key={year}
            variant="detail"
            label={String(year)}
            value={
              hasValue
                ? formatEmissionsAbsolute(totalTons, currentLanguage)
                : "—"
            }
            unit={hasValue ? t("emissionsUnit") : undefined}
            valueClassName={YEAR_TOTAL_TEXT_CLASS[year] ?? "text-white"}
            useFlex1={false}
          />
        );
      })}
    </div>
  </div>
);
