import { useMutation } from "@tanstack/react-query";
import type { paths } from "@/lib/api-types";
import { assessEmissions } from "@/lib/api";


type AssessEmissionsParams = paths["/emissions-assessment/"]["post"]["requestBody"]["content"]["application/json"];
type AssessEmissionsResponse = paths["/emissions-assessment/"]["post"]["responses"][200]["content"]["application/json"];

export function useEmissionsAssessment() {
  const {
    data,
    isPending: isLoadingAssessment,
    error,
    mutate: assessEmissionsMutation,
  } = useMutation<AssessEmissionsResponse, Error, AssessEmissionsParams>({
    mutationFn: assessEmissions,
  });

  return {
    assessment: data?.assessment ?? null,
    isLoadingAssessment,
    assessmentError: error instanceof Error ? error.message : null,
    assessEmissions: assessEmissionsMutation,
  };
} 