import { CompanyEditRow } from "./CompanyEditRow";
import { CompanyEditInputField, CompanyEmptyField } from "./CompanyEditField";
import { useCategoryMetadata } from "@/hooks/companies/useCategories";

export function CompanyEditScope3({ periods, onInputChange }) {
  const { categoryMetadata } = useCategoryMetadata();

  if (
    periods.length <= 0 ||
    periods[0].emissions?.scope3 === undefined ||
    periods[0].emissions?.scope3?.categories === undefined
  ) {
    return <></>;
  }

  const getCategoryValue = (index: number, categories) => {
    const category = categories.find(
      (category) => category.category - 1 === index,
    );
    return category !== undefined ? category.total : "";
  };

  const getCategoryVerified = (index: number, categories) => {
    const category = categories.find(
      (category) => category.category - 1 === index,
    );
    return category !== undefined ? category.metadata?.verifiedBy : false;
  };

  return (
    <>
      <CompanyEditRow
        key={"scope-3"}
        headerName
        noHover
        name="Scope 3"
        fields={periods.map((_period) => CompanyEmptyField())}
      ></CompanyEditRow>

      {Object.values(categoryMetadata).map(
        (category, index) =>
          index !== 15 && (
            <CompanyEditRow
              key={"scope-3-" + index}
              name={category.name}
              fields={periods.map((period) =>
                CompanyEditInputField({
                  type: "number",
                  name: "scope-3-" + period.id + "-" + (index + 1),
                  value: getCategoryValue(
                    index,
                    period.emissions.scope3?.categories,
                  ),
                  verified: getCategoryVerified(
                    index,
                    period.emissions?.scope3?.categories,
                  ),
                  onInputChange,
                }),
              )}
            ></CompanyEditRow>
          ),
      )}
    </>
  );
}
