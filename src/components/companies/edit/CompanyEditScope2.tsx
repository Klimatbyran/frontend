import { CompanyEditRow } from "./CompanyEditRow";
import { CompanyEditInputField, CompanyEmptyField } from "./CompanyEditField";
import { useTranslation } from "react-i18next";

export function CompanyEditScope2({ periods, onInputChange, formData }) {
  const { t } = useTranslation()

  return (
    <>
      <CompanyEditRow
        key={"scope-2"}
        headerName
        noHover
        name="Scope 2"
      >
      {periods.map((period) => <CompanyEmptyField />)}
      </CompanyEditRow>
      <CompanyEditRow
        key={"scope-2-mb"}
        name={t("companyEditPage.rowName.marketBased")}
      >
        {periods.map((period) =>
          <CompanyEditInputField
          name={`scope-2-mb-${period.id}`}
          type="number"
          key={`scope-2-mb-${period.id}`}
          displayAddition="topBracket"
          value={period.emissions?.scope2?.mb ?? ''}
          onInputChange={onInputChange}
          formData={formData}
        />
        )}
      </CompanyEditRow>
      <CompanyEditRow
        key={"scope-2-lb"}
        name={t("companyEditPage.rowName.locationBased")}
      >
        {periods.map((period) =>
          <CompanyEditInputField
          name={`scope-2-lb-${period.id}`}
          type="number"
          key={`scope-2-lb-${period.id}`}
          displayAddition="verification"
          verified={period.emissions?.scope2?.metadata?.verifiedBy}
          value={period.emissions?.scope2?.lb ?? ''}
          onInputChange={onInputChange}
          formData={formData}
        />
        )}
      </CompanyEditRow>
      <CompanyEditRow
        key={"scope-2-unknown"}
        name={t("companyEditPage.rowName.unknown")}
      >
        {periods.map((period) =>
          <CompanyEditInputField
          name={`scope-2-unknown-${period.id}`}
          type="number"
          key={`scope-2-unknown-${period.id}`}
          displayAddition="bottomBracket"
          value={period.emissions?.scope2?.unknown ?? ''}
          onInputChange={onInputChange}
          formData={formData}
        />
        )}
      </CompanyEditRow>
    </>
  );
}
