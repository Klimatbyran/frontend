import { CompanyEditRow } from "./CompanyEditRow";
import { CompanyEditInputField, CompanyEmptyField } from "./CompanyEditField";
import { useCategoryMetadata } from "@/hooks/companies/useCategories";
import type { ReportingPeriod } from "@/types/company";
import type { CompanyEditInputFieldProps } from "./CompanyEditField";
import { useTranslation } from "react-i18next";

interface CompanyEditScope3Props {
  periods: ReportingPeriod[];
  onInputChange: (name: string, value: string) => void;
  formData: Map<string, string>;
}

export function CompanyEditScope3({
  periods,
  onInputChange,
  formData,
}: CompanyEditScope3Props) {
  const { categoryMetadata } = useCategoryMetadata();
  const { t } = useTranslation();

  if (
    periods.length <= 0 ||
    periods[0].emissions?.scope3 === undefined ||
    periods[0].emissions?.scope3?.categories === undefined
  ) {
    return <></>;
  }

  const getCategoryValue = (
    index: number,
    categories: { category: number; total: number; unit: string }[] = [],
  ): number | string => {
    const category = categories.find(
      (category) => category.category - 1 === index,
    );
    return category !== undefined ? category.total : "";
  };

  const getCategoryVerified = (
    index: number,
    categories: { category: number; total: number; unit: string }[] = [],
  ): boolean => {
    // @ts-ignore: metadata may not exist on category, but keep for compatibility
    const category = categories.find(
      (category) => category.category - 1 === index,
    );
    // @ts-ignore: metadata may not exist on category, but keep for compatibility
    return category !== undefined ? category.metadata?.verifiedBy : false;
  };

  // Instead of a static list, use categoryMetadata for all 16 categories
  const categoryIds = Array.from({ length: 16 }, (_, i) => i + 1);

  return (
    <>
      <CompanyEditRow key={"scope-3"} headerName noHover name="Scope 3">
        {periods.map((period: ReportingPeriod) => (
          <CompanyEmptyField key={period.id} />
        ))}
      </CompanyEditRow>

      {/* Add statedTotalEmissions (lump sum) row */}
      <CompanyEditRow
        key={"scope-3-stated-total"}
        name={t("companies.categories.statedTotal")}
      >
        {periods.map((period: ReportingPeriod) => (
          <CompanyEditInputField
            name={`scope-3-statedTotalEmissions-${period.id}`}
            type="number"
            key={`scope-3-statedTotalEmissions-${period.id}`}
            displayAddition="verification"
            verified={
              !!period.emissions?.scope3?.statedTotalEmissions?.metadata
                ?.verifiedBy
            }
            value={period.emissions?.scope3?.statedTotalEmissions?.total ?? ""}
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
          {periods.map((period: ReportingPeriod) => (
            <CompanyEditInputField
              name={`scope-3-${period.id}-${categoryId}`}
              type="number"
              key={`scope-3-${period.id}-${categoryId}`}
              displayAddition="verification"
              verified={getCategoryVerified(
                categoryId - 1,
                period.emissions?.scope3?.categories,
              )}
              value={getCategoryValue(
                categoryId - 1,
                period.emissions?.scope3?.categories,
              )}
              onInputChange={onInputChange}
              formData={formData}
            />
          ))}
        </CompanyEditRow>
      ))}
    </>
  );
}
