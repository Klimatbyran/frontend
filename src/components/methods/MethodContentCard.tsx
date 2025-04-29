import { ParisAgreementContent } from "./content/ParisAgreementContent";
import { SourcesContent } from "./content/SourcesContent";
import { CalculationsContent } from "./content/CalculationsContent";
import { CompanyDataCollectionContent } from "./content/CompanyDataCollectionContent";
import { CO2BudgetsContent } from "./content/CO2BudgetsContent";
import { EmissionTypesContent } from "./content/EmissionTypesContent";

interface MethodContentCardProps {
  method: string;
}

export function MethodContentCard({ method }: MethodContentCardProps) {
  const renderContent = () => {
    switch (method) {
      case "parisAgreement":
        return <ParisAgreementContent />;
      case "sources":
        return <SourcesContent />;
      case "calculations":
        return <CalculationsContent />;
      case "companyDataCollection":
        return <CompanyDataCollectionContent />;
      case "co2Budgets":
        return <CO2BudgetsContent />;
      case "emissionTypes":
        return <EmissionTypesContent />;
      default:
        return null;
    }
  };

  return <div className="bg-black-2 rounded-2xl p-8">{renderContent()}</div>;
}
