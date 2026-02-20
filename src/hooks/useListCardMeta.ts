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
  regionMunicipalityCount?: number;
}

interface ListCardMeta {
  isMunicipality: boolean;
  isRegion: boolean;
  climatePlanAdoptedText: string | null;
  climatePlanStatusColor: string;
  climatePlanAdoptedColor: string;
  categoryName: string;
  regionMunicipalityCountText: string | null;
}

export const useListCardMeta = ({
  variant,
  climatePlanHasPlan,
  climatePlanYear,
  largestEmission,
  regionMunicipalityCount,
}: ListCardMetaInput): ListCardMeta => {
  const { t } = useTranslation();
  const { getCategoryName } = useCategoryMetadata();
  const isMunicipality = variant === "municipality";
  const isRegion = variant === "region";

  const climatePlanAdoptedText = isMunicipality
    ? climatePlanHasPlan
      ? t("municipalities.card.adopted", {
          year: climatePlanYear ?? t("unknown"),
        })
      : t("municipalities.card.noPlan")
    : null;

  const climatePlanStatusColor = isMunicipality
    ? climatePlanHasPlan === true
      ? "text-green-3"
      : climatePlanHasPlan === false
        ? "text-pink-3"
        : "text-grey"
    : "text-white";

  const climatePlanAdoptedColor =
    isMunicipality && !climatePlanHasPlan ? "text-grey" : "text-white";

  let categoryName;
  if (largestEmission?.type === "scope3" && largestEmission.key !== null) {
    categoryName = getCategoryName(largestEmission?.key as number);
  } else if (largestEmission?.type === "scope1") {
    categoryName = t("companies.card.scope1");
  } else if (largestEmission?.type === "scope2") {
    categoryName = t("companies.card.scope2");
  } else {
    categoryName = t("unknown");
  }

  const regionMunicipalityCountText =
    isRegion && regionMunicipalityCount != null
      ? String(regionMunicipalityCount)
      : null;

  return {
    isMunicipality,
    isRegion,
    climatePlanAdoptedText,
    climatePlanStatusColor,
    climatePlanAdoptedColor,
    categoryName,
    regionMunicipalityCountText,
  };
};
