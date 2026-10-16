import { useCallback, useDeferredValue, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { KPIValue } from "@/types/rankings";

/**
 * Selected measure for municipality and region overviews.
 * The chip updates immediately. Map, lists, and charts keep the previous
 * measure painted until the heavier render is ready.
 */
export function useTerritoryKpiSelection<T extends { name: string }>(
  kpis: KPIValue<T>[],
  defaultKey = "historicalEmissionChangePercent",
) {
  const location = useLocation();
  const navigate = useNavigate();

  const getKPIFromURL = useCallback(() => {
    const kpiKey = new URLSearchParams(location.search).get("kpi");
    return (
      kpis.find((kpi) => String(kpi.key) === kpiKey) ||
      kpis.find((kpi) => String(kpi.key) === defaultKey) ||
      kpis[0]
    );
  }, [location.search, kpis, defaultKey]);

  const setKPIInURL = (kpiKey: string) => {
    const params = new URLSearchParams(location.search);
    params.set("kpi", kpiKey);
    navigate({ search: params.toString() }, { replace: true });
  };

  const [selectedKPI, setSelectedKPI] = useState(getKPIFromURL);
  const displayKPI = useDeferredValue(selectedKPI);

  useEffect(() => {
    const kpi = getKPIFromURL();
    setSelectedKPI((current) =>
      String(current.key) === String(kpi.key) ? current : kpi,
    );
  }, [getKPIFromURL]);

  return { selectedKPI, displayKPI, setSelectedKPI, setKPIInURL };
}
