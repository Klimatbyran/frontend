import type { ComponentType } from "react";
import { RelatableNumbersContent } from "@/components/methods/content/relatableNumbers";
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
import { NationDataOverviewContent } from "./content/NationDataOverview";
import { NationEmissionsLayersContent } from "./content/NationEmissionsLayersContent";
import { ParisAlignmentMethodContent } from "./content/OnTrackForParisContent";
import { TrendlineContent } from "./content/TrendLineMethodContent";
import { InterpretingOnTrackContent } from "./content/InprepretingOnTrackContent";

const METHOD_CONTENT_COMPONENTS: Record<string, ComponentType> = {
  sources: SourcesContent,
  parisAgreement: ParisAgreementContent,
  carbonLaw: CarbonLawContent,
  trendline: TrendlineContent,
  parisAlignment: ParisAlignmentMethodContent,
  interpretingOnTrack: InterpretingOnTrackContent,
  emissionTypes: EmissionTypesContent,
  municipalityAndRegionDataOverview: MunicipalityAndRegionDataOverviewContent,
  municipalityKPIs: MunicipalityKPIsContent,
  companyDataOverview: CompanyDataOverviewContent,
  emissionCategories: EmissionsAndCategoriesContent,
  historicalData: HistoricalDataContent,
  calculations: CalculationsContent,
  companyDataCollection: DataCollectionProcessContent,
  relatableNumbers: RelatableNumbersContent,
  nationDataOverview: NationDataOverviewContent,
  nationEmissionsLayers: NationEmissionsLayersContent,
};

export function getMethodContentComponent(method: string) {
  return METHOD_CONTENT_COMPONENTS[method] ?? null;
}
