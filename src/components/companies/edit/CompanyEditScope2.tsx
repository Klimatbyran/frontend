import { CompanyEditRow } from "./CompanyEditRow";
import { CompanyEditInputField, CompanyEmptyField } from "./CompanyEditField";
import { useTranslation } from "react-i18next";
import type { ReportingPeriod } from "@/types/company";

interface CompanyEditScope2Props {
  periods: ReportingPeriod[];
  onInputChange: (name: string, value: string) => void;
  formData: Map<string, string>;
}

export function CompanyEditScope2({
  periods,
  onInputChange,
  formData,
}: CompanyEditScope2Props) {
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
            value={
              period.emissions?.scope2?.mb === undefined ||
              period.emissions?.scope2?.mb === null
                ? ""
                : period.emissions?.scope2?.mb
            }
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
            verified={!!period.emissions?.scope2?.metadata?.verifiedBy}
            originalVerified={!!period.emissions?.scope2?.metadata?.verifiedBy}
            value={
              period.emissions?.scope2?.lb === undefined ||
              period.emissions?.scope2?.lb === null
                ? ""
                : period.emissions?.scope2?.lb
            }
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
            value={
              period.emissions?.scope2?.unknown === undefined ||
              period.emissions?.scope2?.unknown === null
                ? ""
                : period.emissions?.scope2?.unknown
            }
            onInputChange={onInputChange}
            formData={formData}
          />
        ))}
      </CompanyEditRow>
    </>
  );
}
