import { useQuery } from "@tanstack/react-query";
import { getCompanyDetails } from "@/lib/api";
import type { paths } from "@/lib/api-types";

type CompanyDetails = NonNullable<
  paths["/companies/{wikidataId}"]["get"]["responses"][200]["content"]["application/json"]
>;

export function useCompanyDetails(id: string) {
  const {
    data: company,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["company", id],
    queryFn: () => getCompanyDetails(id),
    enabled: !!id,
  });

  return {
    company,
    loading: isLoading,
    error,
    refetch,
  };
}
