import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useComparison } from "@/contexts/ComparisonContext";

function isCompareRoute(pathname: string): boolean {
  return pathname.includes("/explore/compare");
}

/**
 * Clears comparison selection when navigating away from the dedicated compare page.
 * Uses route changes instead of component unmount to stay compatible with StrictMode.
 */
export function useComparisonRouteEffects() {
  const location = useLocation();
  const { clearSelection } = useComparison();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    const previousPath = prevPathRef.current;
    const currentPath = location.pathname;

    if (isCompareRoute(previousPath) && !isCompareRoute(currentPath)) {
      clearSelection();
    }

    prevPathRef.current = currentPath;
  }, [clearSelection, location.pathname]);
}
