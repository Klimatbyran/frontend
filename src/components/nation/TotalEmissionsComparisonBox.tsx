import { FC } from "react";
import type { TFunction } from "i18next";
import type { SupportedLanguage } from "@/lib/languageDetection";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import {
  YEAR_TOTAL_TEXT_CLASS,
  type NationTerritorialChartModel,
} from "./nationalTerritorialBiogenicChartModel";

type TotalEmissionsComparisonBoxProps = {
  comparisonTotals: NationTerritorialChartModel["comparisonTotals"];
  showTotal: boolean;
  currentLanguage: SupportedLanguage;
  t: TFunction;
};

export const TotalEmissionsComparisonBox: FC<
  TotalEmissionsComparisonBoxProps
> = ({ comparisonTotals, showTotal, currentLanguage, t }) => (
  <div className="rounded-level-2  bg-black-1/40 px-4 py-5 md:px-6 md:py-6">
    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-grey">
      {t("nation.detailPage.territorialBiogenic.totalEmissionsComparisonTitle")}
    </p>
    <p className="mb-5 text-sm text-grey">
      {t(
        "nation.detailPage.territorialBiogenic.totalEmissionsComparisonSubline",
      )}
    </p>
    <div className="grid grid-cols-2 gap-4 md:gap-8">
      {comparisonTotals.map(({ year, totalTons }) => (
        <div key={year} className="min-w-0">
          <p className="mb-2 text-sm text-grey">{year}</p>
          <p
            className={`text-3xl font-light tabular-nums tracking-tight md:text-4xl ${YEAR_TOTAL_TEXT_CLASS[year] ?? "text-white"}`}
          >
            {totalTons != null
              ? formatEmissionsAbsolute(totalTons, currentLanguage)
              : "—"}
          </p>
          <p className="mt-2 text-xs text-grey">{t("emissionsUnit")}</p>
        </div>
      ))}
    </div>
  </div>
);
