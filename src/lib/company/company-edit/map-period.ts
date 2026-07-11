import type {
  EditableReportingPeriod,
  ReportingPeriodPayloadItem,
} from "@/types/company";
import { mapEmployees, mapTurnover } from "./economy-fields";
import { mapScope1Emissions } from "./emissions-scope1";
import { mapScope2Emissions } from "./emissions-scope2";
import { mapScope3Categories, mapScope3StatedTotal } from "./emissions-scope3";
import {
  mapEmissionsStatedTotal,
  mapScope1And2Emissions,
} from "./emissions-totals";
import { isNewPeriod } from "./helpers";
import { mapPeriodFields } from "./period-fields";

export function mapSinglePeriodToPayload(
  period: EditableReportingPeriod,
  formData: Map<string, string>,
  formKeys: string[],
): ReportingPeriodPayloadItem | null {
  const periodFields = mapPeriodFields(period, formData);
  const periodUpdate: ReportingPeriodPayloadItem = {
    id: period.id,
    ...periodFields,
    emissions: {},
    economy: {},
  };

  mapScope1Emissions(period, formData, periodUpdate.emissions!);
  mapScope2Emissions(period, formData, periodUpdate.emissions!);
  mapScope3Categories(period, formData, formKeys, periodUpdate.emissions!);
  mapScope3StatedTotal(period, formData, periodUpdate.emissions!);
  mapEmissionsStatedTotal(period, formData, periodUpdate.emissions!);
  mapScope1And2Emissions(period, formData, periodUpdate.emissions!);
  mapTurnover(period, formData, periodUpdate.economy!);
  mapEmployees(period, formData, periodUpdate.economy!);

  const hasEmissionsChanges = Object.keys(periodUpdate.emissions!).length > 0;
  const hasEconomyChanges = Object.keys(periodUpdate.economy!).length > 0;
  const hasPeriodChanges =
    periodFields.startDate !== period.startDate ||
    periodFields.endDate !== period.endDate ||
    periodFields.reportURL !== period.reportURL;

  if (
    !isNewPeriod(period) &&
    !hasEmissionsChanges &&
    !hasEconomyChanges &&
    !hasPeriodChanges
  ) {
    return null;
  }

  const finalUpdate: ReportingPeriodPayloadItem = {
    startDate: periodFields.startDate,
    endDate: periodFields.endDate,
  };

  if (!isNewPeriod(period)) {
    finalUpdate.id = period.id;
  }

  if (isNewPeriod(period)) {
    finalUpdate.reportURL = periodFields.reportURL || "";
  } else if (periodFields.reportURL !== period.reportURL) {
    finalUpdate.reportURL = periodFields.reportURL ?? "";
  }

  if (hasEmissionsChanges) {
    finalUpdate.emissions = periodUpdate.emissions;
  }

  if (hasEconomyChanges) {
    finalUpdate.economy = periodUpdate.economy;
  }

  return finalUpdate;
}
