import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text } from "../ui/text";
import { OverviewChart } from "../companies/detail/history/OverviewChart";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { useTimeSeriesChartState } from "@/components/charts";
import { getChartData } from "@/utils/data/chartData";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { generateApproximatedData } from "@/lib/calculations/trends/approximatedData";
import type { ReportingPeriod } from "@/types/company";
import { Button } from "../ui/button";
import { LocalizedLink } from "@/components/LocalizedLink";
import { ArrowRight } from "lucide-react";
import { CompanySearchInput } from "./CompanySearchInput";
import { RankedCompany } from "@/types/company";

export const CompaniesSection = () => {
  const { t } = useTranslation();
  const { isAIGenerated, isEmissionsAIGenerated } = useVerificationStatus();
  const { chartEndYear, setChartEndYear, shortEndYear, longEndYear } =
    useTimeSeriesChartState();
  const [selectedCompany, setSelectedCompany] = useState<RankedCompany | null>(
    null,
  );

  // Memoize chart section so it only re-renders when selectedCompany or chart props change
  const chartSection = useMemo(() => {
    if (!selectedCompany?.reportingPeriods?.length) {
      return <Text className="text-grey">No emissions data available.</Text>;
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
      <div className="w-full h-[520px]">
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
    <div className="bg-black w-full flex flex-col items-center min-h-screen pt-24 lg:pt-72">
      <div className="w-full container max-w-7xl mx-auto px-4">
        <div className="flex w-full flex-col items-start gap-8 lg:flex-row lg:gap-12">
          <div className="order-1 lg:order-2 w-full lg:w-2/5 flex flex-col gap-24 lg:pt-4">
            <div className="flex flex-col gap-4">
              <Text className="text-3xl sm:text-4xl font-light">
                {t("landingPage.companiesSection.title")}
              </Text>
              <Text className="text-grey font-regular text-[18px]">
                {t("landingPage.companiesSection.description")}
              </Text>
            </div>

            <LocalizedLink
              to="/explore/companies"
              className="hidden lg:flex self-end w-fit shrink-0 md:pt-2"
            >
              <Button
                variant="outline"
                size="lg"
                className="group relative w-auto h-12 rounded-md overflow-hidden font-medium border-white group-hover:border-blue-3 hover:opacity-100 active:opacity-100"
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

          <div className="order-2 lg:order-1 w-full lg:w-3/5 flex flex-col gap-3">
            <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-start md:gap-6 md:pt-4">
              <CompanySearchInput onSelect={setSelectedCompany} />

              <div className="w-full flex items-center gap-2">
                <Text className="text-lg font-light text-[18px] text-grey">
                  {t("landingPage.companiesSection.currentlyViewing")}
                </Text>
                <Text className="text-white text-lg font-medium">
                  {selectedCompany?.name ?? "-"}
                </Text>
              </div>
            </div>

            {chartSection}
          </div>

          <LocalizedLink
            to="/explore/companies"
            className="lg:hidden order-3 self-start w-fit shrink-0"
          >
            <Button
              variant="outline"
              size="lg"
              className="group relative w-auto h-12 rounded-md overflow-hidden font-medium border-white group-hover:border-blue-3 hover:opacity-100 active:opacity-100"
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
