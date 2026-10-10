import { useCallback, useState, useEffect } from "react";
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

  useEffect(() => {
    const kpi = getKPIFromURL();
    setSelectedKPI((prev) =>
      String(prev.key) === String(kpi.key) ? prev : kpi,
    );
  }, [getKPIFromURL]);

  return {
    selectedKPI,
    setSelectedKPI,
    setKPIInURL,
  };
}
