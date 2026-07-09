import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import type { FilterGroup } from "@/components/explore/FilterPopover";
import type { CompanyTag } from "@/types/company";
import type { CountryTagOption } from "@/lib/api";

type CompanyWithTags = {
  tags?: CompanyTag[] | null;
};

export function getCompanyCountrySlugs(tags?: CompanyTag[] | null): string[] {
  return (tags ?? [])
    .filter((tag) => tag.type === "COUNTRY")
    .map((tag) => tag.slug);
}

export function useCompanyCountryNames(countryOptions: CountryTagOption[]) {
  const { t } = useTranslation();

  return useMemo(
    () =>
      Object.fromEntries(
        countryOptions.map((option) => [
          option.slug,
          option.label ?? t(`companyCountries.${option.slug}`, option.slug),
        ]),
      ) as Record<string, string>,
    [countryOptions, t],
  );
}

export function parseCountriesFromURL(
  searchParams: URLSearchParams,
  validSlugs?: ReadonlySet<string>,
): string[] {
  const raw = searchParams.get("countries");
  if (!raw) return [];

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((slug) => slug.length > 0)
    .filter((slug) => !validSlugs || validSlugs.has(slug));
}

export function getAvailableCountryOptions(
  companies: CompanyWithTags[],
  orderedCountrySlugs: string[],
): string[] {
  const present = new Set<string>();
  for (const company of companies) {
    for (const slug of getCompanyCountrySlugs(company.tags)) {
      present.add(slug);
    }
  }

  return orderedCountrySlugs.filter((slug) => present.has(slug));
}

export function companyMatchesCountries(
  company: CompanyWithTags,
  selectedCountries: string[],
): boolean {
  if (selectedCountries.length === 0) return true;

  const countrySlugs = getCompanyCountrySlugs(company.tags);
  return selectedCountries.some((country) => countrySlugs.includes(country));
}

export function toggleCountrySelection(
  selectedCountries: string[],
  value: string,
  validSlugs?: ReadonlySet<string>,
): string[] {
  if (value === "all") return [];

  if (validSlugs && !validSlugs.has(value)) return selectedCountries;

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
  countryNames: Record<string, string>;
  availableCountries: string[];
  selectedCountries: string[];
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
        label: countryNames[slug] ?? slug,
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
  countryNames: Record<string, string>;
  selectedCountries: string[];
  onRemove: (country: string) => void;
}) {
  return selectedCountries.map((country) => ({
    type: "filter" as const,
    label: countryNames[country] ?? country,
    onRemove: () => onRemove(country),
  }));
}
