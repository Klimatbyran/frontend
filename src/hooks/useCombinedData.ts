import { useMemo } from "react";
import { useCompanies } from "./companies/useCompanies";
import { useMunicipalities } from "./useMunicipalities";

export type CombinedData = {
  name: string;
  id: string;
  category: "companies" | "municipalities";
};

export const useCombinedData = () => {
  const {
    municipalities,
    loading: isLoadingMunicipalities,
    error: municipalitiesError,
  } = useMunicipalities();
  const {
    companies,
    loading: isLoadingCompanies,
    error: companiesError,
  } = useCompanies();

  const hasErrors = municipalitiesError || companiesError;
  const isLoading = isLoadingCompanies || isLoadingMunicipalities;

  const combinedData = useMemo(() => {
    if (hasErrors) {
      return {
        loading: false,
        error: new Error("Error fetching municipalities or companies"),
        data: [],
      };
    }

    if (isLoading) {
      return {
        loading: true,
        data: [],
      };
    }

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

    return {
      loading: false,
      data: [...mappedMunicipalities, ...mappedCompanies],
    };
  }, [municipalities, companies, isLoading, hasErrors]);

  return combinedData;
};

export type CombinedDataResult = ReturnType<typeof useCombinedData>;
