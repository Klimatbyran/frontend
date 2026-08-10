import React from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { sectorColors, getCompanyColors } from "@/lib/constants/companyColors";
import { RankedCompany } from "@/types/company";
import { useScreenSize } from "@/hooks/useScreenSize";
import { useChartData } from "@/hooks/companies/useChartData";
import { getSectorsReportingYear } from "@/utils/data/yearUtils";
import SectorPieChart, {
  PieChartItem,
} from "@/components/charts/sectorChart/SectorPieChart";
import SectorPieLegend from "@/components/charts/sectorChart/SectorPieLegend";
import { DetailPieSectorGrid } from "@/components/detail/DetailGrid";
import SectorChartInsights from "./SectorChartInsights";
import { useSectorChartInsights } from "@/hooks/companies/useSectorChartInsights";
import { useChartMotion } from "@/hooks/useChartMotion";
import { useLanguage } from "@/components/LanguageProvider";
import { localizedPath } from "@/utils/routing";
import EmissionsTotalDisplay from "./EmissionsTotalDisplay";

interface EmissionsChartProps {
  companies: RankedCompany[];
  isSectorView: boolean;
}

interface PieChartClickData {
  name?: string;
  value?: number;
  color?: string;
  category?: number;
  total?: number;
  sectorCode?: string;
  wikidataId?: string;
}

const SectorEmissionsChart: React.FC<EmissionsChartProps> = ({
  companies,
  isSectorView,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { reduceMotion, fadeDuration, ease } = useChartMotion();
  const screenSize = useScreenSize();
  const location = useLocation();

  const reportingYear = getSectorsReportingYear().toString();

  const { pieChartData, totalEmissions } = useChartData(
    companies,
    isSectorView,
    reportingYear,
  );

  const insights = useSectorChartInsights(
    companies,
    pieChartData,
    isSectorView,
    reportingYear,
  );

  const handlePieClick = (data: PieChartClickData) => {
    if (!isSectorView && data?.sectorCode) {
      navigate(
        localizedPath(
          currentLanguage,
          `/sectors/${data.sectorCode}${location.search}`,
        ),
      );
    } else if (isSectorView && data?.wikidataId) {
      navigate(localizedPath(currentLanguage, `/companies/${data.wikidataId}`));
    }
  };

  const pieChartDataWithColor: PieChartItem[] = pieChartData.map(
    (entry, index) => ({
      ...entry,
      color: isSectorView
        ? getCompanyColors(index).base
        : "sectorCode" in entry
          ? sectorColors[entry.sectorCode as keyof typeof sectorColors]?.base ||
            "var(--grey)"
          : "var(--grey)",
    }),
  );

  const actionTooltipKey = isSectorView
    ? "pieLegendCompany"
    : "pieLegendSector";

  const chartAnimationKey = `${isSectorView ? "sector" : "all-sectors"}-${reportingYear}`;

  return (
    <>
      <div className="bg-black-2 rounded-lg border p-6 w-full space-y-6">
        <div className="flex flex-col">
          <EmissionsTotalDisplay
            totalEmissions={totalEmissions}
            isSectorView={isSectorView}
          />
        </div>

        <div>
          {totalEmissions > 0 ? (
            <motion.div
              key={chartAnimationKey}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: fadeDuration, ease }}
            >
              <DetailPieSectorGrid>
                <SectorPieChart
                  data={pieChartDataWithColor}
                  onItemClick={handlePieClick}
                  customActionLabel={t(
                    `companyDetailPage.sectorGraphs.${actionTooltipKey}`,
                  )}
                  desktopScale={!screenSize.isMobile}
                  animationKey={chartAnimationKey}
                />
                <div className="w-full flex lg:items-center">
                  <SectorPieLegend
                    data={pieChartDataWithColor}
                    total={totalEmissions}
                    onItemClick={(entry) => {
                      handlePieClick(entry);
                    }}
                    getActionTooltip={() =>
                      t(`companyDetailPage.sectorGraphs.${actionTooltipKey}`)
                    }
                    gridColumns={2}
                    emissionsUnit={t(
                      "companyDetailPage.sectorGraphs.emissionsUnit",
                    )}
                    emissionsUnitClassName="text-white"
                    animationKey={chartAnimationKey}
                  />
                </div>
              </DetailPieSectorGrid>
            </motion.div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-grey">
                {t("companyDetailPage.sectorGraphs.noDataAvailablePieChart")}
              </p>
            </div>
          )}
        </div>
      </div>

      {totalEmissions > 0 && (
        <SectorChartInsights
          insights={insights}
          animationKey={chartAnimationKey}
        />
      )}
    </>
  );
};

export default SectorEmissionsChart;
