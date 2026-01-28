import { describe, it, expect } from "vitest";
import type { CompanyDetails } from "@/types/company";
import type { Municipality } from "@/types/municipality";
import {
  truncateDescription,
  buildCompanySeoDescription,
  buildMunicipalitySeoDescription,
  generateCompanySeoMeta,
  generateMunicipalitySeoMeta,
} from "../entitySeo";

describe("truncateDescription", () => {
  it("should return text unchanged if under max length", () => {
    const text = "Short text";
    expect(truncateDescription(text, 160)).toBe("Short text");
  });

  it("should truncate text that exceeds max length", () => {
    const text = "a".repeat(200);
    const result = truncateDescription(text, 160);
    expect(result.length).toBeLessThanOrEqual(163); // 160 + "..."
    expect(result).toContain("...");
  });

  it("should truncate at word boundary when possible", () => {
    const text =
      "This is a very long description that should be truncated at a word boundary rather than in the middle of a word";
    const result = truncateDescription(text, 50);
    expect(result).toContain("...");
    expect(result.length).toBeLessThanOrEqual(53);
    // Should end at a word boundary
    const lastWord = result.split(" ").pop();
    expect(lastWord).toBeTruthy();
  });

  it("should handle text with no spaces", () => {
    const text = "a".repeat(200);
    const result = truncateDescription(text, 160);
    expect(result.length).toBe(163); // 160 + "..."
    expect(result).toBe("a".repeat(160) + "...");
  });

  it("should use default max length of 160", () => {
    const text = "a".repeat(200);
    const result = truncateDescription(text);
    expect(result.length).toBeLessThanOrEqual(163);
  });

  it("should handle empty string", () => {
    expect(truncateDescription("", 160)).toBe("");
  });

  it("should handle exactly max length", () => {
    const text = "a".repeat(160);
    expect(truncateDescription(text, 160)).toBe(text);
  });
});

describe("buildCompanySeoDescription", () => {
  const mockCompany: CompanyDetails = {
    name: "Test Company",
    reportingPeriods: [
      {
        endDate: "2023-12-31",
        emissions: {
          calculatedTotalEmissions: 1500,
        },
      },
    ],
  } as CompanyDetails;

  it("should build description with company name", () => {
    const result = buildCompanySeoDescription(mockCompany);
    expect(result).toContain("Test Company");
  });

  it("should include industry when provided", () => {
    const result = buildCompanySeoDescription(mockCompany, "Technology");
    expect(result).toContain("Technology");
    expect(result).toContain("industry");
  });

  it("should include emissions data when available", () => {
    const result = buildCompanySeoDescription(mockCompany, undefined, 2023);
    expect(result).toContain("reported");
    expect(result).toContain("2023");
  });

  it("should format large emissions in thousands", () => {
    const result = buildCompanySeoDescription(mockCompany);
    expect(result).toContain("thousand");
  });

  it("should format small emissions without thousands", () => {
    const smallCompany: CompanyDetails = {
      ...mockCompany,
      reportingPeriods: [
        {
          endDate: "2023-12-31",
          emissions: {
            calculatedTotalEmissions: 500,
          },
        },
      ],
    } as CompanyDetails;
    const result = buildCompanySeoDescription(smallCompany);
    expect(result).toContain("500.0");
    expect(result).not.toContain("thousand");
  });

  it("should handle missing emissions data", () => {
    const noEmissionsCompany: CompanyDetails = {
      ...mockCompany,
      reportingPeriods: [
        {
          endDate: "2023-12-31",
          emissions: {
            calculatedTotalEmissions: undefined,
          },
        },
      ],
    } as CompanyDetails;
    const result = buildCompanySeoDescription(noEmissionsCompany);
    expect(result).toContain("Test Company");
    expect(result).toContain("Klimatkollen");
  });

  it("should truncate to max length", () => {
    const longNameCompany: CompanyDetails = {
      ...mockCompany,
      name: "A".repeat(200),
    } as CompanyDetails;
    const result = buildCompanySeoDescription(longNameCompany);
    expect(result.length).toBeLessThanOrEqual(163); // 160 + "..."
  });

  it("should handle null emissions", () => {
    const nullEmissionsCompany: CompanyDetails = {
      ...mockCompany,
      reportingPeriods: [
        {
          endDate: "2023-12-31",
          emissions: {
            calculatedTotalEmissions: null as any,
          },
        },
      ],
    } as CompanyDetails;
    const result = buildCompanySeoDescription(nullEmissionsCompany);
    expect(result).toContain("Test Company");
  });
});

