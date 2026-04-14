import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { Text } from "../ui/text";
import { Input } from "../ui/input";
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

interface CompaniesSectionProps {
  companies: RankedCompany[];
}

export const CompaniesSection = ({ companies }: CompaniesSectionProps) => {
  const { t } = useTranslation();
  const { isAIGenerated, isEmissionsAIGenerated } = useVerificationStatus();
  const { chartEndYear, setChartEndYear, shortEndYear, longEndYear } =
    useTimeSeriesChartState();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<
    string | undefined
  >(undefined);

  const filteredCompanies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return companies;
    }

    return companies.filter((company) =>
      company.name.toLowerCase().includes(query),
    );
  }, [companies, searchQuery]);

  const selectedCompany = useMemo(() => {
    if (selectedCompanyId) {
      const selectedById = companies.find(
        (company) => String(company.wikidataId) === selectedCompanyId,
      );
      if (selectedById) {
        return selectedById;
      }
    }

    return (
      companies.find((company) => company.name === "ABB Ltd.") || companies[0]
    );
  }, [companies, selectedCompanyId]);

  const companyBaseYear = selectedCompany?.baseYear?.year;

  const chartData = useMemo(() => {
    if (!selectedCompany?.reportingPeriods?.length) {
      return [];
    }

    return getChartData(
      selectedCompany.reportingPeriods as unknown as ReportingPeriod[],
      isAIGenerated,
      isEmissionsAIGenerated,
    );
  }, [selectedCompany, isAIGenerated, isEmissionsAIGenerated]);

  const trendAnalysis = useMemo(() => {
    if (!selectedCompany) {
      return null;
    }

    return calculateTrendline(selectedCompany);
  }, [selectedCompany]);

  const approximatedData = useMemo(() => {
    if (!trendAnalysis?.coefficients || chartData.length === 0) {
      return null;
    }

    return generateApproximatedData(
      chartData,
      chartEndYear,
      trendAnalysis.coefficients,
    );
  }, [chartData, chartEndYear, trendAnalysis]);

  return (
    <div className="bg-black w-full flex flex-col items-center min-h-screen pt-24 md:pt-80">
      <div className="w-full container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
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
              to="/companies"
              className="hidden lg:flex self-end w-fit shrink-0"
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

          <div className="order-2 lg:order-1 w-full lg:w-3/5 max-w-screen-lg flex flex-col gap-3">
            <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-start md:gap-6 md:pt-6">
              <div className="relative w-full max-w-[18rem]">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
                    aria-hidden="true"
                  />
                  <Input
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setIsDropdownOpen(false);
                      }
                    }}
                    placeholder={t("landingPage.searchPlaceholder")}
                    className="h-11 border-white/25 bg-black-2 pl-10 text-white placeholder:text-white/50 focus-visible:ring-white/40"
                    aria-label={t("landingPage.placeholder")}
                  />
                </div>

                {isDropdownOpen && searchQuery.trim() && (
                  <div className="absolute left-0 top-full z-30 mt-2 max-h-48 w-full overflow-y-auto rounded-md border border-white/10 bg-black-2 shadow-lg">
                    {filteredCompanies.length > 0 ? (
                      filteredCompanies.slice(0, 8).map((company) => (
                        <button
                          key={company.wikidataId}
                          type="button"
                          tabIndex={0}
                          onClick={() => {
                            setSelectedCompanyId(String(company.wikidataId));
                            setSearchQuery(company.name);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-white hover:bg-white/10"
                        >
                          {company.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-white/60">
                        {t("globalSearch.searchDialog.emptyText")}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="w-full flex items-center gap-2">
                <Text className="text-lg font-light text-[18px] text-grey">
                  {t("landingPage.companiesSection.currentlyViewing")}
                </Text>
                <Text className="text-white text-lg font-medium">
                  {selectedCompany?.name ?? "-"}
                </Text>
              </div>
            </div>

            {selectedCompany && chartData.length > 0 ? (
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
            ) : (
              <Text className="text-grey">No emissions data available.</Text>
            )}
          </div>

          <LocalizedLink
            to="/companies"
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
