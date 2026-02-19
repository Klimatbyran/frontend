import { useState, useMemo } from "react";

/**
 * Generic hook for managing hidden/filtered items in charts
 * Can be used for any chart type with filterable items
 */
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

  const addHidden = (item: T) => {
    setHiddenItems((prev) => new Set([...prev, item]));
  };

  const removeHidden = (item: T) => {
    setHiddenItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(item);
      return newSet;
    });
  };

  return {
    hiddenItems,
    setHiddenItems,
    toggleItem,
    isHidden,
    clearAll,
    setHidden,
    addHidden,
    removeHidden,
  };
};

/**
 * Generic hook for managing data view state in multi-view charts
 * Can be used for any chart with multiple view modes
 */
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

  const isAvailableView = (view: T) => availableViews.includes(view);

  return {
    dataView,
    setDataView: setDataViewSafe,
    availableViews,
    isAvailableView,
  };
};

/**
 * Chart display mode - absolute values or revenue intensity (per million SEK turnover)
 */
export type ChartMode = "absolute" | "revenueIntensity";

/**
 * Specialized hook for time-series charts with year range controls
 * Used for historic emissions charts and other temporal data
 */
export const useTimeSeriesChartState = (initialConfig?: {
  chartEndYear?: number;
  shortEndYear?: number;
  longEndYear?: number;
  currentYear?: number;
  initialMode?: ChartMode;
}) => {
  const currentYear = initialConfig?.currentYear || new Date().getFullYear();
  const defaultShortEndYear = initialConfig?.shortEndYear || currentYear + 5;
  const defaultLongEndYear = initialConfig?.longEndYear || 2050;
  const defaultChartEndYear =
    initialConfig?.chartEndYear || defaultShortEndYear;

  const [chartEndYear, setChartEndYear] = useState(defaultChartEndYear);
  const [shortEndYear] = useState(defaultShortEndYear);
  const [longEndYear] = useState(defaultLongEndYear);
  const [chartMode, setChartMode] = useState<ChartMode>(
    initialConfig?.initialMode || "absolute",
  );

  // Computed values
  const isShortView = useMemo(
    () => chartEndYear === shortEndYear,
    [chartEndYear, shortEndYear],
  );

  const isLongView = useMemo(
    () => chartEndYear === longEndYear,
    [chartEndYear, longEndYear],
  );

  return {
    chartEndYear,
    setChartEndYear,
    shortEndYear,
    longEndYear,
    currentYear,
    isShortView,
    isLongView,
    chartMode,
    setChartMode,
  };
};