describe("buildMunicipalitySeoDescription", () => {
  const mockMunicipality: Municipality = {
    name: "Stockholm",
    region: "Stockholm County",
    meetsParisGoal: true,
    totalTrend: 100,
    totalCarbonLaw: 100,
    historicalEmissionChangePercent: -5,
    climatePlan: true,
    climatePlanYear: 2020,
    climatePlanComment: null,
    climatePlanLink: null,
    electricVehiclePerChargePoints: 5,
    bicycleMetrePerCapita: 10,
    procurementScore: 2,
    procurementLink: null,
    totalConsumptionEmission: 1000,
    electricCarChangePercent: 10,
    emissions: [],
    approximatedHistoricalEmission: [],
    trend: [],
    logoUrl: null,
    politicalRule: [],
    politicalKSO: "",
  };

  it("should build description with municipality name", () => {
    const result = buildMunicipalitySeoDescription(mockMunicipality);
    expect(result).toContain("Stockholm");
  });

  it("should include region when available", () => {
    const result = buildMunicipalitySeoDescription(mockMunicipality);
    expect(result).toContain("Stockholm County");
  });

  it("should include emissions when provided", () => {
    const result = buildMunicipalitySeoDescription(
      mockMunicipality,
      2023,
      "1,500 tCO₂e",
    );
    expect(result).toContain("1,500 tCO₂e");
    expect(result).toContain("2023");
  });

  it("should include Paris Agreement status", () => {
    const result = buildMunicipalitySeoDescription(mockMunicipality);
    expect(result).toContain("meets Paris Agreement goals");
  });

  it("should handle municipality that does not meet Paris goals", () => {
    const notMeeting: Municipality = {
      ...mockMunicipality,
      meetsParisGoal: false,
    };
    const result = buildMunicipalitySeoDescription(notMeeting);
    expect(result).toContain("does not meet Paris Agreement goals");
  });

  it("should handle missing emissions data", () => {
    const result = buildMunicipalitySeoDescription(mockMunicipality);
    expect(result).toContain("Stockholm");
    expect(result).toContain("Klimatkollen");
  });

  it("should handle 'No data available' emissions string", () => {
    const result = buildMunicipalitySeoDescription(
      mockMunicipality,
      undefined,
      "No data available",
    );
    expect(result).not.toContain("No data available");
  });

  it("should truncate to max length", () => {
    const longNameMunicipality: Municipality = {
      ...mockMunicipality,
      name: "A".repeat(200),
    };
    const result = buildMunicipalitySeoDescription(longNameMunicipality);
    expect(result.length).toBeLessThanOrEqual(163);
  });

  it("should handle missing region", () => {
    const noRegion: Municipality = {
      ...mockMunicipality,
      region: "",
    };
    const result = buildMunicipalitySeoDescription(noRegion);
    expect(result).toContain("Stockholm");
    expect(result).not.toContain("in ");
  });
});

