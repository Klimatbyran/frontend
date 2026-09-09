import { describe, expect, it, vi } from "vitest";
import type { CompanyKpiData, RankedCompany } from "@/types/company";
import {
  applyCompanyKpis,
  buildCompanyKpiLookup,
  mergeApiKpisOntoCompany,
} from "./useCompaniesKPIs";

vi.mock("@/hooks/companies/useCompanyKPIs", () => ({
  enrichCompanyWithKPIs: (company: RankedCompany) => ({
    ...company,
    meetsParis: false,
    emissionsChangeFromBaseYear: 12.5,
  }),
}));

function createCompany(id: string, name: string): RankedCompany {
  return {
    id,
    name,
    wikidataId: `Q${id}`,
    reportingPeriods: [],
    metrics: {
      emissionsReduction: 0,
      displayReduction: "0.0",
    },
  } as RankedCompany;
}

const apiKpis: CompanyKpiData[] = [
  {
    wikidataId: "Q1",
    name: "Duni AB",
    sectorCode: "15",
    meetsParis: true,
    emissionsChangeFromBaseYear: -42.3,
  },
];

describe("applyCompanyKpis", () => {
  it("uses API KPI values when the endpoint returns data", () => {
    const companies = [createCompany("1", "Duni AB")];

    expect(applyCompanyKpis(companies, apiKpis)).toEqual([
      {
        ...companies[0],
        meetsParis: true,
        emissionsChangeFromBaseYear: -42.3,
      },
    ]);
  });

  it("falls back to client-side KPI calculation when the endpoint is empty", () => {
    const companies = [createCompany("1", "Duni AB")];

    expect(applyCompanyKpis(companies, [])).toEqual([
      {
        ...companies[0],
        meetsParis: false,
        emissionsChangeFromBaseYear: 12.5,
      },
    ]);
  });

  it("falls back per company when a row is missing from the KPI payload", () => {
    const missing = createCompany("2", "Other AB");
    const merged = mergeApiKpisOntoCompany(
      missing,
      buildCompanyKpiLookup(apiKpis),
    );

    expect(merged.meetsParis).toBe(false);
    expect(merged.emissionsChangeFromBaseYear).toBe(12.5);
  });
});
