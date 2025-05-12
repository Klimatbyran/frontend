import { useEffect, useState } from "react";
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
  const [combinedData, setCombinedData] = useState([]);
  /*   const [simplifiedMunicipalities, setSimplifiedMunicipalities] = useState([]);
  const [simplifiedCompanies, setSimplifiedCompanies] = useState([]); */

  useEffect(() => {
    if (!isLoadingMunicipalities && !isLoadingCompanies) {
      const mappedMunicipalities = municipalities.map(
        (municipality): CombinedData => ({
          name: municipality.name,
          id: municipality.name,
          category: "municipalities",
        }),
      );

      const mappedCompanies = companies.map((company): CombinedData => {
        return {
          name: company.name,
          id: company.wikidataId,
          category: "companies",
        };
      });

      setCombinedData([...mappedMunicipalities, ...mappedCompanies]);
    }
  }, [municipalities, companies, isLoadingCompanies, isLoadingMunicipalities]);

  return combinedData;
};

export default useCombinedData;
