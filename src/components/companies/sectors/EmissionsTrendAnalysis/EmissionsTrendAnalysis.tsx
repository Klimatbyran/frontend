import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { RankedCompany } from "@/types/company";
import { useTrendAnalysis } from "@/hooks/companies/useTrendAnalysis";
import { useScreenSize } from "@/hooks/useScreenSize";
import TrendCards from "./TrendCards";

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
  const isMobile = useScreenSize();
  const { t } = useTranslation();

  return (
    <div className="mt-12 space-y-6">
      <div className={`flex ${isMobile ? "flex-col" : "items-center"} gap-2`}>
        <h2 className="text-xl font-light text-white">
          {t("companiesPage.sectorGraphs.emissionsTrendAnalysis")}
        </h2>
        <span className="text-sm text-grey">
          {t("companiesPage.sectorGraphs.fromBaseYear")}
        </span>
      </div>

      <TrendCards
        trends={trends}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />
    </div>
  );
};

export default EmissionsTrendAnalysis;
