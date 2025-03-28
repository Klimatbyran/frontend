import { CompanyEditRow } from "./CompanyEditRow";
import { CompanyEditInputField, CompanyYearHeaderField } from "./CompanyEditField";
import { useTranslation } from "react-i18next";

export function CompanyEditPeriod({ periods, onInputChange, formData }) {
  const { t } = useTranslation()
  return (
    <>
      <CompanyEditRow name={t("companyEditPage.rowName.reportingTimespan")} key={"reporting-timespan"} headerName noHover>{periods.map(period => CompanyYearHeaderField({text: period.endDate.substring(0, 4)}))}</CompanyEditRow>
      <CompanyEditRow name={t("companyEditPage.rowName.reportingStart")} key={"start-date"}>{periods.map(period => CompanyEditInputField({type: "date", value: period.startDate.substring(0, 10), name: "start-date-" + period.id, displayAddition: "none", onInputChange, formData}))}</CompanyEditRow>
      <CompanyEditRow name={t("companyEditPage.rowName.reportingEnd")} key={"end-date"}>{periods.map(period => CompanyEditInputField({type: "date", value: period.endDate.substring(0, 10), name: "end-date-" + period.id, displayAddition: "none", onInputChange, formData}))}</CompanyEditRow>
    </>
  );
}
