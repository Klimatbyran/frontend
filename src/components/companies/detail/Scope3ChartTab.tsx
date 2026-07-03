import { useTranslation } from "react-i18next";
import PieChartView from "../CompanyPieChartView";
import Scope3PieLegend from "./Scope3PieLegend";

interface Scope3Category {
  category: number;
  total: number;
  unit: string;
  metadata?: {
    verifiedBy?: { name: string } | null;
    user?: { name?: string } | null;
  };
}

interface Scope3ChartTabProps {
  selectedCategories: Scope3Category[];
  selectedScope3Total: number;
  size: number;
  filteredCategories: Set<string>;
  onFilteredCategoriesChange: (categories: Set<string>) => void;
  getCategoryName: (categoryId: number) => string;
  getCategoryColor: (categoryId: number) => string;
  isAIGenerated: (category: Scope3Category) => boolean;
}

export function Scope3ChartTab({
  selectedCategories,
  selectedScope3Total,
  size,
  filteredCategories,
  onFilteredCategoriesChange,
  getCategoryName,
  getCategoryColor,
  isAIGenerated,
}: Scope3ChartTabProps) {
  const { t } = useTranslation();

  const legendPayload = selectedCategories.map((category) => ({
    name: getCategoryName(category.category),
    value: category.total,
    total: selectedScope3Total,
    color: getCategoryColor(category.category),
    category: category.category,
    isAIGenerated: isAIGenerated(category),
  }));

  const pieChartData = selectedCategories.map((category) => ({
    name: getCategoryName(category.category),
    value: category.total,
    color: getCategoryColor(category.category),
    category: category.category,
    total: selectedScope3Total,
  }));

  return (
    <div className="flex flex-col gap-4 mt-8 lg:flex-row lg:gap-8">
      <div className="w-full lg:w-1/2 lg:h-full">
        <PieChartView
          pieChartData={pieChartData}
          size={size}
          filterable
          filteredCategories={filteredCategories}
          onFilteredCategoriesChange={onFilteredCategoriesChange}
          percentageLabel={t("companies.scope3Data.ofTotal")}
        />
      </div>
      <div className="w-full flex lg:w-1/2 lg:items-center">
        <Scope3PieLegend
          payload={legendPayload}
          filteredCategories={filteredCategories}
          onFilteredCategoriesChange={onFilteredCategoriesChange}
        />
      </div>
    </div>
  );
}
