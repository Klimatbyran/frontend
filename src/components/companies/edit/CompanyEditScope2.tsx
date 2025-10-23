import { CompanyEditRow } from "./CompanyEditRow";
import { CompanyEditInputField, CompanyEmptyField } from "./CompanyEditField";
import { getNumericValue } from "@/utils/ui/form";
import { isVerified } from "@/utils/business/verification";
import { useTranslation } from "react-i18next";
import type {
  CompanyEditComponentProps,
  ReportingPeriod,
} from "@/types/company";

export function CompanyEditScope2({
  periods,
  onInputChange,
  formData,
}: CompanyEditComponentProps) {
  const { t } = useTranslation();

  return (
    <>
      <CompanyEditRow key={"scope-2"} headerName noHover name="Scope 2">
        {periods.map((period: ReportingPeriod) => (
          <CompanyEmptyField key={period.id} />
        ))}
      </CompanyEditRow>
      <CompanyEditRow
        key={"scope-2-mb"}
        name={t("companyEditPage.rowName.marketBased")}
      >
        {periods.map((period: ReportingPeriod) => (
          <CompanyEditInputField
            name={`scope-2-mb-${period.id}`}
            type="number"
            key={`scope-2-mb-${period.id}`}
            displayAddition="topBracket"
            value={getNumericValue(period.emissions?.scope2?.mb)}
            onInputChange={onInputChange}
            formData={formData}
          />
        ))}
      </CompanyEditRow>
      <CompanyEditRow
        key={"scope-2-lb"}
        name={t("companyEditPage.rowName.locationBased")}
      >
        {periods.map((period: ReportingPeriod) => (
          <CompanyEditInputField
            name={`scope-2-lb-${period.id}`}
            type="number"
            key={`scope-2-lb-${period.id}`}
            displayAddition="verification"
            verified={isVerified(period.emissions?.scope2?.metadata)}
            originalVerified={isVerified(period.emissions?.scope2?.metadata)}
            value={getNumericValue(period.emissions?.scope2?.lb)}
            onInputChange={onInputChange}
            formData={formData}
          />
        ))}
      </CompanyEditRow>
      <CompanyEditRow
        key={"scope-2-unknown"}
        name={t("companyEditPage.rowName.unknown")}
      >
        {periods.map((period: ReportingPeriod) => (
          <CompanyEditInputField
            name={`scope-2-unknown-${period.id}`}
            type="number"
            key={`scope-2-unknown-${period.id}`}
            displayAddition="bottomBracket"
            value={getNumericValue(period.emissions?.scope2?.unknown)}
            onInputChange={onInputChange}
            formData={formData}
          />
        ))}
      </CompanyEditRow>
    </>
  );
}
