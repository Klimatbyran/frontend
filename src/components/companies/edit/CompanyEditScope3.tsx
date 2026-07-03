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

function getCategoryValue(
  index: number,
  categories: Scope3CategoryWithMetadata[] = [],
): number | string {
  const category = categories.find((item) => item.category - 1 === index);
  if (!category || category.total === undefined || category.total === null) {
    return "";
  }
  return category.total;
}

function getCategoryVerified(
  index: number,
  categories: Scope3CategoryWithMetadata[] = [],
): boolean {
  const category = categories.find((item) => item.category - 1 === index);
  return isVerified(category?.metadata);
}

function getScope3Categories(period: EditableReportingPeriod) {
  return (period.emissions?.scope3?.categories || [])
    .filter((category) => category.total !== null)
    .map((category) => ({
      ...category,
      total: category.total as number,
    }));
}

function getStatedTotalValue(period: EditableReportingPeriod): number | string {
  const total = period.emissions?.scope3?.statedTotalEmissions?.total;
  if (total === undefined || total === null) {
    return "";
  }
  return total;
}

function Scope3StatedTotalRow({
  periods,
  onInputChange,
  formData,
}: CompanyEditComponentProps) {
  const { t } = useTranslation();

  return (
    <CompanyEditRow
      key="scope-3-stated-total"
      name={t("companies.categories.statedTotal")}
    >
      {periods.map((period) => (
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
          value={getStatedTotalValue(period)}
          onInputChange={onInputChange}
          formData={formData}
        />
      ))}
    </CompanyEditRow>
  );
}

interface Scope3CategoryEditRowProps extends CompanyEditComponentProps {
  categoryId: number;
  categoryName: string;
}

function Scope3CategoryEditRow({
  periods,
  onInputChange,
  formData,
  categoryId,
  categoryName,
}: Scope3CategoryEditRowProps) {
  return (
    <CompanyEditRow key={`scope-3-${categoryId}`} name={categoryName}>
      {periods.map((period) => {
        const categories = getScope3Categories(period);
        return (
          <CompanyEditInputField
            name={`scope-3-${period.id}-${categoryId}`}
            type="number"
            key={`scope-3-${period.id}-${categoryId}`}
            displayAddition="verification"
            verified={getCategoryVerified(categoryId - 1, categories)}
            originalVerified={getCategoryVerified(categoryId - 1, categories)}
            value={getCategoryValue(categoryId - 1, categories)}
            onInputChange={onInputChange}
            formData={formData}
          />
        );
      })}
    </CompanyEditRow>
  );
}

export function CompanyEditScope3({
  periods,
  onInputChange,
  formData,
}: CompanyEditComponentProps) {
  const { categoryMetadata } = useCategoryMetadata();

  if (periods.length <= 0) {
    return <></>;
  }

  const categoryIds = Array.from({ length: 16 }, (_, index) => index + 1);

  return (
    <>
      <CompanyEditRow key="scope-3" headerName noHover name="Scope 3">
        {periods.map((period) => (
          <CompanyEmptyField key={period.id} />
        ))}
      </CompanyEditRow>

      <Scope3StatedTotalRow
        periods={periods}
        onInputChange={onInputChange}
        formData={formData}
      />

      {categoryIds.map((categoryId) => (
        <Scope3CategoryEditRow
          key={`scope-3-${categoryId}`}
          periods={periods}
          onInputChange={onInputChange}
          formData={formData}
          categoryId={categoryId}
          categoryName={`${categoryId}. ${categoryMetadata[categoryId]?.name || ""}`}
        />
      ))}
    </>
  );
}
