import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmissionsBreakdown } from "./EmissionsBreakdown";

import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";
import PieChartView from "../CompanyPieChartView";
import { useResponsiveChartSize } from "@/hooks/useResponsiveChartSize";
import { useCategoryMetadata } from "@/hooks/companies/useCategories";
import Scope3PieLegend from "./Scope3PieLegend";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { YearSelector } from "@/components/layout/YearSelector";

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

  const availableYears =
    historicalData
      ?.map((data) => data.year)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => b - a) || [];

  const latestYear = availableYears[0] ?? new Date().getFullYear();

  const selectedCategories =
    selectedYear === "latest"
      ? emissions.scope3.categories
      : (historicalData?.find((data) => data.year === parseInt(selectedYear))
          ?.categories ?? emissions.scope3.categories);

  const displayYear =
    selectedYear === "latest" ? latestYear : parseInt(selectedYear);

  const selectedScope3Total =
    selectedYear === "latest"
      ? (emissions.scope3?.total ?? 0)
      : (historicalData?.find((data) => data.year === parseInt(selectedYear))
          ?.total ??
        emissions.scope3?.total ??
        0);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-8">
        <Text variant="h3">{t("companies.scope3Data.categories")}</Text>
      </div>
      <Tabs defaultValue="chart" className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList className="bg-black-1 w-full sm:w-auto flex">
            <TabsTrigger value="chart" className="flex-1 text-center">
              {t("companies.scope3Data.visualization")}
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
              includeLatestOption={true}
            />
          )}
        </div>

        <TabsContent value="chart">
          <div className="flex flex-col gap-4 mt-8 lg:flex-row lg:gap-8">
            <div className="w-full lg:w-1/2 lg:h-full">
              <PieChartView
                pieChartData={selectedCategories.map((cat) => ({
                  name: getCategoryName(cat.category),
                  value: cat.total,
                  color: getCategoryColor(cat.category),
                  category: cat.category,
                }))}
                size={size}
                filterable={true}
                filteredCategories={filteredCategories}
                onFilteredCategoriesChange={setFilteredCategories}
                percentageLabel={t("companies.scope3Data.ofTotal")}
              />
            </div>
            <div className={"w-full flex lg:w-1/2 lg:items-center"}>
              <Scope3PieLegend
                payload={selectedCategories.map((cat) => ({
                  name: getCategoryName(cat.category),
                  value: cat.total,
                  total: selectedScope3Total,
                  color: getCategoryColor(cat.category),
                  category: cat.category,
                  isAIGenerated: isAIGenerated(cat),
                }))}
                filteredCategories={filteredCategories}
                onFilteredCategoriesChange={setFilteredCategories}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="data">
          <EmissionsBreakdown
            emissions={{
              scope3: { ...emissions.scope3, categories: selectedCategories },
              calculatedTotalEmissions: emissions.scope3?.total || 0,
            }}
            year={displayYear}
            className="bg-transparent p-0"
            showOnlyScope3={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
