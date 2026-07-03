import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { useResponsiveChartSize } from "@/hooks/useResponsiveChartSize";
import { useCategoryMetadata } from "@/hooks/companies/useCategories";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { YearSelector } from "@/components/layout/YearSelector";
import { ProgressiveDataGuide } from "@/data-guide/ProgressiveDataGuide";
import { EmissionsBreakdown } from "./EmissionsBreakdown";
import { Scope3ChartTab } from "./Scope3ChartTab";
import {
  getAvailableYears,
  getDisplayYear,
  getSelectedCategories,
  getSelectedScope3Total,
} from "./scope3DataUtils";

interface Scope3DataProps {
  emissions: {
    scope3?: {
      total: number;
      unit: string;
      categories?: Array<{
        category: number;
        total: number;
        unit: string;
        metadata?: {
          verifiedBy?: { name: string } | null;
          user?: { name?: string } | null;
        };
      }>;
    } | null;
  } | null;
  className?: string;
  historicalData?: Array<{
    year: number;
    total: number;
    unit: string;
    categories: Array<{
      category: number;
      total: number;
      unit: string;
      metadata?: {
        verifiedBy?: { name: string } | null;
        user?: { name?: string } | null;
      };
    }>;
  }>;
}

export function Scope3Data({
  emissions,
  className,
  historicalData,
}: Scope3DataProps) {
  const { t } = useTranslation();
  const [selectedYear, setSelectedYear] = useState<string>("latest");
  const { size } = useResponsiveChartSize();
  const { getCategoryColor, getCategoryName } = useCategoryMetadata();
  const [filteredCategories, setFilteredCategories] = useState<Set<string>>(
    new Set(),
  );
  const { isAIGenerated } = useVerificationStatus();

  if (!emissions?.scope3?.categories?.length) {
    return null;
  }

  const availableYears = getAvailableYears(historicalData);
  const selectedCategories = getSelectedCategories(
    selectedYear,
    emissions.scope3.categories,
    historicalData,
  );
  const displayYear = getDisplayYear(selectedYear, availableYears);
  const selectedScope3Total = getSelectedScope3Total(
    selectedYear,
    emissions.scope3?.total ?? 0,
    historicalData,
  );

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-8">
        <Text variant="h3">{t("companies.scope3Data.categories")}</Text>
      </div>
      <Tabs defaultValue="chart" className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList className="bg-black-1 w-full sm:w-auto flex">
            <TabsTrigger value="chart" className="flex-1 text-center">
              {t("companies.scope3Data.visualisation")}
            </TabsTrigger>
            <TabsTrigger value="data" className="flex-1 text-center">
              {t("companies.scope3Data.data")}
            </TabsTrigger>
          </TabsList>

          {availableYears.length > 0 && (
            <YearSelector
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
              availableYears={availableYears}
              translateNamespace="companies.scope3Data"
              includeLatestOption
            />
          )}
        </div>

        <TabsContent value="chart">
          <Scope3ChartTab
            selectedCategories={selectedCategories}
            selectedScope3Total={selectedScope3Total}
            size={size}
            filteredCategories={filteredCategories}
            onFilteredCategoriesChange={setFilteredCategories}
            getCategoryName={getCategoryName}
            getCategoryColor={getCategoryColor}
            isAIGenerated={isAIGenerated}
          />
        </TabsContent>

        <TabsContent value="data">
          <EmissionsBreakdown
            emissions={{
              scope3: { ...emissions.scope3, categories: selectedCategories },
              calculatedTotalEmissions: emissions.scope3?.total || 0,
            }}
            year={displayYear}
            className="bg-transparent p-0"
            showOnlyScope3
          />
        </TabsContent>
      </Tabs>

      <ProgressiveDataGuide
        items={["scope3", "scope3Variations", "scope3EmissionLevels"]}
      />
    </div>
  );
}
