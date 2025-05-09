import { Municipality } from "@/types/municipality";
import { BaseCompany } from "@/types/company";

//importera companies och municipalities
type CombinedData = {
  name: string;
  id: string;
  category: "companies" | "municipalities";
};

const getCombinedData = (
  municipalitiesData: Municipality[],
  companiesData: BaseCompany[],
): CombinedData[] => {
  const municipalities = municipalitiesData.map(
    (municipality): CombinedData => ({
      name: municipality.name,
      id: municipality.name,
      category: "municipalities",
    }),
  );

  const companies = companiesData.map((company): CombinedData => {
    return {
      name: company.name,
      id: company.wikidataId,
      category: "companies",
    };
  });

  const combinedData = [...municipalities, ...companies];

  return combinedData;
};

export default getCombinedData;
