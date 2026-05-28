import { useTranslation } from "react-i18next";
import { useCategoryMetadata } from "@/hooks/companies/useCategories";
import { isVerified } from "@/utils/business/verification";
import type {
  CompanyEditComponentProps,
  EditableReportingPeriod,
} from "@/types/company";
import { CompanyEditInputField, CompanyEmptyField } from "./CompanyEditField";
import { CompanyEditRow } from "./CompanyEditRow";

interface Scope3CategoryWithMetadata {
  category: number;
  total: number;
  unit: string | null;
  metadata?: { verifiedBy?: { name: string } | null };
}

export function CompanyEditScope3({
  periods,
  onInputChange,
  formData,
}: CompanyEditComponentProps) {
  const { categoryMetadata } = useCategoryMetadata();
  const { t } = useTranslation();

  if (periods.length <= 0) {
    return <></>;
  }

  const getCategoryValue = (
    index: number,
    categories: Scope3CategoryWithMetadata[] = [],
  ): number | string => {
    const category = categories.find(
      (category) => category.category - 1 === index,
    );
    if (!category || category.total === undefined || category.total === null)
      return "";
    return category.total;
  };

  const getCategoryVerified = (
    index: number,
    categories: Scope3CategoryWithMetadata[] = [],
  ): boolean => {
    const category = categories.find(
      (category) => category.category - 1 === index,
    );
    // metadata may not exist, so coerce to boolean
    return isVerified(category?.metadata);
  };

  // Instead of a static list, use categoryMetadata for all 16 categories
  const categoryIds = Array.from({ length: 16 }, (_, i) => i + 1);

  return (
    <>
      <CompanyEditRow key={"scope-3"} headerName noHover name="Scope 3">
        {periods.map((period: EditableReportingPeriod) => (
          <CompanyEmptyField key={period.id} />
        ))}
      </CompanyEditRow>

      {/* Add statedTotalEmissions (lump sum) row */}
      <CompanyEditRow
        key={"scope-3-stated-total"}
        name={t("companies.categories.statedTotal")}
      >
        {periods.map((period: EditableReportingPeriod) => (
          <CompanyEditInputField
            name={`scope-3-statedTotalEmissions-${period.id}`}
            type="number"
            key={`scope-3-statedTotalEmissions-${period.id}`}
            displayAddition="verification"
            verified={
              !!period.emissions?.scope3?.statedTotalEmissions?.metadata
                ?.verifiedBy
            }
            originalVerified={
              !!period.emissions?.scope3?.statedTotalEmissions?.metadata
                ?.verifiedBy
            }
            value={
              period.emissions?.scope3?.statedTotalEmissions?.total ===
                undefined ||
              period.emissions?.scope3?.statedTotalEmissions?.total === null
                ? ""
                : period.emissions?.scope3?.statedTotalEmissions?.total
            }
            onInputChange={onInputChange}
            formData={formData}
          />
        ))}
      </CompanyEditRow>

      {categoryIds.map((categoryId) => (
        <CompanyEditRow
          key={"scope-3-" + categoryId}
          name={`${categoryId}. ${categoryMetadata[categoryId]?.name || ""}`}
        >
          {periods.map((period: EditableReportingPeriod) => {
            const categories = (period.emissions?.scope3?.categories || [])
              .filter((cat) => cat.total !== null)
              .map((cat) => ({
                ...cat,
                total: cat.total as number,
              }));
            return (
              <CompanyEditInputField
                name={`scope-3-${period.id}-${categoryId}`}
                type="number"
                key={`scope-3-${period.id}-${categoryId}`}
                displayAddition="verification"
                verified={getCategoryVerified(categoryId - 1, categories)}
                originalVerified={getCategoryVerified(
                  categoryId - 1,
                  categories,
                )}
                value={getCategoryValue(categoryId - 1, categories)}
                onInputChange={onInputChange}
                formData={formData}
              />
            );
          })}
        </CompanyEditRow>
      ))}
    </>
  );
}
