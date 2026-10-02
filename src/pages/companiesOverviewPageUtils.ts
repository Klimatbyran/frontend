import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/** Keeps the overview's industry filter in the URL so views stay shareable. */
export function useCompaniesOverviewUrlState(availableSectors: string[]) {
  const location = useLocation();
  const navigate = useNavigate();

  const getSectorFromURL = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const sectorParam = params.get("sector");
    if (sectorParam && availableSectors.includes(sectorParam)) {
      return sectorParam;
    }
    return null;
  }, [location.search, availableSectors]);

  const setSectorInURL = useCallback(
    (sector: string | null) => {
      const params = new URLSearchParams(location.search);
      if (sector) params.set("sector", sector);
      else params.delete("sector");
      navigate({ search: params.toString() }, { replace: true });
    },
    [location.search, navigate],
  );

  return { getSectorFromURL, setSectorInURL };
}
