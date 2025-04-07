import { CompanyEditRow } from "./CompanyEditRow";
import { CompanyEditInputField, CompanyEmptyField } from "./CompanyEditField";
import { useTranslation } from "react-i18next";

export function CompanyEditScope2({ periods, onInputChange }) {
  const { t } = useTranslation();

  return (
    <>
      <CompanyEditRow
        key={"scope-2"}
        headerName
        noHover
        name="Scope 2"
        fields={periods.map((period) => CompanyEmptyField())}
      ></CompanyEditRow>
      <CompanyEditRow
        key={"scope-2-mb"}
        name={t("companyEditPage.rowName.marketBased")}
        fields={periods.map((period) =>
          CompanyEditInputField({
            type: "number",
            name: "scope-2-mb-" + period.id,
            value: period.emissions?.scope2?.mb ?? "",
            verified: period.emissions?.scope2?.metadata?.verifiedBy,
            onInputChange,
          }),
        )}
      ></CompanyEditRow>
      <CompanyEditRow
        key={"scope-2-lb"}
        name={t("companyEditPage.rowName.locationBased")}
        fields={periods.map((period) =>
          CompanyEditInputField({
            type: "number",
            name: "scope-2-lb-" + period.id,
            value: period.emissions?.scope2?.lb ?? "",
            verified: period.emissions?.scope2?.metadata?.verifiedBy,
            onInputChange,
          }),
        )}
      ></CompanyEditRow>
      <CompanyEditRow
        key={"scope-2-unknown"}
        name={t("companyEditPage.rowName.unknown")}
        fields={periods.map((period) =>
          CompanyEditInputField({
            type: "number",
            name: "scope-2-unknown-" + period.id,
            value: period.emissions?.scope2?.unknown ?? "",
            verified: period.emissions?.scope2?.metadata?.verifiedBy,
            onInputChange,
          }),
        )}
      ></CompanyEditRow>
    </>
  );
}
