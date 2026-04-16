import { useMemo } from "react";
import type { RankedCompany } from "@/types/company";
import type { Municipality } from "@/types/municipality";

export type HeroSearchResult =
  | { type: "company"; id: string; name: string }
  | { type: "municipality"; name: string }
  | { type: "region"; name: string };

interface UsePopularHeroItemsParams {
  companies: RankedCompany[];
  municipalities: Municipality[];
  regions: string[];
}

export function usePopularHeroItems({
  companies,
  municipalities,
  regions,
}: UsePopularHeroItemsParams): HeroSearchResult[] {
  return useMemo<HeroSearchResult[]>(() => {
    const preferredCompanies = ["h&m"];
    const preferredMunicipalities = ["stockholm"];

    const popularCompanies = preferredCompanies
      .map((preferred) =>
        companies.find((company) =>
          company.name.toLowerCase().includes(preferred),
        ),
      )
      .filter((company): company is RankedCompany => company != null)
      .slice(0, 2)
      .map(
        (company): HeroSearchResult => ({
          type: "company",
          id: String(company.wikidataId),
          name: company.name,
        }),
      );

    const popularMunicipalities = preferredMunicipalities
      .map((preferred) =>
        municipalities.find((municipality) =>
          municipality.name.toLowerCase().includes(preferred),
        ),
      )
      .filter(
        (municipality): municipality is Municipality => municipality != null,
      )
      .slice(0, 2)
      .map(
        (municipality): HeroSearchResult => ({
          type: "municipality",
          name: municipality.name,
        }),
      );

    const popularRegion = regions[0]
      ? ([{ type: "region", name: "Skåne län" }] as HeroSearchResult[])
      : [];

    return [...popularCompanies, ...popularMunicipalities, ...popularRegion];
  }, [companies, municipalities, regions]);
}
