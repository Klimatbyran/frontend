import { mapCompanyEditFormToRequestBody } from "./company-edit";
import type { ReportingPeriod } from "@/types/company";

describe("mapCompanyEditFormToRequestBody", () => {
  const basePeriod: ReportingPeriod = {
    id: "1",
    startDate: "2022-01-01T00:00:00.000Z",
    endDate: "2022-12-31T00:00:00.000Z",
    reportURL: null,
    emissions: {
      calculatedTotalEmissions: 100,
      scope1: {
        total: 10,
        unit: "tCO2e",
        metadata: { verifiedBy: null },
      },
      scope2: {
        mb: 5,
        lb: 6,
        unknown: 7,
        unit: "tCO2e",
        calculatedTotalEmissions: 18,
        metadata: { verifiedBy: null },
      },
      scope3: {
        calculatedTotalEmissions: 80,
        metadata: { verifiedBy: null },
        statedTotalEmissions: null,
        categories: [
          { category: 1, total: 10, unit: "tCO2e" },
          { category: 2, total: 20, unit: "tCO2e" },
        ],
      },
    },
    economy: null,
  };

  it("should not include emissions if no changes", () => {
    const formData = new Map();
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(result.reportingPeriods.length).toBe(0);
  });

  it("should include changed scope1 total", () => {
    const formData = new Map([["scope-1-1", "42"]]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(result.reportingPeriods[0].emissions.scope1).toEqual({
      total: 42,
      verified: false,
    });
  });

  it("should include verified true if changed from false", () => {
    const formData = new Map([
      ["scope-1-1", "10"],
      ["scope-1-1-checkbox", "true"],
    ]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(result.reportingPeriods[0].emissions.scope1.verified).toBe(true);
  });

  it("should not include verified if unchecked (originally false)", () => {
    const formData = new Map([
      ["scope-1-1", "10"],
      // no checkbox key
    ]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(result.reportingPeriods[0].emissions.scope1.verified).toBe(false);
  });

  it("should only include changed scope2 values", () => {
    const formData = new Map([["scope-2-mb-1", "99"]]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(result.reportingPeriods[0].emissions.scope2.mb).toBe(99);
    expect(result.reportingPeriods[0].emissions.scope2.lb).toBeUndefined();
    expect(result.reportingPeriods[0].emissions.scope2.unknown).toBeUndefined();
  });

  it("should include scope3 category if changed", () => {
    const formData = new Map([["scope-3-1-1", "123"]]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(result.reportingPeriods[0].emissions.scope3.categories[0]).toEqual({
      category: 1,
      total: 123,
    });
  });

  it("should include scope3 statedTotalEmissions if changed", () => {
    const formData = new Map([
      ["scope-3-statedTotalEmissions-1", "555"],
      ["scope-3-statedTotalEmissions-1-checkbox", "true"],
    ]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(
      result.reportingPeriods[0].emissions.scope3.statedTotalEmissions,
    ).toEqual({
      total: 555,
      verified: true,
    });
  });

  it("should not include emissions if only unrelated fields are changed", () => {
    const formData = new Map([["comment", "hello"]]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(result.reportingPeriods.length).toBe(0);
    expect(result.metadata.comment).toBe("hello");
  });

  it("should only send verified for existing value if only verified is changed", () => {
    const formData = new Map([["scope-3-1-1-checkbox", "true"]]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(result.reportingPeriods[0].emissions.scope3.categories).toEqual([
      { category: 1, verified: true },
    ]);
  });

  it("should send total (and verified if checked) for previously null category", () => {
    // Simulate a period with a null category 3
    const periodWithNullCat: ReportingPeriod = {
      ...basePeriod,
      emissions: {
        ...basePeriod.emissions!,
        scope3: {
          ...basePeriod.emissions!.scope3!,
          categories: [
            ...basePeriod.emissions!.scope3!.categories!,
            { category: 3, total: undefined as any, unit: "tCO2e" },
          ],
        },
      },
    };
    // Add value only
    let formData = new Map([["scope-3-1-3", "77"]]);
    let result = mapCompanyEditFormToRequestBody([periodWithNullCat], formData);
    expect(result.reportingPeriods[0].emissions.scope3.categories).toEqual([
      { category: 3, total: 77 },
    ]);
    // Add value and verified
    formData = new Map([
      ["scope-3-1-3", "88"],
      ["scope-3-1-3-checkbox", "true"],
    ]);
    result = mapCompanyEditFormToRequestBody([periodWithNullCat], formData);
    expect(result.reportingPeriods[0].emissions.scope3.categories).toEqual([
      { category: 3, total: 88, verified: true },
    ]);
  });

  it("should combine value and verified changes into one object", () => {
    const formData = new Map([
      ["scope-3-1-1", "111"],
      ["scope-3-1-1-checkbox", "true"],
    ]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(result.reportingPeriods[0].emissions.scope3.categories).toEqual([
      { category: 1, total: 111, verified: true },
    ]);
  });

  it("should never send duplicate category objects", () => {
    // Simulate a user changing both value and verified for two categories
    const formData = new Map([
      ["scope-3-1-1", "111"],
      ["scope-3-1-1-checkbox", "true"],
      ["scope-3-1-2", "222"],
      ["scope-3-1-2-checkbox", "true"],
    ]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    const cats = result.reportingPeriods[0].emissions.scope3.categories;
    expect(cats.length).toBe(2);
    expect(cats).toContainEqual({ category: 1, total: 111, verified: true });
    expect(cats).toContainEqual({ category: 2, total: 222, verified: true });
  });

  it("should only send verified for scope1 if only verified is changed", () => {
    // Simulate only the checkbox being changed for scope1
    const formData = new Map([["scope-1-1-checkbox", "true"]]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(result.reportingPeriods[0].emissions.scope1).toEqual({
      verified: true,
    });
  });

  it("should only send verified for statedTotalEmissions if only verified is changed", () => {
    // Simulate a period with a statedTotalEmissions value
    const periodWithStatedTotal: ReportingPeriod = {
      ...basePeriod,
      emissions: {
        ...basePeriod.emissions!,
        scope3: {
          ...basePeriod.emissions!.scope3!,
          statedTotalEmissions: {
            total: 123,
            unit: "tCO2e",
            metadata: { verifiedBy: null },
          },
        },
      },
    };
    const formData = new Map([
      ["scope-3-statedTotalEmissions-1-checkbox", "true"],
    ]);
    const result = mapCompanyEditFormToRequestBody(
      [periodWithStatedTotal],
      formData,
    );
    expect(
      result.reportingPeriods[0].emissions.scope3.statedTotalEmissions,
    ).toEqual({
      verified: true,
    });
  });

  it("should send null for scope1 total if cleared", () => {
    const formData = new Map([["scope-1-1", ""]]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(result.reportingPeriods[0].emissions.scope1).toEqual({
      total: null,
      verified: false,
    });
  });

  it("should send null for scope2 mb if cleared", () => {
    const formData = new Map([["scope-2-mb-1", ""]]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(result.reportingPeriods[0].emissions.scope2.mb).toBeNull();
  });

  it("should send null for scope2 lb if cleared", () => {
    const formData = new Map([["scope-2-lb-1", ""]]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(result.reportingPeriods[0].emissions.scope2.lb).toBeNull();
  });

  it("should send null for scope2 unknown if cleared", () => {
    const formData = new Map([["scope-2-unknown-1", ""]]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(result.reportingPeriods[0].emissions.scope2.unknown).toBeNull();
  });

  it("should send null for scope3 category total if cleared", () => {
    const formData = new Map([["scope-3-1-1", ""]]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(result.reportingPeriods[0].emissions.scope3.categories[0]).toEqual({
      category: 1,
      total: null,
    });
  });

  it("should send null for statedTotalEmissions total if cleared", () => {
    const periodWithStatedTotal: ReportingPeriod = {
      ...basePeriod,
      emissions: {
        ...basePeriod.emissions!,
        scope3: {
          ...basePeriod.emissions!.scope3!,
          statedTotalEmissions: {
            total: 123,
            unit: "tCO2e",
            metadata: { verifiedBy: null },
          },
        },
      },
    };
    const formData = new Map([["scope-3-statedTotalEmissions-1", ""]]);
    const result = mapCompanyEditFormToRequestBody(
      [periodWithStatedTotal],
      formData,
    );
    expect(
      result.reportingPeriods[0].emissions.scope3.statedTotalEmissions.total,
    ).toBeNull();
  });

  it("should send null for all scope2 fields if all are cleared", () => {
    const formData = new Map([
      ["scope-2-mb-1", ""],
      ["scope-2-lb-1", ""],
      ["scope-2-unknown-1", ""],
    ]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(result.reportingPeriods[0].emissions.scope2.mb).toBeNull();
    expect(result.reportingPeriods[0].emissions.scope2.lb).toBeNull();
    expect(result.reportingPeriods[0].emissions.scope2.unknown).toBeNull();
  });

  it("should not send anything for scope3 category if only verified is checked and original value is undefined", () => {
    const periodWithNullCat: ReportingPeriod = {
      ...basePeriod,
      emissions: {
        ...basePeriod.emissions!,
        scope3: {
          ...basePeriod.emissions!.scope3!,
          categories: [
            ...basePeriod.emissions!.scope3!.categories!,
            { category: 3, total: undefined as any, unit: "tCO2e" },
          ],
        },
      },
    };
    const formData = new Map([["scope-3-1-3-checkbox", "true"]]);
    const result = mapCompanyEditFormToRequestBody(
      [periodWithNullCat],
      formData,
    );
    expect(
      (result.reportingPeriods[0].emissions.scope3.categories || []).find(
        (c: any) => c.category === 3,
      ),
    ).toBeUndefined();
  });

  it("should send 0 for scope3 category if value is set to '0'", () => {
    const formData = new Map([["scope-3-1-1", "0"]]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(result.reportingPeriods[0].emissions.scope3.categories[0]).toEqual({
      category: 1,
      total: 0,
    });
  });

  it("should send 0 for scope1 total if value is set to '0'", () => {
    const formData = new Map([["scope-1-1", "0"]]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(result.reportingPeriods[0].emissions.scope1.total).toBe(0);
  });

  it("should send 0 for statedTotalEmissions total if value is set to '0'", () => {
    const periodWithStatedTotal: ReportingPeriod = {
      ...basePeriod,
      emissions: {
        ...basePeriod.emissions!,
        scope3: {
          ...basePeriod.emissions!.scope3!,
          statedTotalEmissions: {
            total: 123,
            unit: "tCO2e",
            metadata: { verifiedBy: null },
          },
        },
      },
    };
    const formData = new Map([["scope-3-statedTotalEmissions-1", "0"]]);
    const result = mapCompanyEditFormToRequestBody(
      [periodWithStatedTotal],
      formData,
    );
    expect(
      result.reportingPeriods[0].emissions.scope3.statedTotalEmissions.total,
    ).toBe(0);
  });

  it("should send 0 for scope2 mb if value is set to '0'", () => {
    const formData = new Map([["scope-2-mb-1", "0"]]);
    const result = mapCompanyEditFormToRequestBody([basePeriod], formData);
    expect(result.reportingPeriods[0].emissions.scope2.mb).toBe(0);
  });
});
