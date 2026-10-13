import { useCallback, useState, useEffect, useDeferredValue } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { KPIValue } from "@/types/rankings";
import { Region } from "@/types/region";

export function useRankedRegionsURLParams(regionalKPIs: KPIValue<Region>[]) {
  const location = useLocation();
  const navigate = useNavigate();

  const getKPIFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const kpiKey = params.get("kpi");

    return (
      regionalKPIs.find((kpi) => String(kpi.key) === kpiKey) ||
      regionalKPIs.find(
        (kpi) => String(kpi.key) === "historicalEmissionChangePercent",
      ) ||
      regionalKPIs[0]
    );
  }, [location.search, regionalKPIs]);

  const setKPIInURL = (kpiKey: string) => {
    const params = new URLSearchParams(location.search);
    params.set("kpi", kpiKey);
    navigate({ search: params.toString() }, { replace: true });
  };

  const [selectedKPI, setSelectedKPI] = useState(getKPIFromURL());
  // Chips update immediately; map/lists/charts keep the previous KPI painted
  // until the heavy re-render is ready (avoids empty flashes on stage/prod).
  const displayKPI = useDeferredValue(selectedKPI);

  useEffect(() => {
    const kpi = getKPIFromURL();
    setSelectedKPI((prev) =>
      String(prev.key) === String(kpi.key) ? prev : kpi,
    );
  }, [getKPIFromURL]);

  return {
    selectedKPI,
    displayKPI,
    setSelectedKPI,
    setKPIInURL,
  };
}
