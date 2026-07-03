import type { EditableReportingPeriod } from "@/types/company";
import { parseFormNumber } from "@/utils/ui/numberFormat";
import {
  getFormValue,
  isFormCheckboxChecked,
  isOriginallyVerified,
} from "./helpers";

type EconomyUpdate = NonNullable<
  NonNullable<
    import("@/types/company").ReportingPeriodPayloadItem["economy"]
  >
>;

export function mapTurnover(
  period: EditableReportingPeriod,
  formData: Map<string, string>,
  economy: EconomyUpdate,
): void {
  const turnoverValueKey = `turnover-value-${period.id}`;
  const turnoverCurrencyKey = `turnover-currency-${period.id}`;
  const turnoverCheckboxKey = turnoverValueKey + "-checkbox";
  const originalTurnover = period.economy?.turnover;
  const turnoverValueChanged = formData.has(turnoverValueKey);
  const turnoverCurrencyChanged = formData.has(turnoverCurrencyKey);
  const turnoverVerifiedChanged = formData.has(turnoverCheckboxKey);
  const turnoverNewVerified = turnoverVerifiedChanged
    ? isFormCheckboxChecked(formData, turnoverCheckboxKey)
    : undefined;

  if (turnoverValueChanged || turnoverCurrencyChanged) {
    economy.turnover = {
      value: turnoverValueChanged
        ? getFormValue(formData, turnoverValueKey) === ""
          ? undefined
          : parseFormNumber(getFormValue(formData, turnoverValueKey)!)
        : originalTurnover?.value,
      currency: turnoverCurrencyChanged
        ? getFormValue(formData, turnoverCurrencyKey) === ""
          ? undefined
          : getFormValue(formData, turnoverCurrencyKey)
        : originalTurnover?.currency,
      verified:
        turnoverNewVerified ??
        isOriginallyVerified(originalTurnover?.metadata),
    };
  } else if (turnoverVerifiedChanged && originalTurnover) {
    economy.turnover = {
      verified: turnoverNewVerified,
    };
  }
}

export function mapEmployees(
  period: EditableReportingPeriod,
  formData: Map<string, string>,
  economy: EconomyUpdate,
): void {
  const employeesValueKey = `employees-value-${period.id}`;
  const employeesUnitKey = `employees-unit-${period.id}`;
  const employeesCheckboxKey = employeesValueKey + "-checkbox";
  const originalEmployees = period.economy?.employees;
  const employeesValueChanged = formData.has(employeesValueKey);
  const employeesUnitChanged = formData.has(employeesUnitKey);
  const employeesVerifiedChanged = formData.has(employeesCheckboxKey);
  const employeesNewVerified = employeesVerifiedChanged
    ? isFormCheckboxChecked(formData, employeesCheckboxKey)
    : undefined;

  if (employeesValueChanged || employeesUnitChanged) {
    economy.employees = {
      value: employeesValueChanged
        ? getFormValue(formData, employeesValueKey) === ""
          ? undefined
          : parseFormNumber(getFormValue(formData, employeesValueKey)!)
        : originalEmployees?.value,
      unit: employeesUnitChanged
        ? getFormValue(formData, employeesUnitKey) === ""
          ? undefined
          : getFormValue(formData, employeesUnitKey)
        : originalEmployees?.unit,
      verified:
        employeesNewVerified ??
        isOriginallyVerified(originalEmployees?.metadata),
    };
  } else if (employeesVerifiedChanged && originalEmployees) {
    economy.employees = {
      verified: employeesNewVerified,
    };
  }
}
