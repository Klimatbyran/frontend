import { useTranslation } from "react-i18next";
import { formatEmissionsAbsoluteCompact } from "@/utils/formatting/localization";

interface CumulativeSummaryBoxesProps {
  step5Data: {
    year: number;
    approximated: number | undefined;
    carbonLaw: number | undefined;
    areaDiff: number | undefined;
  }[];
  currentLanguage: "sv" | "en";
  className?: string;
}

export function CumulativeSummaryBoxes({
  step5Data,
  currentLanguage,
  className = "",
}: CumulativeSummaryBoxesProps) {
  const { t } = useTranslation();

  if (!step5Data || step5Data.length === 0) {
    return null;
  }

  const totalAreaDifference = step5Data.reduce(
    (sum, d) => sum + (d.areaDiff || 0),
    0,
  );

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-2 ${className}`}>
      {/* Paris Carbon Budget */}
      <div className="bg-green-4/20 rounded-lg p-2 backdrop-blur-sm">
        <div className="text-green-3 text-xs font-medium mb-1">
          {t("companies.emissionsHistory.parisAlignedPathLabel")}
        </div>
        <div className="text-white text-sm font-bold">
          {formatEmissionsAbsoluteCompact(
            step5Data.reduce((sum, d) => sum + (d.carbonLaw || 0), 0),
            currentLanguage,
          )}{" "}
          t
        </div>
        <div className="text-green-3 text-xs mt-1">
          {t("companies.emissionsHistory.cumulativePeriod")}
        </div>
      </div>

      {/* Company Emissions */}
      <div className="bg-orange-4/20 rounded-lg p-2 backdrop-blur-sm">
        <div className="text-orange-3 text-xs font-medium mb-1">
          {t("companies.emissionsHistory.companyEmissionsLabel")}
        </div>
        <div className="text-white text-sm font-bold">
          {formatEmissionsAbsoluteCompact(
            step5Data.reduce((sum, d) => sum + (d.approximated || 0), 0),
            currentLanguage,
          )}{" "}
          t
        </div>
        <div className="text-orange-3 text-xs mt-1">
          {t("companies.emissionsHistory.cumulativePeriod")}
        </div>
      </div>

      {/* Budget Status */}
      <div
        className={`bg-gradient-to-br ${
          totalAreaDifference < 0 ? "bg-green-4/20" : "bg-pink-4/20"
        } rounded-lg p-2 backdrop-blur-sm`}
      >
        <div
          className={`text-xs font-medium mb-1 ${
            totalAreaDifference < 0 ? "text-green-3" : "text-pink-3"
          }`}
        >
          {t("companies.emissionsHistory.budgetStatusLabel")}
        </div>
        <div className="text-white text-sm font-bold">
          {totalAreaDifference < 0 ? "-" : "+"}
          {formatEmissionsAbsoluteCompact(
            Math.abs(totalAreaDifference),
            currentLanguage,
          )}{" "}
          t
        </div>
        <div
          className={`text-xs mt-1 ${
            totalAreaDifference < 0 ? "text-green-3" : "text-pink-3"
          }`}
        >
          {totalAreaDifference < 0
            ? t("companies.emissionsHistory.underBudget")
            : t("companies.emissionsHistory.overBudget")}
        </div>
      </div>
    </div>
  );
}
