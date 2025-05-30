import {
  createValidationClaim,
  deleteValidationClaim,
  getValidationClaims,
} from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

const cacheKey = "validationClaims";
export function useValidationClaims() {
  const queryClient = useQueryClient();

  const {
    data: claims = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: [cacheKey],
    queryFn: getValidationClaims,
    refetchInterval: 10000,
  });

  const claimValidation = useCallback(
    async (wikidataId: string, steal = false) => {
      await createValidationClaim(wikidataId, steal);
      queryClient.invalidateQueries({ queryKey: [cacheKey] });
    },
    [queryClient],
  );

  const unclaimValidation = useCallback(
    async (wikidataId: string) => {
      await deleteValidationClaim(wikidataId);
      queryClient.invalidateQueries({ queryKey: [cacheKey] });
    },
    [queryClient],
  );

  return {
    claims,
    isLoading,
    error,
    claimValidation,
    unclaimValidation,
  };
}
