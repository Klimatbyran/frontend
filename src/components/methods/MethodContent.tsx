import { useTranslation } from "react-i18next";
import { useState, useEffect, forwardRef } from "react";
import { RelatableNumbersContent } from "@/components/methods/content/relatableNumbers";
import { getMethodById } from "@/lib/methods/methodologyData";
import { SourcesContent } from "./content/SourcesContent";
import { CompanyDataOverviewContent } from "./content/CompanyDataOverview";
import { DataCollectionProcessContent } from "./content/DataCollectionProcess";
import { EmissionsAndCategoriesContent } from "./content/EmissionsCategories";
import { HistoricalDataContent } from "./content/HistoricalData";
import { ParisAgreementContent } from "./content/ParisAgreementContent";
import { EmissionTypesContent } from "./content/EmissionTypesContent";
import { CalculationsContent } from "./content/CalculationsContent";
import { CarbonLawContent } from "./content/CarbonLaw";
import { MunicipalityAndRegionDataOverviewContent } from "./content/MunicipalityAndRegionDataOverview";
import { MunicipalityKPIsContent } from "./content/MunicipalityKPIsContent";
import { ParisAlignmentMethodContent } from "./content/OnTrackForParisContent";
import { TrendlineContent } from "./content/TrendLineMethodContent";
import { InterpretingOnTrackContent } from "./content/InprepretingOnTrackContent";

interface MethodologyContentProps {
  method: string;
}

export const MethodologyContent = forwardRef<
  HTMLDivElement,
  MethodologyContentProps
>(({ method }, ref) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const methodData = getMethodById(method);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [method]);

  if (!methodData) {
    return (
      <div className="card-dark">
        <p className="text-grey">{t("methodsPage.methodNotFound")}</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (method) {
      case "sources":
        return <SourcesContent />;

      case "parisAgreement":
        return <ParisAgreementContent />;
      case "carbonLaw":
        return <CarbonLawContent />;
      case "trendline":
        return <TrendlineContent />;
      case "parisAlignment":
        return <ParisAlignmentMethodContent />;
      case "interpretingOnTrack":
        return <InterpretingOnTrackContent />;
      case "emissionTypes":
        return <EmissionTypesContent />;
      case "dataOverview":
        return <MunicipalityAndRegionDataOverviewContent />;
      case "KPIs":
        return <MunicipalityKPIsContent />;
      case "companyDataOverview":
        return <CompanyDataOverviewContent />;
      case "emissionCategories":
        return <EmissionsAndCategoriesContent />;
      case "historicalData":
        return <HistoricalDataContent />;
      case "calculations":
        return <CalculationsContent />;
      case "companyDataCollection":
        return <DataCollectionProcessContent />;
      case "relatableNumbers":
        return <RelatableNumbersContent />;
    }
  };

  return (
    <div
      ref={ref}
      id="methodology-content"
      className={`transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
    >
      <div className="bg-black-2 rounded-level-2 p-4 pt-6 sm:p-8 md:p-16">
        <div className="border-b border-black-1 pb-6 mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            {t(`methodsPage.${methodData.category}.${method}.title`)}
          </h1>
          <p className="text-grey">
            {t(`methodsPage.${methodData.category}.${method}.description`)}
          </p>
        </div>
        <div className="prose prose-invert max-w-none">{renderContent()}</div>
      </div>
    </div>
  );
});
