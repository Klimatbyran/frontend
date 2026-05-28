import { getNumericValue } from "@/utils/ui/form";
import { isVerified } from "@/utils/business/verification";
import type {
  CompanyEditComponentProps,
  EditableReportingPeriod,
} from "@/types/company";
import { CompanyEditInputField } from "./CompanyEditField";
import { CompanyEditRow } from "./CompanyEditRow";

export function CompanyEditScope1({
  periods,
  onInputChange,
  formData,
}: CompanyEditComponentProps) {
  return (
    <CompanyEditRow headerName name="Scope 1" key="scope-1">
      {periods.map((period: EditableReportingPeriod) => (
        <CompanyEditInputField
          name={`scope-1-${period.id}`}
          type="number"
          key={`scope-1-${period.id}`}
          displayAddition="verification"
          value={getNumericValue(period.emissions?.scope1?.total)}
          verified={isVerified(period.emissions?.scope1?.metadata)}
          originalVerified={isVerified(period.emissions?.scope1?.metadata)}
          onInputChange={onInputChange}
          formData={formData}
        />
      ))}
    </CompanyEditRow>
  );
}
