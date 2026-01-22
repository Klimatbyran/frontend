import type { ReportingPeriod } from "@/types/company";
import { mapCompanyEditFormToRequestBody } from "./company-edit";

// --- Helpers and Factories ---
const baseMeta = {
  id: "meta",
  comment: null,
  source: null,
  updatedAt: "2022-01-01T00:00:00.000Z",
  user: { name: "Test User" },
  verifiedBy: null,
};

function makeCategory(overrides: any = {}) {
  return {
    id: "cat",
    category: 1,
    total: 10,
    unit: ("tCO2e" as "tCO2e" | "tCO2" | null),
    metadata: baseMeta,
    ...overrides,
  } as {
    id: string;
    category: number;
    total: number;
    unit: "tCO2e" | "tCO2" | null;
    metadata: typeof baseMeta;
  };
}

function makeBasePeriod(overrides = {}): ReportingPeriod {
  return {
    id: "1",
    startDate: "2022-01-01T00:00:00.000Z",
    endDate: "2022-12-31T00:00:00.000Z",
    reportURL: null,
    emissions: {
      id: "em1",
      calculatedTotalEmissions: 100,
      scope1: { id: "s1", total: 10, unit: "tCO2e", metadata: baseMeta },
      scope2: {
        id: "s2",
        mb: 5,
        lb: 6,
        unknown: 7,
        unit: "tCO2e",
        calculatedTotalEmissions: 18,
        metadata: baseMeta,
      },
      scope3: {
        id: "s3",
        calculatedTotalEmissions: 80,
        metadata: baseMeta,
        statedTotalEmissions: null,
        categories: [makeCategory()],
      },
      scope1And2: null,
      biogenicEmissions: null,
      statedTotalEmissions: null,
    },
    economy: null,
    ...overrides,
  };
}

function form(entries: [string, string][]) {
  return new Map(entries);
}

