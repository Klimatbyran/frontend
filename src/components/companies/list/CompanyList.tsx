import { useState, useEffect, useMemo } from "react";
import { Building2, TrendingDown, Users, Wallet } from "lucide-react";
import { useCompanies } from "@/hooks/companies/useCompanies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useCategoryMetadata } from "@/hooks/companies/useCategories";
import { useLanguage } from "@/components/LanguageProvider";
import { localizeUnit } from "@/utils/localizeUnit";

type SortOption = "emissions" | "turnover" | "employees" | "name";

const sortOptions = [
  { value: "emissions", label: "Utsläpp" },
  { value: "turnover", label: "Omsättning" },
  { value: "employees", label: "Antal anställda" },
  { value: "name", label: "Företagsnamn" },
] as const;

export function CompanyList() {
  const { t } = useTranslation();
  const { companies, loading, error } = useCompanies();
  const [sortBy, setSortBy] = useState<SortOption>("emissions");
  const [sortedCompanies, setSortedCompanies] = useState(companies);
  const { getCategoryColor } = useCategoryMetadata();
  const { currentLanguage } = useLanguage();

  // Memoize the sorting function to prevent unnecessary recalculations
  const getSortedCompanies = useMemo(
    () => (companiesArray: typeof companies, sortKey: SortOption) => {
      return [...companiesArray].sort((a, b) => {
        switch (sortKey) {
          case "emissions":
            return (
              (b.reportingPeriods[0]?.emissions?.calculatedTotalEmissions ||
                0) -
              (a.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0)
            );
          case "turnover":
            return (
              (b.reportingPeriods[0]?.economy?.turnover?.value || 0) -
              (a.reportingPeriods[0]?.economy?.turnover?.value || 0)
            );
          case "employees":
            return (
              (b.reportingPeriods[0]?.economy?.employees?.value || 0) -
              (a.reportingPeriods[0]?.economy?.employees?.value || 0)
            );
          case "name":
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
    },
    [],
  );

  // Update sorted companies when companies or sort option changes
  useEffect(() => {
    setSortedCompanies(getSortedCompanies(companies, sortBy));
  }, [companies, sortBy, getSortedCompanies]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-black-2 rounded-level-2" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-light text-red-500">
          {t("error.fetchingCompanyInfo")}
        </h2>
        <p className="text-grey mt-2">{t("error.tryAgainLater")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortOption)}
        >
          <SelectTrigger className="w-[200px] bg-black-1">
            <SelectValue placeholder={t("sort.placeholder")} />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(`sort.${option.value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedCompanies.map((company) => {
          const latestPeriod = company.reportingPeriods[0];
          const turnover = latestPeriod?.economy?.turnover;
          const employees = latestPeriod?.economy?.employees;
          const emissions = latestPeriod?.emissions;

          // Find the largest scope 3 category
          const scope3Categories =
            latestPeriod?.emissions?.scope3?.categories || [];
          const largestCategory = scope3Categories.reduce(
            (max, current) =>
              current.total > (max?.total || 0) ? current : max,
            scope3Categories[0],
          );

          // Get the color for the largest category
          const categoryColor = largestCategory
            ? getCategoryColor(largestCategory.category)
            : "var(--blue-2)";

          return (
            <div
              key={company.wikidataId}
              className="bg-black-2 rounded-level-2 p-8 space-y-8"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-light">{company.name}</h3>
                  <p className="text-grey text-sm mt-2 line-clamp-2">
                    {company.description}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${categoryColor} 30%, transparent)`,
                    color: categoryColor,
                  }}
                >
                  <Building2 className="w-6 h-6" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {turnover?.value && (
                  <div className="bg-black-1 rounded-level-2 p-4">
                    <div className="flex items-center gap-2 text-grey mb-2">
                      <Wallet className="w-4 h-4" />
                      <span className="text-xs">
                        {t("company.list.turnover")}
                      </span>
                    </div>
                    <div className="text-lg font-light">
                      {localizeUnit(turnover.value / 1e9, currentLanguage)}
                      <span className="text-xs text-grey ml-1">
                        {turnover.currency}
                      </span>
                    </div>
                  </div>
                )}

                {employees?.value && (
                  <div className="bg-black-1 rounded-level-2 p-4">
                    <div className="flex items-center gap-2 text-grey mb-2">
                      <Users className="w-4 h-4" />
                      <span className="text-xs">
                        {t("company.list.employees")}
                      </span>
                    </div>
                    <div className="text-lg font-light">
                      {localizeUnit(employees.value, currentLanguage)}
                    </div>
                  </div>
                )}

                {emissions?.scope1And2 && (
                  <div className="bg-black-1 rounded-level-2 p-4">
                    <div className="flex items-center gap-2 text-grey mb-2">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-xs">
                        {t("company.list.emissions")}
                      </span>
                    </div>
                    <div className="text-lg font-light">
                      {localizeUnit(
                        emissions.scope1And2.total / 1000,
                        currentLanguage,
                      )}
                      k
                      <span className="text-xs text-grey ml-1">
                        {emissions.scope1And2.unit}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {latestPeriod?.reportURL && (
                <a
                  href={latestPeriod.reportURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                  style={{ color: categoryColor }}
                >
                  {t("company.list.readAnnualReport")} →
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
