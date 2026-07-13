import type { EditableReportingPeriod } from "@/types/company";
import { mapSinglePeriodToPayload } from "./company-edit/map-period";

export function mapCompanyEditFormToRequestBody(
  selectedPeriods: EditableReportingPeriod[],
  formData: Map<string, string>,
) {
  const formKeys = Array.from(formData.keys());
  const periodsUpdate = selectedPeriods
    .map((period) => mapSinglePeriodToPayload(period, formData, formKeys))
    .filter((update): update is NonNullable<typeof update> => update !== null);

  const metadata: {
    comment?: string;
    source?: string;
  } = {};

  if (formData.get("comment")) {
    metadata.comment = formData.get("comment");
  }

  if (formData.get("source")) {
    metadata.source = formData.get("source");
  }

  return {
    reportingPeriods: periodsUpdate,
    metadata,
  };
}
