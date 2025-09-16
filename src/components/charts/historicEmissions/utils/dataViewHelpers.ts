import { ViewOption } from "../../DataViewSelector";

/**
 * Helper function to generate company data view options
 */
export const generateCompanyViewOptions = (
  hasCategories: boolean,
  t: (key: string) => string,
): ViewOption<string>[] => [
  { value: "overview", label: t("companies.dataView.overview") },
  { value: "scopes", label: t("companies.dataView.scopes") },
  {
    value: "categories",
    label: t("companies.dataView.categories"),
    disabled: !hasCategories,
  },
];

/**
 * Helper function to generate municipality data view options
 */
export const generateMunicipalityViewOptions = (
  hasSectors: boolean,
  t: (key: string) => string,
): ViewOption<string>[] => [
  { value: "overview", label: t("municipalities.graph.overview") },
  {
    value: "sectors",
    label: t("municipalities.graph.sectors"),
    disabled: !hasSectors,
  },
];

/**
 * Helper function to get company data view placeholder
 */
export const getCompanyDataViewPlaceholder = (t: (key: string) => string) =>
  t("companies.dataView.selectView");

/**
 * Helper function to get municipality data view placeholder
 */
export const getMunicipalityDataViewPlaceholder = (
  t: (key: string) => string,
) => t("municipalities.graph.selectView");
