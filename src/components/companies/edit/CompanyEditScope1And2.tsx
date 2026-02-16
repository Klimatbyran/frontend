import { useTranslation } from "react-i18next";
import { getNumericValue } from "@/utils/ui/form";
import { isVerified } from "@/utils/business/verification";
import type {
  CompanyEditComponentProps,
  EditableReportingPeriod,
} from "@/types/company";
import { CompanyEditInputField } from "./CompanyEditField";
import { CompanyEditRow } from "./CompanyEditRow";

export function CompanyEditScope1And2({
  periods,
  onInputChange,
  formData,
}: CompanyEditComponentProps) {
  const { t } = useTranslation();

  return (
    <CompanyEditRow
      headerName
      name={t("companyEditPage.rowName.scope1And2Combined")}
      key="scope-1-and-2"
    >
      {periods.map((period: EditableReportingPeriod) => (
        <CompanyEditInputField
          name={`scope-1-and-2-${period.id}`}
          type="number"
          key={`scope-1-and-2-${period.id}`}
          displayAddition="verification"
          value={getNumericValue(period.emissions?.scope1And2?.total)}
          verified={isVerified(period.emissions?.scope1And2?.metadata)}
          originalVerified={isVerified(period.emissions?.scope1And2?.metadata)}
          onInputChange={onInputChange}
          formData={formData}
        />
      ))}
    </CompanyEditRow>
  );
}
