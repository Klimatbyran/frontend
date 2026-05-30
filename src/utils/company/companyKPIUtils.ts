import type { CompanyWithKPIs } from "@/types/company";
import { calculateTrendline } from "@/lib/calculations/trends/analysis";
import { calculateCarbonBudgetTonnes } from "@/utils/calculations/carbonBudget";
import {
  createFixedRangeGradient,
  createSymmetricRangeGradient,
} from "@/utils/ui/colorGradients";
import type { ColorFunction } from "@/types/visualizations";
import { DEFAULT_KPI_COLORS } from "../ui/colors";

export interface CompanyBudgetData {
  company: CompanyWithKPIs;
  budgetTonnes: number;
  meetsParis: boolean | null;
}

export function getCompanyBudgetData(companies: CompanyWithKPIs[]): {
  companyBudgetData: CompanyBudgetData[];
  noBudgetCompanies: CompanyWithKPIs[];
  budgetValues: number[];
  minRaw: number;
  maxRaw: number;
} {
  const withBudget: CompanyBudgetData[] = [];
  const withoutBudget: CompanyWithKPIs[] = [];

  companies.forEach((company) => {
    const trendAnalysis = calculateTrendline(company);
    const budgetTonnes = calculateCarbonBudgetTonnes(company, trendAnalysis);

    if (budgetTonnes === null) {
      withoutBudget.push(company);
      return;
    }

    withBudget.push({
      company,
      budgetTonnes,
      meetsParis: company.meetsParis ?? null,
    });
  });

  const values = withBudget.map((d) => d.budgetTonnes);
  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;

  return {
    companyBudgetData: withBudget,
    noBudgetCompanies: withoutBudget,
    budgetValues: values,
    minRaw: min,
    maxRaw: max,
  };
}

export function createBudgetColorFunction(
  minRaw: number,
  maxRaw: number,
): ColorFunction {
  const absMax = Math.max(Math.abs(minRaw), Math.abs(maxRaw));
  return (value: number) => createFixedRangeGradient(-absMax, absMax, value);
}

export function createSymmetricKPIColorGetter(
  companies: CompanyWithKPIs[],
  kpiKey: keyof CompanyWithKPIs,
) {
  const values = companies
    .map((company) => company[kpiKey])
    .filter((value): value is number => typeof value === "number");

  const min = values.length ? Math.min(...values) : 0;
  const max = values.length ? Math.max(...values) : 0;

  return (company: CompanyWithKPIs) => {
    const value = company[kpiKey];
    return value === null || value === undefined
      ? DEFAULT_KPI_COLORS.null
      : createSymmetricRangeGradient(min, max, value as number);
  };
}

export function createBudgetKPIColorGetter(companies: CompanyWithKPIs[]) {
  const { companyBudgetData, minRaw, maxRaw } = getCompanyBudgetData(companies);

  const colorForTonnes = createBudgetColorFunction(minRaw, maxRaw);
  const budgetTonnesByCompanyId = new Map<string, number>();

  for (let data of companyBudgetData) {
    budgetTonnesByCompanyId.set(data.company.wikidataId, data.budgetTonnes);
  }

  return (company: CompanyWithKPIs) => {
    const budgetTonnes = budgetTonnesByCompanyId.get(company.wikidataId);
    return budgetTonnes === undefined
      ? DEFAULT_KPI_COLORS.null
      : colorForTonnes(budgetTonnes);
  };
}
