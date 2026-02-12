// ToDo Add translations
import React, { useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SECTOR_NAMES } from "@/lib/constants/sectors";
import { RankedCompany } from "@/types/company";
import {
  useCategoryMetadata,
  CategoryType,
} from "@/hooks/companies/useCategories";
import { useScreenSize } from "@/hooks/useScreenSize";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";

interface Scope3BreakdownProps {
  companies: RankedCompany[];
  selectedSectors: string[];
  selectedYear: string;
}

const sectorSpecificInfo = {
  "10": {
    upstream: ["Fuel Activities", "Capital Goods", "Transportation"],
    downstream: ["Product Use", "End of Life", "Transportation"],
  },
  "15": {
    upstream: ["Purchased Goods", "Transportation", "Fuel Activities"],
    downstream: ["Processing", "Product Use", "End of Life"],
  },
  "20": {
    upstream: ["Purchased Goods", "Capital Goods", "Transportation"],
    downstream: ["Product Use", "Transportation", "End of Life"],
  },
  "25": {
    upstream: ["Purchased Goods", "Transportation", "Packaging"],
    downstream: ["Product Use", "End of Life", "Transportation"],
  },
  "30": {
    upstream: ["Purchased Goods", "Packaging", "Transportation"],
    downstream: ["Product Use", "End of Life", "Transportation"],
  },
  "35": {
    upstream: ["Purchased Goods", "Capital Goods", "Transportation"],
    downstream: ["Product Use", "End of Life", "Transportation"],
  },
  "40": {
    upstream: ["Purchased Goods", "Business Travel", "Employee Commuting"],
    downstream: ["Investments", "Leased Assets"],
  },
  "45": {
    upstream: ["Purchased Goods", "Capital Goods", "Transportation"],
    downstream: ["Product Use", "End of Life"],
  },
  "50": {
    upstream: ["Capital Goods", "Purchased Goods", "Employee Commuting"],
    downstream: ["Product Use", "End of Life"],
  },
  "55": {
    upstream: ["Fuel Activities", "Capital Goods", "Transportation"],
    downstream: ["Product Use", "Transmission Losses"],
  },
  "60": {
    upstream: ["Capital Goods", "Purchased Goods", "Construction"],
    downstream: ["Leased Assets", "End of Life"],
  },
};

