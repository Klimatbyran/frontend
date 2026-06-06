import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/LanguageProvider";
import { useComparison } from "@/contexts/ComparisonContext";
import { localizedPath } from "@/utils/routing";
import {
  buildComparisonReturnTo,
  COMPARISON_MIN,
  isCompareRoute,
  setComparisonReturnTo,
  setComparisonViewSnapshot,
} from "@/utils/explore/comparisonUtils";

export function useNavigateToComparison() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentLanguage } = useLanguage();
  const { selectedIds, variant, clearSelection } = useComparison();

  return useCallback(() => {
    if (variant && selectedIds.length >= COMPARISON_MIN) {
      setComparisonViewSnapshot({ selectedIds, variant });
    }

    if (!isCompareRoute(location.pathname)) {
      setComparisonReturnTo(buildComparisonReturnTo(location));
    }

    clearSelection();
    navigate(localizedPath(currentLanguage, "/explore/compare"));
  }, [
    clearSelection,
    currentLanguage,
    location.hash,
    location.pathname,
    location.search,
    navigate,
    selectedIds,
    variant,
  ]);
}
