import React from "react";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "@/hooks/useScreenSize";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";

interface EmissionsTotalDisplayProps {
  totalEmissions: number;
  isSectorView?: boolean;
  hideTotal?: boolean;
}

const EmissionsTotalDisplay: React.FC<EmissionsTotalDisplayProps> = ({
  totalEmissions,
  isSectorView = false,
  hideTotal = false,
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
      {!hideTotal && (
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
              ? t("companyDetailPage.sectorGraphs.sectorTotal")
              : t("companyDetailPage.sectorGraphs.total")}
            <span className="ml-2 text-xl font-light text-orange-3">
              {formatEmissionsAbsolute(
                Math.round(totalEmissions),
                currentLanguage,
              )}{" "}
              {t("emissionsUnit")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmissionsTotalDisplay;
