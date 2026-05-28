import React from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatEmissionsAbsolute,
  formatPercent,
} from "@/utils/formatting/localization";
import { InfoTooltip } from "@/components/layout/InfoTooltip";

interface ScopeCardProps {
  title: string;
  icon: React.ElementType;
  scope: "scope1" | "scope2" | "scope3_upstream" | "scope3_downstream";
  value: number;
  companies: number;
  color: string;
  percent: number;
  description: string;
  showCategoryInfo?: boolean;
  setSelectedScope: React.Dispatch<
    React.SetStateAction<
      "scope1" | "scope2" | "scope3_upstream" | "scope3_downstream" | null
    >
  >;
}

const ScopeCard: React.FC<ScopeCardProps> = ({
  title,
  icon: Icon,
  scope,
  value,
  companies,
  color,
  percent,
  description,
  showCategoryInfo = false,
  setSelectedScope,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open card modal if clicking on the info tooltip
    const target = e.target as HTMLElement;
    if (
      target.closest('button[aria-haspopup="dialog"]') ||
      target.closest('[role="dialog"]') ||
      target
        .closest("svg")
        ?.parentElement?.closest('button[aria-haspopup="dialog"]')
    ) {
      return;
    }
    setSelectedScope(scope);
  };

  return (
    <div
      className="bg-black-2 rounded-lg p-6 space-y-4 cursor-pointer hover:scale-105 transition-transform duration-200"
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`rounded-full p-2 ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <h3 className="text-lg font-light text-white">{title}</h3>
        {showCategoryInfo && (
          <InfoTooltip
            ariaLabel={t(
              "companyDetailPage.sectorGraphs.scope3CategoryInfoLabel",
            )}
            className="w-4 h-4 text-grey"
          >
            <p>{t("companyDetailPage.sectorGraphs.scope3CategoryInfo")}</p>
          </InfoTooltip>
        )}
      </div>

      <p className="text-sm text-grey">{description}</p>

      <div className="space-y-4">
        <div className="space-y-1">
          <div className="text-sm text-grey">
            {t("companyDetailPage.sectorGraphs.totalEmissions")}
          </div>
          <div
            className={`text-xl font-light ${color.replace("bg-", "text-")}`}
          >
            {formatEmissionsAbsolute(value, currentLanguage)}{" "}
            {t("emissionsUnit")}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-sm text-grey">
            {t("companyDetailPage.sectorGraphs.companiesReporting")}
          </div>
          <div className="text-sm text-white">
            {companies} {t("companyDetailPage.sectorGraphs.companies")}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-sm text-grey">
            {t("companyDetailPage.sectorGraphs.shareOfTotal")}
          </div>
          <div className={`text-sm ${color.replace("bg-", "text-")}`}>
            {formatPercent(percent, currentLanguage)}
          </div>
        </div>

        <div className="h-2 bg-black-1 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ease-out ${color}`}
            style={{ width: `${percent * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ScopeCard;
