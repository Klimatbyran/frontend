import { useEffect, useState } from "react";
import type { HeroSearchResult } from "@/hooks/usePopularHeroItems";
import {
  HERO_SEARCH_DEBOUNCE_MS,
  HERO_SEARCH_MAX_RESULTS,
  HERO_SEARCH_MAX_RESULTS_PER_TYPE,
} from "@/lib/constants/landingPage";

type GlobalSearchApiItem = {
  name: string;
  wikidataId?: string;
  type: "company" | "municipality" | "region";
};

function mapGlobalSearchResult(
  item: GlobalSearchApiItem,
): HeroSearchResult | null {
  if (item.type === "company") {
    if (!item.wikidataId) {
      return null;
    }

    return {
      type: "company",
      id: String(item.wikidataId),
      name: item.name,
    };
  }

  if (item.type === "municipality") {
    return {
      type: "municipality",
      name: item.name,
    };
  }

  return {
    type: "region",
    name: item.name,
  };
}

function applyDiversityCap(
  orderedResults: HeroSearchResult[],
  maxTotal = 8,
  maxPerType = 4,
): HeroSearchResult[] {
  const counts: Record<HeroSearchResult["type"], number> = {
    company: 0,
    municipality: 0,
    region: 0,
  };

  const cappedOut: HeroSearchResult[] = [];
  const diversified: HeroSearchResult[] = [];

  for (const result of orderedResults) {
    if (diversified.length >= maxTotal) {
      break;
    }

    if (counts[result.type] < maxPerType) {
      diversified.push(result);
      counts[result.type] += 1;
      continue;
    }

    cappedOut.push(result);
  }

  if (diversified.length < maxTotal) {
    for (const result of cappedOut) {
      if (diversified.length >= maxTotal) {
        break;
      }

      diversified.push(result);
    }
  }

  return diversified;
}

export function useHeroGlobalSearch(searchQuery: string) {
  const [searchResults, setSearchResults] = useState<HeroSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    const abortController = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch("/api/global-search/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: query }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Global search failed with status ${response.status}`,
          );
        }

        const responseData: GlobalSearchApiItem[] = await response.json();
        const mappedResults = applyDiversityCap(
          responseData
            .map(mapGlobalSearchResult)
            .filter((result): result is HeroSearchResult => result != null),
          HERO_SEARCH_MAX_RESULTS,
          HERO_SEARCH_MAX_RESULTS_PER_TYPE,
        );

        setSearchResults(mappedResults);
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Error fetching hero search results:", error);
          setSearchResults([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, HERO_SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      abortController.abort();
    };
  }, [searchQuery]);

  return { searchResults, isSearching };
}
