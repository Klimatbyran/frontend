import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "../ui/text";
import { OverviewChart } from "../companies/detail/history/OverviewChart";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { useTimeSeriesChartState } from "@/components/charts";
import { getChartData } from "@/utils/data/chartData";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { generateApproximatedData } from "@/lib/calculations/trends/approximatedData";
import type { RankedCompany, ReportingPeriod } from "@/types/company";
import { Button } from "../ui/button";
import { LocalizedLink } from "@/components/LocalizedLink";
import { ArrowRight } from "lucide-react";
import { CompanySearchInput } from "./CompanySearchInput";
import { cn } from "@/lib/utils";
import {
  LANDING_CHART_PANEL_HEIGHT_CLASS,
  LANDING_SECTION_BODY_CLASS,
  LANDING_SECTION_ROW_CLASS,
  LANDING_SECTION_TITLE_CLASS,
  LANDING_TEXT_COLUMN_CLASS,
  LANDING_VISUAL_COLUMN_CLASS,
} from "@/lib/constants/landingPage";

export const CompaniesSection = () => {
  const { t } = useTranslation();
  const { isAIGenerated, isEmissionsAIGenerated } = useVerificationStatus();
  const { chartEndYear, setChartEndYear, shortEndYear, longEndYear } =
    useTimeSeriesChartState();
  const [selectedCompany, setSelectedCompany] = useState<RankedCompany | null>(
    null,
  );
  const [isCompanySearchBusy, setIsCompanySearchBusy] = useState(true);
  const handleSearchBusyChange = useCallback((busy: boolean) => {
    setIsCompanySearchBusy(busy);
  }, []);

  // Memoize chart section so it only re-renders when selectedCompany or chart props change
  const chartSection = useMemo(() => {
    if (!selectedCompany?.reportingPeriods?.length) {
      return (
        <Text className="text-grey">
          {t("landingPage.companiesSection.noEmissionsData")}
        </Text>
      );
    }
    const companyBaseYear = selectedCompany?.baseYear?.year;
    const chartData = getChartData(
      selectedCompany.reportingPeriods as unknown as ReportingPeriod[],
      isAIGenerated,
      isEmissionsAIGenerated,
    );
    const trendAnalysis = calculateTrendline(selectedCompany);
    const approximatedData =
      trendAnalysis?.coefficients && chartData.length > 0
        ? generateApproximatedData(
            chartData,
            chartEndYear,
            trendAnalysis.coefficients,
          )
        : null;
    return (
      <div className={LANDING_CHART_PANEL_HEIGHT_CLASS}>
        <OverviewChart
          key={String(selectedCompany.wikidataId)}
          data={chartData}
          companyBaseYear={companyBaseYear}
          chartEndYear={chartEndYear}
          setChartEndYear={setChartEndYear}
          shortEndYear={shortEndYear}
          longEndYear={longEndYear}
          approximatedData={approximatedData}
          onYearSelect={() => undefined}
          yearControlsPlacement="top-right"
        />
      </div>
    );
  }, [
    selectedCompany,
    isAIGenerated,
    isEmissionsAIGenerated,
    chartEndYear,
    shortEndYear,
    longEndYear,
  ]);

  return (
    <div className="bg-black w-full flex flex-col items-center pt-44 md:pt-52">
      <div className="w-full container max-w-7xl mx-auto px-4">
        <div className={LANDING_SECTION_ROW_CLASS}>
          <div
            className={cn(
              "order-1 flex flex-col gap-24 lg:order-2 lg:pt-4",
              LANDING_TEXT_COLUMN_CLASS,
            )}
          >
            <div className="flex flex-col gap-4">
              <Text className={LANDING_SECTION_TITLE_CLASS}>
                {t("landingPage.companiesSection.title")}
              </Text>
              <Text className={LANDING_SECTION_BODY_CLASS}>
                {t("landingPage.companiesSection.description")}
              </Text>
            </div>

            <LocalizedLink
              to="/explore/companies"
              className="hidden landing-laptop:flex lg:flex self-end w-fit shrink-0 md:pt-2"
            >
              <Button
                variant="outline"
                size="lg"
                className="group relative w-auto h-12 rounded-md overflow-hidden font-medium hover:opacity-100 active:opacity-100"
              >
                <span
                  className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100"
                  aria-hidden="true"
                />
                <span className="relative z-10 inline-flex items-center text-white transition-colors duration-500 group-hover:text-black">
                  {t("landingPage.companiesSection.exploreButton")}
                  <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                </span>
              </Button>
            </LocalizedLink>
          </div>

          <div
            className={cn(
              "order-2 flex flex-col gap-3 lg:order-1",
              LANDING_VISUAL_COLUMN_CLASS,
            )}
          >
            <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-start md:gap-6 md:pt-4">
              <CompanySearchInput
                onSelect={setSelectedCompany}
                onBusyChange={handleSearchBusyChange}
              />

              <div className="w-full flex items-center gap-2">
                <Text className="text-lg font-light text-[18px] text-grey">
                  {t("landingPage.companiesSection.currentlyViewing")}
                </Text>
                <Text className="text-white text-lg font-medium">
                  {selectedCompany?.name ?? "-"}
                </Text>
              </div>
            </div>

            {isCompanySearchBusy ? (
              <div
                className={cn(
                  LANDING_CHART_PANEL_HEIGHT_CLASS,
                  "animate-pulse bg-black-2 rounded-level-2",
                )}
              />
            ) : (
              chartSection
            )}
          </div>

          <LocalizedLink
            to="/explore/companies"
            className="landing-laptop:hidden lg:hidden order-3 self-start w-fit shrink-0"
          >
            <Button
              variant="outline"
              size="lg"
              className="group relative w-auto h-12 rounded-md overflow-hidden font-medium hover:opacity-100 active:opacity-100"
            >
              <span
                className="absolute inset-0 origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100"
                aria-hidden="true"
              />
              <span className="relative z-10 inline-flex items-center text-white transition-colors duration-500 group-hover:text-black">
                {t("landingPage.companiesSection.exploreButton")}
                <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
              </span>
            </Button>
          </LocalizedLink>
        </div>
      </div>
    </div>
  );
};
