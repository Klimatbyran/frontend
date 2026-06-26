import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { RankedCompany } from "@/types/company";
import { useTrendAnalysis } from "@/hooks/companies/useTrendAnalysis";
import TrendCards from "./TrendCards";
import { TrendDistributionChart } from "./TrendDistributionChart";

interface EmissionsTrendAnalysisProps {
  companies: RankedCompany[];
  selectedSectors: string[];
}

const EmissionsTrendAnalysis: React.FC<EmissionsTrendAnalysisProps> = ({
  companies,
  selectedSectors,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    "decreasing" | "increasing" | "noComparable" | null
  >(null);
  const trends = useTrendAnalysis(companies, selectedSectors);
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <TrendDistributionChart
        trends={trends}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {selectedCategory && (
        <TrendCards
          trends={trends}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      )}

      {!selectedCategory && (
        <p className="text-sm text-grey text-center">
          {t("sectorsOverviewPage.trendHint")}
        </p>
      )}
    </div>
  );
};

export default EmissionsTrendAnalysis;
