import { useTranslation } from "react-i18next";
import { ViewOption } from "../../components/charts/DataViewSelector";

/**
 * Hook to generate company data view options
 */
export const useCompanyViewOptions = (): ViewOption<string>[] => {
  const { t } = useTranslation();

  return [
    { value: "overview", label: t("companies.dataView.overview") },
    { value: "scopes", label: t("companies.dataView.scopes") },
  ];
};

/**
 * Hook to generate municipality data view options
 */
export const useMunicipalityViewOptions = (
  hasSectors: boolean,
): ViewOption<string>[] => {
  const { t } = useTranslation();

  return [
    { value: "overview", label: t("municipalities.graph.overview") },
    {
      value: "sectors",
      label: t("municipalities.graph.sectors"),
      disabled: !hasSectors,
    },
  ];
};
