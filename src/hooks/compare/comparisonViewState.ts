import { useComparison } from "@/contexts/ComparisonContext";
import { getComparisonViewSnapshot } from "@/utils/compare/comparisonUtils";

type ComparisonVariant = "company" | "municipality" | "region" | null;

export function useComparisonViewState() {
  const { selectedIds, variant, selectedCount } = useComparison();
  const viewSnapshot = getComparisonViewSnapshot();
  const activeIds =
    selectedCount > 0 && variant
      ? selectedIds
      : (viewSnapshot?.selectedIds ?? []);
  const activeVariant: ComparisonVariant =
    selectedCount > 0 && variant ? variant : (viewSnapshot?.variant ?? null);
  const hasViewData = activeIds.length > 0 && activeVariant !== null;

  return {
    activeIds,
    activeVariant,
    hasViewData,
    loadCompanies: hasViewData && activeVariant === "company",
    loadMunicipalities: hasViewData && activeVariant === "municipality",
    loadRegions: hasViewData && activeVariant === "region",
  };
}

export function getComparisonLoading(options: {
  loadCompanies: boolean;
  loadMunicipalities: boolean;
  loadRegions: boolean;
  companiesLoading: boolean;
  municipalitiesLoading: boolean;
  regionsLoading: boolean;
}): boolean {
  const {
    loadCompanies,
    loadMunicipalities,
    loadRegions,
    companiesLoading,
    municipalitiesLoading,
    regionsLoading,
  } = options;

  if (loadCompanies) return companiesLoading;
  if (loadMunicipalities) return municipalitiesLoading;
  if (loadRegions) return regionsLoading;
  return false;
}
