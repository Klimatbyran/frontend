import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useComparison } from "@/contexts/ComparisonContext";
import {
  clearComparisonReturnTo,
  isCompareRoute,
} from "@/utils/explore/comparisonUtils";

/** Clears comparison state when leaving the dedicated compare page. */
export function useComparisonRouteEffects() {
  const location = useLocation();
  const { clearSelection } = useComparison();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const previousPath = prevPathRef.current;
    const currentPath = location.pathname;

    if (isCompareRoute(previousPath) && !isCompareRoute(currentPath)) {
      clearComparisonReturnTo();
      clearSelection();
    }

    prevPathRef.current = currentPath;
  }, [clearSelection, location.pathname]);
}
