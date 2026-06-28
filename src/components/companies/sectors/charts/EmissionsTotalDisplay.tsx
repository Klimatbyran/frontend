import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useScreenSize } from "@/hooks/useScreenSize";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import { useChartMotion } from "@/hooks/useChartMotion";

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
  const { reduceMotion, fadeDuration, ease } = useChartMotion();
  const formattedTotal = formatEmissionsAbsolute(
    Math.round(totalEmissions),
    currentLanguage,
  );

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
            <motion.span
              key={formattedTotal}
              className="ml-2 text-xl font-light text-orange-3 inline-block"
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: fadeDuration, ease }}
            >
              {formattedTotal}
            </motion.span>
            <span className="ml-1 text-xl font-light text-white">
              {t("companyDetailPage.sectorGraphs.emissionsUnit")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmissionsTotalDisplay;
