import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useComparison } from "@/contexts/ComparisonContext";
import { useLanguage } from "@/components/LanguageProvider";
import { localizedPath } from "@/utils/routing";
import {
  getComparisonReturnTo,
  getExplorePath,
  isComparisonDetailReturnPath,
  resetComparisonAfterView,
} from "@/utils/compare/comparisonUtils";

export function useComparisonBackNavigation() {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { variant, clearSelection } = useComparison();
  const returnTo = getComparisonReturnTo();

  const backLabelKey = useMemo(() => {
    if (returnTo && isComparisonDetailReturnPath(returnTo)) {
      return "explorePage.comparison.backToPrevious" as const;
    }
    return "explorePage.comparison.backToList" as const;
  }, [returnTo]);

  const handleBack = useCallback(() => {
    const storedReturnTo = getComparisonReturnTo();
    resetComparisonAfterView(clearSelection);

    if (storedReturnTo) {
      navigate(storedReturnTo);
      return;
    }

    if (variant) {
      navigate(localizedPath(currentLanguage, getExplorePath(variant)));
      return;
    }

    navigate(localizedPath(currentLanguage, "/explore/municipalities"));
  }, [clearSelection, currentLanguage, navigate, variant]);

  return { handleBack, backLabelKey };
}
