import React from "react";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "@/hooks/useScreenSize";
import { formatEmissionsAbsolute } from "@/utils/localizeUnit";
import { useLanguage } from "@/components/LanguageProvider";

interface EmissionsTotalDisplayProps {
  totalEmissions: number;
  selectedYear: string;
  years: string[];
  onYearChange: (year: string) => void;
  isSectorView?: boolean;
}

const EmissionsTotalDisplay: React.FC<EmissionsTotalDisplayProps> = ({
  totalEmissions,
  selectedYear,
  years,
  onYearChange,
  isSectorView = false,
}) => {
  const { t } = useTranslation();
  const { isMobile, isTablet } = useScreenSize();
  const { currentLanguage } = useLanguage();

  return (
    <div
      className={`${
        isMobile
          ? "flex flex-col gap-3 w-full"
          : isTablet
            ? "flex items-center justify-between w-full"
            : "flex items-center gap-4 ml-auto"
      }`}
    >
      <div
        className={
          isMobile
            ? "w-full"
            : isTablet
              ? "text-left"
              : "flex items-center gap-4"
        }
      >
        <div className="text-sm text-grey">
          {isSectorView
            ? t("companiesPage.sectorGraphs.sectorTotal")
            : t("companiesPage.sectorGraphs.total")}
          <span className="ml-2 text-xl font-light text-white">
            {formatEmissionsAbsolute(
              Math.round(totalEmissions),
              currentLanguage,
            )}{" "}
            {t("emissionsUnit")}
          </span>
        </div>
      </div>
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(e.target.value)}
        className={`bg-black-2 border border-black-1 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-3 transition-shadow ${
          isMobile ? "w-full" : ""
        }`}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EmissionsTotalDisplay;