const CategoryCard = ({
  category,
  type,
}: {
  category: { id: number; name: string; icon: React.ElementType };
  type: CategoryType;
}) => {
  const { isMobile } = useScreenSize();
  const Icon = category.icon;
  const colorClass = type === "upstream" ? "text-blue-3" : "text-green-3";

  if (isMobile) {
    return (
      <div className="bg-black-2 rounded-lg p-3 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${colorClass} shrink-0`} />
        <div className="min-w-0">
          <div className="text-xs font-medium text-white truncate">
            {category.name}
          </div>
          <div className="text-[10px] text-grey">Category {category.id}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black-2 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-5 w-5 ${colorClass}`} />
        <span className="text-sm font-medium text-white">{category.name}</span>
      </div>
      <p className="text-xs text-grey">Category {category.id}</p>
    </div>
  );
};

const Scope3Breakdown: React.FC<Scope3BreakdownProps> = ({
  companies,
  selectedSectors,
  selectedYear,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const { isMobile } = useScreenSize();
  const {
    getCategoryIcon,
    getCategoryName,
    getCategoryType,
    upstreamCategories: upstreamCategoryIds,
    downstreamCategories: downstreamCategoryIds,
  } = useCategoryMetadata();

  const upstreamCategories = upstreamCategoryIds.map((id) => ({
    id,
    name: getCategoryName(id),
    icon: getCategoryIcon(id),
    type: getCategoryType(id),
  }));

  const downstreamCategories = downstreamCategoryIds.map((id) => ({
    id,
    name: getCategoryName(id),
    icon: getCategoryIcon(id),
    type: getCategoryType(id),
  }));

  // Create a map of all categories for easy lookup
  const allCategories = [...upstreamCategories, ...downstreamCategories];

  const sectorAnalysis = useMemo(() => {
    return selectedSectors
      .map((sectorCode) => {
        const sectorName =
          SECTOR_NAMES[sectorCode as keyof typeof SECTOR_NAMES];
        const sectorCompanies = companies.filter(
          (company) => company.industry?.industryGics?.sectorCode === sectorCode,
        );

        const totalScope3 = sectorCompanies.reduce((total, company) => {
          const period = company.reportingPeriods.find((p) =>
            p.endDate.startsWith(selectedYear),
          );
          return (
            total + (period?.emissions?.scope3?.calculatedTotalEmissions || 0)
          );
        }, 0);

        const reportedCategories = new Set<string>();
        sectorCompanies.forEach((company) => {
          const period = company.reportingPeriods.find((p) =>
            p.endDate.startsWith(selectedYear),
          );
          if (period?.emissions?.scope3?.categories) {
            period.emissions.scope3.categories.forEach((cat) => {
              const category =
                upstreamCategories.find((c) => c.id === cat.category)?.name ||
                downstreamCategories.find((c) => c.id === cat.category)?.name;
              if (category) {
                reportedCategories.add(category);
              }
            });
          }
        });

        const specificInfo =
          sectorSpecificInfo[sectorCode as keyof typeof sectorSpecificInfo];
        const reportedUpstream = specificInfo.upstream.filter((cat) =>
          reportedCategories.has(cat),
        );
        const reportedDownstream = specificInfo.downstream.filter((cat) =>
          reportedCategories.has(cat),
        );

        return {
          sectorCode,
          sectorName,
          totalScope3,
          hasData: totalScope3 > 0,
          specificInfo: {
            upstream: reportedUpstream,
            downstream: reportedDownstream,
          },
        };
      })
      .sort((a, b) => b.totalScope3 - a.totalScope3);
  }, [
    downstreamCategories,
    companies,
    selectedSectors,
    selectedYear,
    upstreamCategories,
  ]);

  // Update the getCategoryIdByName function to use the allCategories map
  const getCategoryIdByName = (name: string) => {
    const category = allCategories.find((c) => c.name === name);
    return category?.id || 1; // Default to category 1 if not found
  };

  return (
    <div className="mt-12 space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-light text-white">
          Scope 3 Emissions Analysis
        </h2>
        <span className="text-sm text-grey">(Value Chain Categories)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black-1 border border-black-2 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpRight className="h-5 w-5 text-blue-3" />
            <h3 className="text-lg font-light text-white">
              Upstream Categories
            </h3>
          </div>
          <div
            className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-3`}
          >
            {upstreamCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                type={category.type}
              />
            ))}
          </div>
        </div>

        <div className="bg-black-1 border border-black-2 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowDownRight className="h-5 w-5 text-green-3" />
            <h3 className="text-lg font-light text-white">
              Downstream Categories
            </h3>
          </div>
          <div
            className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-3`}
          >
            {downstreamCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                type={category.type}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-black-1 border border-black-2 rounded-lg p-6">
        <h3 className="text-lg font-light text-white mb-6">
          Industry-Specific Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectorAnalysis.map((sector) => (
            <div key={sector.sectorCode} className="bg-black-2 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-white">
                  {sector.sectorName}
                </h4>
                <div className="text-xs text-grey">
                  {formatEmissionsAbsolute(sector.totalScope3, currentLanguage)}{" "}
                  {t("emissionsUnit")}
                </div>
              </div>

              {!sector.hasData ? (
                <div className="flex items-center gap-2 text-grey">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs">No Scope 3 data available</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUpRight className="h-4 w-4 text-blue-3" />
                      <span className="text-xs font-medium text-white">
                        Key Upstream Sources
                      </span>
                    </div>
                    {sector.specificInfo.upstream.length > 0 ? (
                      <div className="space-y-1">
                        {sector.specificInfo.upstream.map((source, index) => (
                          <div key={index} className="flex items-center gap-2">
                            {React.createElement(
                              getCategoryIcon(getCategoryIdByName(source)),
                              {
                                className: "h-3 w-3 text-blue-3",
                              },
                            )}
                            <span className="text-xs text-grey">{source}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-grey">
                        No upstream data reported
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowDownRight className="h-4 w-4 text-green-3" />
                      <span className="text-xs font-medium text-white">
                        Key Downstream Sources
                      </span>
                    </div>
                    {sector.specificInfo.downstream.length > 0 ? (
                      <div className="space-y-1">
                        {sector.specificInfo.downstream.map((source, index) => (
                          <div key={index} className="flex items-center gap-2">
                            {React.createElement(
                              getCategoryIcon(getCategoryIdByName(source)),
                              {
                                className: "h-3 w-3 text-green-3",
                              },
                            )}
                            <span className="text-xs text-grey">{source}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-grey">
                        No downstream data reported
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Scope3Breakdown;
