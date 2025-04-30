import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmissionsBreakdown } from "./EmissionsBreakdown";
import { Scope3Chart } from "./Scope3Chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";

interface Scope3DataProps {
  emissions: {
    scope1And2?: { total: number; unit: string } | null;
    scope1?: { total: number; unit: string } | null;
    scope2?: {
      mb?: number | null;
      lb?: number | null;
      unknown?: number | null;
      unit: string;
      calculatedTotalEmissions: number;
    } | null;
    scope3?: {
      total: number;
      unit: string;
      categories?: Array<{
        category: number;
        total: number;
        unit: string;
      }>;
    } | null;
    biogenicEmissions?: { total: number; unit: string } | null;
  } | null;
  className?: string;
  isRealEstate?: boolean;
  historicalData?: Array<{
    year: number;
    categories: Array<{
      category: number;
      total: number;
      unit: string;
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

  if (!emissions?.scope3?.categories?.length) {
    return null;
  }

  // Get available years from historical data
  const availableYears = historicalData
    ? [...new Set(historicalData.map((data) => data.year))].sort(
        (a, b) => b - a,
      )
    : [];

  // Get the latest year from historical data or use current year as fallback
  const latestYear =
    availableYears.length > 0 ? availableYears[0] : new Date().getFullYear();

  // Get categories for selected year
  const selectedCategories =
    selectedYear === "latest"
      ? emissions.scope3.categories
      : historicalData?.find((data) => data.year === parseInt(selectedYear))
          ?.categories || emissions.scope3.categories;

  // Create emissions object for selected year
  const selectedEmissions = {
    ...emissions,
    scope3: {
      ...emissions.scope3,
      categories: selectedCategories,
    },
  };

  // Determine the year to display
  const displayYear =
    selectedYear === "latest" ? latestYear : parseInt(selectedYear);

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

          {historicalData && historicalData.length > 0 && (
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-[180px] bg-black-1">
                <SelectValue
                  placeholder={t("companies.scope3Data.selectYear")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">
                  {t("companies.scope3Data.latestYear")}
                </SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <TabsContent value="chart">
          <Scope3Chart
            categories={selectedCategories}
            className="bg-transparent p-0"
          />
        </TabsContent>

        <TabsContent value="data">
          <EmissionsBreakdown
            emissions={{
              scope3: selectedEmissions.scope3,
              calculatedTotalEmissions: selectedEmissions.scope3?.total || 0,
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
