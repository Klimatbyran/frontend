import React from "react";
import { TooltipProps } from "recharts";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import { formatEmissionsAbsolute, formatPercent } from "@/utils/localizeUnit";
const CompanyTooltip: React.FC<TooltipProps<number, string>> = ({
  active,
  payload,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  if (!active || !payload || !payload.length) {
    return null;
  }
  const { name, value, payload: data } = payload[0];

  // Extract company data
  const companyName =
    name || data.name || t("companiesPage.sectorGraphs.unknownCompany");
  const totalEmissions = value || 0;

  // Calculate percentage of sector total
  const percentage = formatPercent(
    totalEmissions && data.total ? totalEmissions / data.total : 0,
    currentLanguage,
  );

  return (
    <div className="bg-black-2 border border-black-1 rounded-lg shadow-xl p-4 text-white">
      <p className="text-sm font-medium mb-2">{companyName}</p>
      <div className="text-sm text-grey space-y-1">
        <div className="flex justify-between gap-x-2">
          <span>{t("companiesPage.sectorGraphs.totalEmissions")}:</span>
          <span className="text-white font-medium">
            {formatEmissionsAbsolute(
              Math.round(totalEmissions),
              currentLanguage,
            )}{" "}
            {t("emissionsUnit")}
          </span>
        </div>
        <div className="flex justify-between">
          <span>{t("companiesPage.sectorGraphs.ofSector")}: </span>
          <span className="text-white font-medium">{percentage}</span>
        </div>
      </div>
    </div>
  );
};

export default CompanyTooltip;
