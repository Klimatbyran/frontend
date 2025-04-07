// FIXME ADD TRANSLATIONS

import { useState } from "react";
import { Building2 } from "lucide-react";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { ScopeReportingList } from "./ScopeReportingList";
import { SECTOR_NAMES } from "@/hooks/companies/useCompanyFilters";
import type { RankedCompany } from "@/hooks/companies/useCompanies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

type ComparisonView = "emissions" | "reporting" | "scope3";

interface SectorComparisonProps {
  currentCompany: RankedCompany;
  sectorCompanies: RankedCompany[];
  className?: string;
}

export function SectorComparison({
  currentCompany,
  sectorCompanies,
  className,
}: SectorComparisonProps) {
  const [view, setView] = useState<ComparisonView>("emissions");
  const { t } = useTranslation();

  // Sort companies by emissions reduction (best to worst)
  const sortedCompanies = [...sectorCompanies].sort(
    (a, b) =>
      (b.metrics?.emissionsReduction || 0) -
      (a.metrics?.emissionsReduction || 0),
  );

  // Find the current company's rank
  const currentCompanyRank =
    sortedCompanies.findIndex(
      (c) => c.wikidataId === currentCompany.wikidataId,
    ) + 1;

  // Transform companies data for the scope reporting list
  const companiesWithScopes = sortedCompanies.map((company, index) => {
    const latestPeriod = company.reportingPeriods[0];
    const reportedCategories =
      latestPeriod?.emissions?.scope3?.categories?.map((cat) => cat.category) ||
      [];

    return {
      id: company.wikidataId,
      name: company.name,
      rank: index + 1,
      emissionsReduction: company.metrics?.emissionsReduction || 0,
      isCurrentCompany: company.wikidataId === currentCompany.wikidataId,
      reportedCategories,
      reportingPeriods: company.reportingPeriods,
    };
  });

  const sectorCode = currentCompany.industry?.industryGics?.sectorCode;
  const sectorName = sectorCode
    ? t(SECTOR_NAMES[sectorCode])
    : t("companies.sectorComparison.sectorUnknown");

  if (!sectorCode) {
    return null;
  }

  const renderComparison = () => {
    switch (view) {
      case "emissions":
        return (
          <div className="space-y-8">
            <Text variant="h4">
              {t("companies.sectorComparison.emissionsReduction")}
            </Text>
            <div className="grid grid-cols-1 gap-4">
              {sortedCompanies.map((company, index) => (
                <div
                  key={company.wikidataId}
                  className={cn(
                    "flex items-center justify-between p-6 rounded-level-2",
                    company.wikidataId === currentCompany.wikidataId
                      ? "bg-blue-5/30"
                      : "bg-black-1",
                  )}
                >
                  <div className="flex items-center gap-6">
                    <Text variant="h6" className="text-orange-2 w-12">
                      #{index + 1}
                    </Text>
                    <Text variant="h6">{company.name}</Text>
                  </div>
                  <Text
                    variant="h6"
                    className={cn(
                      company.metrics?.emissionsReduction >= 0
                        ? "text-green-3"
                        : "text-pink-3",
                    )}
                  >
                    {company.metrics?.emissionsReduction > 0 ? "+" : ""}
                    {company.metrics?.displayReduction}%
                  </Text>
                </div>
              ))}
            </div>
          </div>
        );

      case "reporting":
        return (
          <div className="space-y-8">
            <Text variant="h4">
              {t("companies.sectorComparison.reportingYears")}
            </Text>
            <div className="grid grid-cols-1 gap-4">
              {sortedCompanies.map((company) => {
                const years = company.reportingPeriods
                  .map((period) => new Date(period.endDate).getFullYear())
                  .sort((a, b) => b - a);

                return (
                  <div
                    key={company.wikidataId}
                    className={cn(
                      "flex items-center justify-between p-6 rounded-level-2",
                      company.wikidataId === currentCompany.wikidataId
                        ? "bg-blue-5/30"
                        : "bg-black-1",
                    )}
                  >
                    <Text variant="h6">{company.name}</Text>
                    <div className="flex gap-2">
                      {years.map((year) => (
                        <div
                          key={year}
                          className="px-3 py-1 bg-blue-5/30 rounded-full text-blue-2 text-sm"
                        >
                          {year}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "scope3":
        return (
          <div className="space-y-8">
            <Text variant="h4">
              {t("companies.sectorComparison.reportedCategories")}
            </Text>
            <ScopeReportingList companies={companiesWithScopes} />
          </div>
        );
    }
  };

  return (
    <div className={cn("bg-black-2 rounded-level-1 p-16", className)}>
      <div className="flex items-center justify-between mb-12">
        <div className="space-y-2">
          <Text variant="h3">
            {t("companies.sectorComparison.comparisonIn", { sectorName })}
          </Text>
          <Text variant="body">
            Plats {currentCompanyRank} av {sectorCompanies.length} företag i
            sektorn
          </Text>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={view}
            onValueChange={(value) => setView(value as ComparisonView)}
          >
            <SelectTrigger className="w-[200px] bg-black-1">
              <SelectValue placeholder="Välj jämförelse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="emissions">
                {t("companies.sectorComparison.emissionsReduction")}
              </SelectItem>
              <SelectItem value="reporting">
                {t("companies.sectorComparison.reportingYears")}
              </SelectItem>
              <SelectItem value="scope3">
                {t("companies.sectorComparison.reportedCategories")}
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="w-12 h-12 rounded-full bg-blue-5/30 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-2" />
          </div>
        </div>
      </div>

      {renderComparison()}
    </div>
  );
}
