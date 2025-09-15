import { useState, useMemo } from "react";

// Common chart state management hook
export const useChartState = (initialConfig?: {
  chartEndYear?: number;
  shortEndYear?: number;
  longEndYear?: number;
  currentYear?: number;
}) => {
  const currentYear = initialConfig?.currentYear || new Date().getFullYear();
  const defaultShortEndYear = initialConfig?.shortEndYear || currentYear + 5;
  const defaultLongEndYear = initialConfig?.longEndYear || 2050;
  const defaultChartEndYear =
    initialConfig?.chartEndYear || defaultShortEndYear;

  const [chartEndYear, setChartEndYear] = useState(defaultChartEndYear);
  const [shortEndYear] = useState(defaultShortEndYear);
  const [longEndYear] = useState(defaultLongEndYear);

  // Computed values
  const isShortView = useMemo(
    () => chartEndYear === shortEndYear,
    [chartEndYear, shortEndYear],
  );

  return {
    chartEndYear,
    setChartEndYear,
    shortEndYear,
    longEndYear,
    currentYear,
    isShortView,
  };
};

// Hook for managing hidden items (scopes, categories, sectors)
export const useHiddenItems = <T extends string | number>(
  initialHidden: T[] = [],
) => {
  const [hiddenItems, setHiddenItems] = useState<Set<T>>(
    new Set(initialHidden),
  );

  const toggleItem = (item: T) => {
    setHiddenItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else {
        newSet.add(item);
      }
      return newSet;
    });
  };

  const isHidden = (item: T) => hiddenItems.has(item);

  const clearAll = () => setHiddenItems(new Set());

  const setHidden = (items: T[]) => setHiddenItems(new Set(items));

  return {
    hiddenItems,
    setHiddenItems,
    toggleItem,
    isHidden,
    clearAll,
    setHidden,
  };
};

// Hook for managing data view state
export const useDataView = <T extends string>(
  initialView: T,
  availableViews: T[],
) => {
  const [dataView, setDataView] = useState<T>(initialView);

  const setDataViewSafe = (view: T) => {
    if (availableViews.includes(view)) {
      setDataView(view);
    }
  };

  return {
    dataView,
    setDataView: setDataViewSafe,
    availableViews,
  };
};

// Combined hook for complete chart state management
export const useChartStateManager = <T extends string | number>(config?: {
  chartEndYear?: number;
  shortEndYear?: number;
  longEndYear?: number;
  currentYear?: number;
  initialDataView?: string;
  availableDataViews?: string[];
  initialHiddenItems?: T[];
}) => {
  const chartState = useChartState(config);
  const hiddenItems = useHiddenItems(config?.initialHiddenItems);
  const dataView = useDataView(
    config?.initialDataView || "overview",
    config?.availableDataViews || ["overview"],
  );

  return {
    ...chartState,
    ...hiddenItems,
    ...dataView,
  };
};
