import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { useResponsiveChartSize } from "@/hooks/useResponsiveChartSize";
import { useCategoryMetadata } from "@/hooks/companies/useCategories";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { ProgressiveDataGuide } from "@/data-guide/ProgressiveDataGuide";
import PieChartView from "../CompanyPieChartView";
import Scope3PieLegend from "./Scope3PieLegend";
import { EmissionsBreakdown } from "./EmissionsBreakdown";

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
}

export function Scope3Data({ emissions, className }: Scope3DataProps) {
  const { t } = useTranslation();
  const { size } = useResponsiveChartSize();
  const { getCategoryColor, getCategoryName } = useCategoryMetadata();
  const [filteredCategories, setFilteredCategories] = useState<Set<string>>(
    new Set(),
  );
  const { isAIGenerated } = useVerificationStatus();

  if (!emissions?.scope3?.categories?.length) {
    return null;
  }

  const categories = emissions.scope3.categories;
  const scope3Total = emissions.scope3.total ?? 0;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-8">
        <Text variant="h3">{t("companies.scope3Data.categories")}</Text>
      </div>
      <Tabs defaultValue="chart" className="space-y-2">
        <TabsList className="bg-black-1 w-full sm:w-auto flex mb-4">
          <TabsTrigger value="chart" className="flex-1 text-center">
            {t("companies.scope3Data.visualisation")}
          </TabsTrigger>
          <TabsTrigger value="data" className="flex-1 text-center">
            {t("companies.scope3Data.data")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chart">
          <div className="flex flex-col gap-4 mt-8 lg:flex-row lg:gap-8">
            <div className="w-full lg:w-1/2 lg:h-full">
              <PieChartView
                pieChartData={categories.map((cat) => ({
                  name: getCategoryName(cat.category),
                  value: cat.total,
                  color: getCategoryColor(cat.category),
                  category: cat.category,
                  total: scope3Total,
                }))}
                size={size}
                filterable
                filteredCategories={filteredCategories}
                onFilteredCategoriesChange={setFilteredCategories}
                percentageLabel={t("companies.scope3Data.ofTotal")}
              />
            </div>
            <div className={"w-full flex lg:w-1/2 lg:items-center"}>
              <Scope3PieLegend
                payload={categories.map((cat) => ({
                  name: getCategoryName(cat.category),
                  value: cat.total,
                  total: scope3Total,
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
              scope3: { ...emissions.scope3, categories },
              calculatedTotalEmissions: emissions.scope3?.total || 0,
            }}
            year={new Date().getFullYear()}
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