// --- Tests ---
describe("mapCompanyEditFormToRequestBody", () => {
  const basePeriod = makeBasePeriod();

  it("should not include emissions if no changes", () => {
    const result = mapCompanyEditFormToRequestBody([basePeriod], form([]));
    expect(result.reportingPeriods.length).toBe(0);
  });

  describe("scope1", () => {
    it("should include changed scope1 total", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([["scope-1-1", "42"]]),
      );
      expect(result.reportingPeriods[0].emissions.scope1).toEqual({
        total: 42,
        unit: "tCO2e",
        verified: false,
      });
    });

    it("should preserve decimal values for scope1 total", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([["scope-1-1", "42.75"]]),
      );
      expect(result.reportingPeriods[0].emissions.scope1).toEqual({
        total: 42.75,
        unit: "tCO2e",
        verified: false,
      });
    });

    it("should include verified true if changed from false", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([
          ["scope-1-1", "10"],
          ["scope-1-1-checkbox", "true"],
        ]),
      );
      expect(result.reportingPeriods[0].emissions.scope1.verified).toBe(true);
    });

    it("should not include verified if unchecked (originally false)", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([["scope-1-1", "10"]]),
      );
      expect(result.reportingPeriods[0].emissions.scope1.verified).toBe(false);
    });

    it("should only send verified for scope1 if only verified is changed", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([["scope-1-1-checkbox", "true"]]),
      );
      expect(result.reportingPeriods[0].emissions.scope1).toEqual({
        verified: true,
      });
    });

    it("should send null for scope1 total if cleared", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([["scope-1-1", ""]]),
      );
      expect(result.reportingPeriods[0].emissions.scope1).toEqual({
        total: null,
        unit: "tCO2e",
        verified: false,
      });
    });

    it("should send 0 for scope1 total if value is set to '0'", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([["scope-1-1", "0"]]),
      );
      expect(result.reportingPeriods[0].emissions.scope1.total).toBe(0);
    });

    it("should preserve original unit when updating scope1", () => {
      const periodWithTCO2 = makeBasePeriod({
        emissions: {
          ...basePeriod.emissions!,
          scope1: { id: "s1", total: 10, unit: "tCO2", metadata: baseMeta },
        },
      });
      const result = mapCompanyEditFormToRequestBody(
        [periodWithTCO2],
        form([["scope-1-1", "42"]]),
      );
      expect(result.reportingPeriods[0].emissions.scope1.unit).toBe("tCO2");
    });
  });

  describe("scope2", () => {
    it("should only include changed scope2 values", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([["scope-2-mb-1", "99"]]),
      );
      expect(result.reportingPeriods[0].emissions.scope2.mb).toBe(99);
      expect(result.reportingPeriods[0].emissions.scope2.lb).toBeUndefined();
      expect(
        result.reportingPeriods[0].emissions.scope2.unknown,
      ).toBeUndefined();
      expect(result.reportingPeriods[0].emissions.scope2.unit).toBe("tCO2e");
    });

    it("should preserve decimal values for scope2 mb", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([["scope-2-mb-1", "99.123"]]),
      );
      expect(result.reportingPeriods[0].emissions.scope2.mb).toBe(99.123);
    });

    it("should send null for scope2 mb if cleared", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([["scope-2-mb-1", ""]]),
      );
      expect(result.reportingPeriods[0].emissions.scope2.mb).toBeNull();
    });

    it("should send null for scope2 lb if cleared", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([["scope-2-lb-1", ""]]),
      );
      expect(result.reportingPeriods[0].emissions.scope2.lb).toBeNull();
    });

    it("should send null for scope2 unknown if cleared", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([["scope-2-unknown-1", ""]]),
      );
      expect(result.reportingPeriods[0].emissions.scope2.unknown).toBeNull();
    });

    it("should send 0 for scope2 mb if value is set to '0'", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([["scope-2-mb-1", "0"]]),
      );
      expect(result.reportingPeriods[0].emissions.scope2.mb).toBe(0);
    });

    it("should preserve original unit when updating scope2", () => {
      const periodWithTCO2 = makeBasePeriod({
        emissions: {
          ...basePeriod.emissions!,
          scope2: {
            id: "s2",
            mb: 5,
            lb: 6,
            unknown: 7,
            unit: "tCO2",
            calculatedTotalEmissions: 18,
            metadata: baseMeta,
          },
        },
      });
      const result = mapCompanyEditFormToRequestBody(
        [periodWithTCO2],
        form([["scope-2-mb-1", "99"]]),
      );
      expect(result.reportingPeriods[0].emissions.scope2.unit).toBe("tCO2");
    });
  });

  describe("scope3 categories", () => {
    it("should include scope3 category if changed", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([["scope-3-1-1", "123"]]),
      );
      expect(result.reportingPeriods[0].emissions.scope3.categories[0]).toEqual(
        {
          category: 1,
          total: 123,
          unit: "tCO2e",
        },
      );
    });

    it("should only send verified for existing value if only verified is changed", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([["scope-3-1-1-checkbox", "true"]]),
      );
      expect(result.reportingPeriods[0].emissions.scope3.categories).toEqual([
        { category: 1, unit: "tCO2e", verified: true },
      ]);
    });

    it("should send total (and verified if checked) for previously null category", () => {
      const periodWithNullCat = makeBasePeriod({
        emissions: {
          ...basePeriod.emissions!,
          scope3: {
            ...basePeriod.emissions!.scope3!,
            categories: [
              ...basePeriod.emissions!.scope3!.categories!,
              makeCategory({ id: "c3", category: 3, total: undefined as any }),
            ],
          },
        },
      });
      // Add value only
      let result = mapCompanyEditFormToRequestBody(
        [periodWithNullCat],
        form([["scope-3-1-3", "77"]]),
      );
      expect(result.reportingPeriods[0].emissions.scope3.categories).toEqual([
        { category: 3, total: 77, unit: "tCO2e" },
      ]);
      // Add value and verified
      result = mapCompanyEditFormToRequestBody(
        [periodWithNullCat],
        form([
          ["scope-3-1-3", "88"],
          ["scope-3-1-3-checkbox", "true"],
        ]),
      );
      expect(result.reportingPeriods[0].emissions.scope3.categories).toEqual([
        { category: 3, total: 88, unit: "tCO2e", verified: true },
      ]);
    });

    it("should combine value and verified changes into one object", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([
          ["scope-3-1-1", "111"],
          ["scope-3-1-1-checkbox", "true"],
        ]),
      );
      expect(result.reportingPeriods[0].emissions.scope3.categories).toEqual([
        { category: 1, total: 111, unit: "tCO2e", verified: true },
      ]);
    });

    it("should never send duplicate category objects", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([
          ["scope-3-1-1", "111"],
          ["scope-3-1-1-checkbox", "true"],
          ["scope-3-1-2", "222"],
          ["scope-3-1-2-checkbox", "true"],
        ]),
      );
      const cats = result.reportingPeriods[0].emissions.scope3.categories;
      expect(cats.length).toBe(2);
      expect(cats).toContainEqual({ category: 1, total: 111, unit: "tCO2e", verified: true });
      expect(cats).toContainEqual({ category: 2, total: 222, unit: "tCO2e", verified: true });
    });

    it("should not send anything for scope3 category if only verified is checked and original value is undefined", () => {
      const periodWithNullCat = makeBasePeriod({
        emissions: {
          ...basePeriod.emissions!,
          scope3: {
            ...basePeriod.emissions!.scope3!,
            categories: [
              ...basePeriod.emissions!.scope3!.categories!,
              makeCategory({ id: "c3", category: 3, total: undefined as any }),
            ],
          },
        },
      });
      const result = mapCompanyEditFormToRequestBody(
        [periodWithNullCat],
        form([["scope-3-1-3-checkbox", "true"]]),
      );
      expect(
        (result.reportingPeriods[0].emissions.scope3.categories || []).find(
          (c: any) => c.category === 3,
        ),
      ).toBeUndefined();
    });

    it("should send null for scope3 category total if cleared", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([["scope-3-1-1", ""]]),
      );
      expect(result.reportingPeriods[0].emissions.scope3.categories[0]).toEqual(
        {
          category: 1,
          total: null,
          unit: "tCO2e",
        },
      );
    });

    it("should send 0 for scope3 category if value is set to '0'", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([["scope-3-1-1", "0"]]),
      );
      expect(result.reportingPeriods[0].emissions.scope3.categories[0]).toEqual(
        {
          category: 1,
          total: 0,
          unit: "tCO2e",
        },
      );
    });

    it("should preserve original unit when updating scope3 category", () => {
      const periodWithTCO2 = makeBasePeriod({
        emissions: {
          ...basePeriod.emissions!,
          scope3: {
            ...basePeriod.emissions!.scope3!,
            categories: [makeCategory({ unit: "tCO2" })],
          },
        },
      });
      const result = mapCompanyEditFormToRequestBody(
        [periodWithTCO2],
        form([["scope-3-1-1", "123"]]),
      );
      expect(result.reportingPeriods[0].emissions.scope3.categories[0].unit).toBe("tCO2");
    });
  });

  describe("scope3 statedTotalEmissions", () => {
    it("should include scope3 statedTotalEmissions if changed", () => {
      const result = mapCompanyEditFormToRequestBody(
        [basePeriod],
        form([
          ["scope-3-statedTotalEmissions-1", "555"],
          ["scope-3-statedTotalEmissions-1-checkbox", "true"],
        ]),
      );
      expect(
        result.reportingPeriods[0].emissions.scope3.statedTotalEmissions,
      ).toEqual({
        total: 555,
        unit: "tCO2e",
        verified: true,
      });
    });

    it("should only send verified for statedTotalEmissions if only verified is changed", () => {
      const periodWithStatedTotal = makeBasePeriod({
        emissions: {
          ...basePeriod.emissions!,
          scope3: {
            ...basePeriod.emissions!.scope3!,
            statedTotalEmissions: {
              id: "st1",
              total: 123,
              unit: "tCO2e",
              metadata: baseMeta,
            },
          },
        },
      });
      const result = mapCompanyEditFormToRequestBody(
        [periodWithStatedTotal],
        form([["scope-3-statedTotalEmissions-1-checkbox", "true"]]),
      );
      expect(
        result.reportingPeriods[0].emissions.scope3.statedTotalEmissions,
      ).toEqual({
        verified: true,
      });
    });

    it("should send null for statedTotalEmissions total if cleared", () => {
      const periodWithStatedTotal = makeBasePeriod({
        emissions: {
          ...basePeriod.emissions!,
          scope3: {
            ...basePeriod.emissions!.scope3!,
            statedTotalEmissions: {
              id: "st1",
              total: 123,
              unit: "tCO2e",
              metadata: baseMeta,
            },
          },
        },
      });
      const result = mapCompanyEditFormToRequestBody(
        [periodWithStatedTotal],
        form([["scope-3-statedTotalEmissions-1", ""]]),
      );
      expect(
        result.reportingPeriods[0].emissions.scope3.statedTotalEmissions.total,
      ).toBeNull();
    });

    it("should send 0 for statedTotalEmissions total if value is set to '0'", () => {
      const periodWithStatedTotal = makeBasePeriod({
        emissions: {
          ...basePeriod.emissions!,
          scope3: {
            ...basePeriod.emissions!.scope3!,
            statedTotalEmissions: {
              id: "st1",
              total: 123,
              unit: "tCO2e",
              metadata: baseMeta,
            },
          },
        },
      });
      const result = mapCompanyEditFormToRequestBody(
        [periodWithStatedTotal],
        form([["scope-3-statedTotalEmissions-1", "0"]]),
      );
      expect(
        result.reportingPeriods[0].emissions.scope3.statedTotalEmissions.total,
      ).toBe(0);
    });

    it("should preserve original unit when updating scope3 statedTotalEmissions", () => {
      const periodWithTCO2 = makeBasePeriod({
        emissions: {
          ...basePeriod.emissions!,
          scope3: {
            ...basePeriod.emissions!.scope3!,
            statedTotalEmissions: {
              id: "st1",
              total: 123,
              unit: "tCO2",
              metadata: baseMeta,
            },
          },
        },
      });
      const result = mapCompanyEditFormToRequestBody(
        [periodWithTCO2],
        form([["scope-3-statedTotalEmissions-1", "555"]]),
      );
      expect(
        result.reportingPeriods[0].emissions.scope3.statedTotalEmissions.unit,
      ).toBe("tCO2");
    });
  });

  it("should not include emissions if only unrelated fields are changed", () => {
    const result = mapCompanyEditFormToRequestBody(
      [basePeriod],
      form([["comment", "hello"]]),
    );
    expect(result.reportingPeriods.length).toBe(0);
    expect(result.metadata.comment).toBe("hello");
  });

  describe("new fields", () => {
    describe("statedTotalEmissions (at emissions level)", () => {
      it("should include statedTotalEmissions if changed", () => {
        const result = mapCompanyEditFormToRequestBody(
          [basePeriod],
          form([["stated-total-1", "555"]]),
        );
        expect(
          result.reportingPeriods[0].emissions.statedTotalEmissions.total,
        ).toBe(555);
        expect(
          result.reportingPeriods[0].emissions.statedTotalEmissions.unit,
        ).toBe("tCO2e");
      });

      it("should send null for statedTotalEmissions total if cleared", () => {
        const periodWithStatedTotal = makeBasePeriod({
          emissions: {
            ...basePeriod.emissions!,
            statedTotalEmissions: {
              id: "st1",
              total: 123,
              unit: "tCO2e",
              metadata: baseMeta,
            },
          },
        });
        const result = mapCompanyEditFormToRequestBody(
          [periodWithStatedTotal],
          form([["stated-total-1", ""]]),
        );
        expect(
          result.reportingPeriods[0].emissions.statedTotalEmissions.total,
        ).toBeNull();
      });

      it("should preserve original unit when updating statedTotalEmissions", () => {
        const periodWithTCO2 = makeBasePeriod({
          emissions: {
            ...basePeriod.emissions!,
            statedTotalEmissions: {
              id: "st1",
              total: 123,
              unit: "tCO2",
              metadata: baseMeta,
            },
          },
        });
        const result = mapCompanyEditFormToRequestBody(
          [periodWithTCO2],
          form([["stated-total-1", "555"]]),
        );
        expect(
          result.reportingPeriods[0].emissions.statedTotalEmissions.unit,
        ).toBe("tCO2");
      });
    });

    describe("scope1And2", () => {
      it("should include scope1And2 if changed", () => {
        const result = mapCompanyEditFormToRequestBody(
          [basePeriod],
          form([["scope-1-and-2-1", "100"]]),
        );
        expect(result.reportingPeriods[0].emissions.scope1And2.total).toBe(100);
        expect(result.reportingPeriods[0].emissions.scope1And2.unit).toBe("tCO2e");
      });

      it("should preserve original unit when updating scope1And2", () => {
        const periodWithTCO2 = makeBasePeriod({
          emissions: {
            ...basePeriod.emissions!,
            scope1And2: {
              id: "s12",
              total: 50,
              unit: "tCO2",
              metadata: baseMeta,
            },
          },
        });
        const result = mapCompanyEditFormToRequestBody(
          [periodWithTCO2],
          form([["scope-1-and-2-1", "100"]]),
        );
        expect(result.reportingPeriods[0].emissions.scope1And2.unit).toBe("tCO2");
      });
    });

    describe("reportURL", () => {
      it("should include reportURL if changed", () => {
        const result = mapCompanyEditFormToRequestBody(
          [basePeriod],
          form([["report-url-1", "https://example.com/report"]]),
        );
        expect(result.reportingPeriods[0].reportURL).toBe(
          "https://example.com/report",
        );
      });
    });

    describe("turnover", () => {
      it("should include turnover if changed", () => {
        const result = mapCompanyEditFormToRequestBody(
          [basePeriod],
          form([
            ["turnover-value-1", "1000000"],
            ["turnover-currency-1", "SEK"],
          ]),
        );
        expect(result.reportingPeriods[0].economy.turnover.value).toBe(1000000);
        expect(result.reportingPeriods[0].economy.turnover.currency).toBe(
          "SEK",
        );
      });
    });

    describe("employees", () => {
      it("should include employees if changed", () => {
        const result = mapCompanyEditFormToRequestBody(
          [basePeriod],
          form([
            ["employees-value-1", "500"],
            ["employees-unit-1", "people"],
          ]),
        );
        expect(result.reportingPeriods[0].economy.employees.value).toBe(500);
        expect(result.reportingPeriods[0].economy.employees.unit).toBe(
          "people",
        );
      });
    });
  });
});
