import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { FilterGroup } from "@/components/explore/FilterPopover";
import {
  COMPANY_COUNTRY_TAG_SLUGS,
  isCompanyCountryTagSlug,
  type CompanyCountryTagSlug,
} from "@/lib/constants/companyCountryTags";

type CompanyWithTags = {
  tags?: string[] | null;
};

export function useCompanyCountryNames() {
  const { t } = useTranslation();

  return useMemo(
    () =>
      Object.fromEntries(
        COMPANY_COUNTRY_TAG_SLUGS.map((slug) => [
          slug,
          t(`companyCountries.${slug}`, slug),
        ]),
      ) as Record<CompanyCountryTagSlug, string>,
    [t],
  );
}

export function parseCountriesFromURL(
  searchParams: URLSearchParams,
): CompanyCountryTagSlug[] {
  const raw = searchParams.get("countries");
  if (!raw) return [];

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(isCompanyCountryTagSlug);
}

export function getAvailableCountryOptions(
  companies: CompanyWithTags[],
): CompanyCountryTagSlug[] {
  const present = new Set<string>();
  for (const company of companies) {
    for (const tag of company.tags ?? []) {
      if (isCompanyCountryTagSlug(tag)) {
        present.add(tag);
      }
    }
  }

  return COMPANY_COUNTRY_TAG_SLUGS.filter((slug) => present.has(slug));
}

export function companyMatchesCountries(
  company: CompanyWithTags,
  selectedCountries: CompanyCountryTagSlug[],
): boolean {
  if (selectedCountries.length === 0) return true;

  const tags = company.tags ?? [];
  return selectedCountries.some((country) => tags.includes(country));
}

export function toggleCountrySelection(
  selectedCountries: CompanyCountryTagSlug[],
  value: string,
): CompanyCountryTagSlug[] {
  if (value === "all") return [];

  if (!isCompanyCountryTagSlug(value)) return selectedCountries;

  if (selectedCountries.includes(value)) {
    return selectedCountries.filter((country) => country !== value);
  }

  return [...selectedCountries, value];
}

export function buildCountryFilterGroup({
  t,
  countryNames,
  availableCountries,
  selectedCountries,
  onSelect,
}: {
  t: TFunction;
  countryNames: Record<CompanyCountryTagSlug, string>;
  availableCountries: CompanyCountryTagSlug[];
  selectedCountries: CompanyCountryTagSlug[];
  onSelect: (value: string) => void;
}): FilterGroup | null {
  if (availableCountries.length === 0) return null;

  return {
    heading: t("explorePage.companies.filteringOptions.country"),
    options: [
      {
        value: "all",
        label: t("explorePage.companies.filteringOptions.allCountries"),
      },
      ...availableCountries.map((slug) => ({
        value: slug,
        label: countryNames[slug],
      })),
    ],
    selectedValues:
      selectedCountries.length === 0 ? ["all"] : selectedCountries,
    onSelect,
    selectMultiple: true,
  };
}

export function buildCountryActiveFilters({
  countryNames,
  selectedCountries,
  onRemove,
}: {
  countryNames: Record<CompanyCountryTagSlug, string>;
  selectedCountries: CompanyCountryTagSlug[];
  onRemove: (country: CompanyCountryTagSlug) => void;
}) {
  return selectedCountries.map((country) => ({
    type: "filter" as const,
    label: countryNames[country] ?? country,
    onRemove: () => onRemove(country),
  }));
}
