import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  lensFromSearch,
  type StoryLens,
} from "@/utils/territories/territoryOverviewStory";

export function useTerritoryStoryLens() {
  const location = useLocation();
  const navigate = useNavigate();
  const lens = lensFromSearch(location.search);

  const setLens = useCallback(
    (next: StoryLens) => {
      const params = new URLSearchParams(location.search);
      params.delete("kpi");
      params.delete("view");
      if (next === "pace") {
        params.set("lens", "pace");
      } else {
        params.delete("lens");
      }
      const search = params.toString();
      navigate({ search: search ? `?${search}` : "" }, { replace: true });
    },
    [location.search, navigate],
  );

  return { lens, setLens };
}