describe("generateCompanySeoMeta", () => {
  const mockCompany: CompanyDetails = {
    name: "Test Company",
    reportingPeriods: [
      {
        endDate: "2023-12-31",
        emissions: {
          calculatedTotalEmissions: 1500,
        },
      },
    ],
  } as CompanyDetails;

  it("should generate SEO meta with correct title format", () => {
    const result = generateCompanySeoMeta(mockCompany, "/companies/123");
    expect(result.title).toBe("Test Company - Klimatkollen");
  });

  it("should include description", () => {
    const result = generateCompanySeoMeta(mockCompany, "/companies/123");
    expect(result.description).toBeTruthy();
    expect(result.description?.length).toBeLessThanOrEqual(163);
  });

  it("should set canonical URL", () => {
    const result = generateCompanySeoMeta(mockCompany, "/companies/123");
    expect(result.canonical).toBe("/companies/123");
  });

  it("should include OG tags", () => {
    const result = generateCompanySeoMeta(mockCompany, "/companies/123");
    expect(result.og).toBeDefined();
    expect(result.og?.title).toBe("Test Company - Klimatkollen");
    expect(result.og?.description).toBe(result.description);
    expect(result.og?.type).toBe("website");
  });

  it("should include Twitter tags", () => {
    const result = generateCompanySeoMeta(mockCompany, "/companies/123");
    expect(result.twitter).toBeDefined();
    expect(result.twitter?.card).toBe("summary_large_image");
    expect(result.twitter?.title).toBe("Test Company - Klimatkollen");
    expect(result.twitter?.description).toBe(result.description);
  });

  it("should use industry and year when provided", () => {
    const result = generateCompanySeoMeta(mockCompany, "/companies/123", {
      industry: "Technology",
      latestYear: 2023,
    });
    expect(result.description).toContain("Technology");
  });
});

describe("generateMunicipalitySeoMeta", () => {
  const mockMunicipality: Municipality = {
    name: "Stockholm",
    region: "Stockholm County",
    meetsParisGoal: true,
    totalTrend: 100,
    totalCarbonLaw: 100,
    historicalEmissionChangePercent: -5,
    climatePlan: true,
    climatePlanYear: 2020,
    climatePlanComment: null,
    climatePlanLink: null,
    electricVehiclePerChargePoints: 5,
    bicycleMetrePerCapita: 10,
    procurementScore: 2,
    procurementLink: null,
    totalConsumptionEmission: 1000,
    electricCarChangePercent: 10,
    emissions: [],
    approximatedHistoricalEmission: [],
    trend: [],
    logoUrl: null,
    politicalRule: [],
    politicalKSO: "",
  };

  it("should generate SEO meta with correct title format", () => {
    const result = generateMunicipalitySeoMeta(
      mockMunicipality,
      "/municipalities/stockholm",
    );
    expect(result.title).toBe("Stockholm - Klimatkollen");
  });

  it("should include description", () => {
    const result = generateMunicipalitySeoMeta(
      mockMunicipality,
      "/municipalities/stockholm",
    );
    expect(result.description).toBeTruthy();
    expect(result.description?.length).toBeLessThanOrEqual(163);
  });

  it("should set canonical URL", () => {
    const result = generateMunicipalitySeoMeta(
      mockMunicipality,
      "/municipalities/stockholm",
    );
    expect(result.canonical).toBe("/municipalities/stockholm");
  });

  it("should include OG tags", () => {
    const result = generateMunicipalitySeoMeta(
      mockMunicipality,
      "/municipalities/stockholm",
    );
    expect(result.og).toBeDefined();
    expect(result.og?.title).toBe("Stockholm - Klimatkollen");
    expect(result.og?.description).toBe(result.description);
    expect(result.og?.type).toBe("website");
  });

  it("should include Twitter tags", () => {
    const result = generateMunicipalitySeoMeta(
      mockMunicipality,
      "/municipalities/stockholm",
    );
    expect(result.twitter).toBeDefined();
    expect(result.twitter?.card).toBe("summary_large_image");
    expect(result.twitter?.title).toBe("Stockholm - Klimatkollen");
    expect(result.twitter?.description).toBe(result.description);
  });

  it("should use emissions data when provided", () => {
    const result = generateMunicipalitySeoMeta(
      mockMunicipality,
      "/municipalities/stockholm",
      {
        lastYear: 2023,
        lastYearEmissionsTon: "1,500 tCO₂e",
      },
    );
    expect(result.description).toContain("1,500 tCO₂e");
    expect(result.description).toContain("2023");
  });
});
