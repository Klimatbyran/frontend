import { useMemo } from "react";
import { useCompanies } from "./companies/useCompanies";
import { useMunicipalities } from "./useMunicipalities";

export type CombinedData = {
  name: string;
  id: string;
  category: "companies" | "municipalities";
};

const useCombinedData = (): CombinedData[] => {
  const { municipalities, loading: isLoadingMunicipalities } =
    useMunicipalities();
  const { companies, loading: isLoadingCompanies } = useCompanies();

  const combinedData: CombinedData[] = useMemo(() => {
    if (!isLoadingMunicipalities && !isLoadingCompanies) {
      const mappedMunicipalities: CombinedData[] = municipalities?.map(
        (municipality): CombinedData => ({
          name: municipality.name,
          id: municipality.name,
          category: "municipalities",
        }),
      );

      const mappedCompanies: CombinedData[] = companies?.map(
        (company): CombinedData => {
          return {
            name: company.name,
            id: company.wikidataId,
            category: "companies",
          };
        },
      );

      return [...mappedMunicipalities, ...mappedCompanies];
    } else {
      return [];
    }
  }, [municipalities, companies, isLoadingMunicipalities, isLoadingCompanies]);

  return combinedData;
};

export default useCombinedData;
