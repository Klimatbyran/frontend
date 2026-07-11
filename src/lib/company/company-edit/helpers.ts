import type { EditableReportingPeriod } from "@/types/company";

export function isNewPeriod(period: EditableReportingPeriod): boolean {
  return typeof period.id === "string" && String(period.id).startsWith("new-");
}

export function getFormValue(
  formData: Map<string, string>,
  key: string,
): string | undefined {
  return formData.get(key);
}

export function isFormCheckboxChecked(
  formData: Map<string, string>,
  key: string,
): boolean {
  return formData.get(key) === "true";
}

export function isOriginallyVerified(
  metadata?: { verifiedBy?: { name?: string } | null } | null,
): boolean {
  return !!metadata?.verifiedBy?.name;
}
