import { useTranslation } from "react-i18next";
import { Scope3Data } from "./Scope3Data";
import type { Emissions, Scope3HistoricalData } from "@/types/company";
import { useDataGuide } from "@/data-guide/useDataGuide";

interface CompanyScope3Props {
  emissions: Emissions;
  historicalData?: Scope3HistoricalData[];
}

export function CompanyScope3({
  emissions,
  historicalData,
}: CompanyScope3Props) {
  const { t } = useTranslation();

  useDataGuide(["scopes"]);

  if (!emissions?.scope3?.categories?.length) {
    return null;
  }

  // Transform emissions to match the expected format for Scope3Data
  const transformedEmissions = {
    ...emissions,
    scope3: emissions.scope3
      ? {
          total: emissions.scope3.calculatedTotalEmissions,
          unit:
            emissions.scope3.statedTotalEmissions?.unit || t("emissionsUnit"),
          categories: emissions.scope3.categories,
        }
      : null,
  };

  return (
    <Scope3Data
      emissions={transformedEmissions}
      historicalData={historicalData}
    />
  );
}
