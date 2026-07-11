import { useTranslation } from "react-i18next";
import { useCategoryMetadata } from "@/hooks/companies/useCategories";

type LargestEmission =
  | {
      key: string | number;
      value: number | null;
      type: "scope1" | "scope2" | "scope3";
    }
  | undefined;

interface ListCardMetaInput {
  variant: "company" | "municipality" | "region";
  climatePlanHasPlan?: boolean | null;
  climatePlanYear?: number | null;
  largestEmission?: LargestEmission;
}

interface ListCardMeta {
  isMunicipality: boolean;
  isRegion: boolean;
  climatePlanAdoptedText: string | null;
  climatePlanStatusColor: string;
  climatePlanAdoptedColor: string;
  climatePlanStatusLabel: string;
  categoryName: string;
}

function getClimatePlanAdoptedText(
  isMunicipality: boolean,
  climatePlanHasPlan: boolean | null | undefined,
  climatePlanYear: number | null | undefined,
  t: ReturnType<typeof useTranslation>["t"],
) {
  if (!isMunicipality) {
    return null;
  }

  if (climatePlanHasPlan) {
    return t("municipalities.card.adopted", {
      year: climatePlanYear ?? t("unknown"),
    });
  }

  return t("municipalities.card.noPlan");
}

function getClimatePlanStatusColor(
  isMunicipality: boolean,
  climatePlanHasPlan: boolean | null | undefined,
) {
  if (!isMunicipality) {
    return "text-white";
  }

  if (climatePlanHasPlan === true) {
    return "text-green-3";
  }
  if (climatePlanHasPlan === false) {
    return "text-pink-3";
  }
  return "text-grey";
}

function getClimatePlanStatusLabel(
  isMunicipality: boolean,
  climatePlanHasPlan: boolean | null | undefined,
  t: ReturnType<typeof useTranslation>["t"],
) {
  if (!isMunicipality) {
    return "";
  }

  if (climatePlanHasPlan === true) {
    return t("yes");
  }
  if (climatePlanHasPlan === false) {
    return t("no");
  }
  return t("unknown");
}

function getLargestEmissionCategoryName(
  largestEmission: LargestEmission,
  getCategoryName: (categoryId: number) => string,
  t: ReturnType<typeof useTranslation>["t"],
) {
  if (largestEmission?.type === "scope3" && largestEmission.key !== null) {
    return getCategoryName(largestEmission.key as number);
  }
  if (largestEmission?.type === "scope1") {
    return t("companies.card.scope1");
  }
  if (largestEmission?.type === "scope2") {
    return t("companies.card.scope2");
  }
  return t("unknown");
}

export const useListCardMeta = ({
  variant,
  climatePlanHasPlan,
  climatePlanYear,
  largestEmission,
}: ListCardMetaInput): ListCardMeta => {
  const { t } = useTranslation();
  const { getCategoryName } = useCategoryMetadata();
  const isMunicipality = variant === "municipality";
  const isRegion = variant === "region";

  return {
    isMunicipality,
    isRegion,
    climatePlanAdoptedText: getClimatePlanAdoptedText(
      isMunicipality,
      climatePlanHasPlan,
      climatePlanYear,
      t,
    ),
    climatePlanStatusColor: getClimatePlanStatusColor(
      isMunicipality,
      climatePlanHasPlan,
    ),
    climatePlanAdoptedColor:
      isMunicipality && !climatePlanHasPlan ? "text-grey" : "text-white",
    climatePlanStatusLabel: getClimatePlanStatusLabel(
      isMunicipality,
      climatePlanHasPlan,
      t,
    ),
    categoryName: getLargestEmissionCategoryName(
      largestEmission,
      getCategoryName,
      t,
    ),
  };
};
