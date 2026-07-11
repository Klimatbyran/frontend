import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { HeroSearchResult } from "@/types/landing";
import {
  HERO_SEARCH_MAX_RESULTS,
  HERO_SEARCH_MAX_RESULTS_PER_TYPE,
  HERO_SEARCH_DEBOUNCE_MS,
} from "@/lib/constants/landingPage";
import { getGlobalSearch, GlobalSearchApiResponse } from "@/lib/api";
import { useLanguage } from "@/components/LanguageProvider";
import { getCompanyUrlSegment } from "@/utils/companyRouting";

function mapGlobalSearchResult(
  item: GlobalSearchApiResponse[number],
): HeroSearchResult | null {
  if (item.type === "company") {
    if (!item.id) {
      return null;
    }

    return {
      type: "company",
      id: getCompanyUrlSegment({
        id: String(item.id),
        wikidataId: item.wikidataId,
      }),
      name: item.name,
    };
  }

  if (item.type === "municipality") {
    return {
      type: "municipality",
      name: item.name,
    };
  }

  if (item.type === "region") {
    return {
      type: "region",
      name: item.name,
    };
  }
  return {
    type: "nation",
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
    nation: 0,
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

export type HeroGlobalSearchOptions = {
  /** When true, return all API hits instead of the landing-page diversity cap. */
  skipDiversityCap?: boolean;
};

export function useHeroGlobalSearch(
  searchQuery: string,
  options?: HeroGlobalSearchOptions,
) {
  const { currentLanguage } = useLanguage();
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery.trim());
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    setIsDebouncing(true);
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
      setIsDebouncing(false);
    }, HERO_SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(handler);
      setIsDebouncing(false);
    };
  }, [searchQuery]);

  const { data = [], isFetching: isSearching } = useQuery({
    queryKey: [
      "globalSearch",
      debouncedQuery,
      options?.skipDiversityCap ?? false,
    ],
    queryFn: () =>
      debouncedQuery
        ? getGlobalSearch(debouncedQuery, currentLanguage)
        : Promise.resolve([]),
    enabled: !!debouncedQuery,
    staleTime: 60 * 1000,
    select: (responseData: GlobalSearchApiResponse) => {
      const mapped = responseData
        .map(mapGlobalSearchResult)
        .filter((result): result is HeroSearchResult => result != null);

      if (options?.skipDiversityCap) {
        return mapped;
      }

      return applyDiversityCap(
        mapped,
        HERO_SEARCH_MAX_RESULTS,
        HERO_SEARCH_MAX_RESULTS_PER_TYPE,
      );
    },
  });

  return { searchResults: data, isSearching, isDebouncing };
}
