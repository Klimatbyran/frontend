import type {
  CompanyKPIValue,
  CompanyWithKPIs,
} from "@/hooks/companies/useCompanyKPIs";
import { COLORS } from "@/lib/colors";
import { createSymmetricRangeGradient } from "@/utils/ui/colorGradients";
import { isMissingRankedValue } from "@/utils/insights/rankedListUtils";

export function getCompanyOverviewKPIColor(
  company: CompanyWithKPIs,
  selectedKPI: CompanyKPIValue,
  numericRange?: { min: number; max: number },
): string {
  const value = company[selectedKPI.key as keyof CompanyWithKPIs];

  if (isMissingRankedValue(value, selectedKPI)) {
    return COLORS.grey;
  }

  if (selectedKPI.isBoolean) {
    return value === selectedKPI.higherIsBetter ? COLORS.blue3 : COLORS.pink3;
  }

  if (typeof value === "number" && numericRange) {
    return createSymmetricRangeGradient(
      numericRange.min,
      numericRange.max,
      value,
    );
  }

  return COLORS.orange2;
}

export function getCompanyOverviewKPINumericRange(
  companies: CompanyWithKPIs[],
  selectedKPI: CompanyKPIValue,
): { min: number; max: number } | undefined {
  if (selectedKPI.isBoolean) return undefined;

  const values = companies
    .map((company) => company[selectedKPI.key as keyof CompanyWithKPIs])
    .filter((value): value is number => typeof value === "number");

  if (values.length === 0) return undefined;

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}
