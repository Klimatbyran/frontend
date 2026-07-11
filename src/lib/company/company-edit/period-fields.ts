import type {
  EditableReportingPeriod,
  ReportingPeriodPayloadItem,
} from "@/types/company";
import { getFormValue } from "./helpers";

export function mapPeriodFields(
  period: EditableReportingPeriod,
  formData: Map<string, string>,
): Pick<ReportingPeriodPayloadItem, "startDate" | "endDate" | "reportURL"> {
  const startDateKey = "start-date-" + period.id;
  const endDateKey = "end-date-" + period.id;
  const reportUrlKey = "report-url-" + period.id;

  return {
    startDate: formData.has(startDateKey)
      ? (getFormValue(formData, startDateKey) ?? period.startDate)
      : period.startDate,
    endDate: formData.has(endDateKey)
      ? (getFormValue(formData, endDateKey) ?? period.endDate)
      : period.endDate,
    reportURL: formData.has(reportUrlKey)
      ? getFormValue(formData, reportUrlKey) || null
      : period.reportURL,
  };
}
