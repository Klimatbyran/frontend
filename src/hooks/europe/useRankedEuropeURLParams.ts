import { useCallback, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { KPIValue } from "@/types/rankings";
import { EuropeanCountry } from "@/types/europe";

export function useRankedEuropeURLParams(
  europeanKPIs: KPIValue<EuropeanCountry>[],
) {
  const location = useLocation();
  const navigate = useNavigate();

  const getKPIFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const kpiKey = params.get("kpi");

    return (
      europeanKPIs.find((kpi) => String(kpi.key) === kpiKey) || europeanKPIs[0]
    );
  }, [location.search, europeanKPIs]);

  const setKPIInURL = (kpiKey: string) => {
    const params = new URLSearchParams(location.search);
    params.set("kpi", kpiKey);
    navigate({ search: params.toString() }, { replace: true });
  };

  const getViewModeFromURL = useCallback((): "map" | "list" => {
    const params = new URLSearchParams(location.search);
    return params.get("view") === "list" ? "list" : "map";
  }, [location.search]);

  const setViewModeInURL = (mode: "map" | "list") => {
    const params = new URLSearchParams(location.search);
    params.set("view", mode);
    navigate({ search: params.toString() }, { replace: true });
  };

  const [selectedKPI, setSelectedKPI] = useState(getKPIFromURL());
  const viewMode = getViewModeFromURL();

  useEffect(() => {
    const kpiFromUrl = getKPIFromURL();
    if (kpiFromUrl && kpiFromUrl.key !== selectedKPI.key) {
      setSelectedKPI(kpiFromUrl);
    }
  }, [getKPIFromURL, selectedKPI.key]);

  return {
    selectedKPI,
    setSelectedKPI,
    viewMode,
    setKPIInURL,
    setViewModeInURL,
  };
}
