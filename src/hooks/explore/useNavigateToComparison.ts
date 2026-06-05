import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/LanguageProvider";
import { localizedPath } from "@/utils/routing";
import {
  buildComparisonReturnTo,
  isCompareRoute,
  setComparisonReturnTo,
} from "@/utils/explore/comparisonUtils";

export function useNavigateToComparison() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentLanguage } = useLanguage();

  return useCallback(() => {
    if (!isCompareRoute(location.pathname)) {
      setComparisonReturnTo(buildComparisonReturnTo(location));
    }

    navigate(localizedPath(currentLanguage, "/explore/compare"));
  }, [currentLanguage, location.hash, location.pathname, location.search, navigate]);
}
