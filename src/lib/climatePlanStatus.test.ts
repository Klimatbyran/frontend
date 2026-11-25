import { describe, expect, it } from "vitest";
import {
  climatePlanStatusLabel,
  climatePlanStatusTone,
} from "./climatePlanStatus";

describe("climatePlanStatusLabel", () => {
  const strings = {
    adopted: (year: number) => `Antagen ${year}`,
    noYear: "Plan utan angivet år",
    missing: "Saknar klimatplan",
  };

  it("uses adopted year when present", () => {
    expect(
      climatePlanStatusLabel({
        year: 2024,
        link: "https://example.test/a.pdf",
        ...strings,
      }),
    ).toBe("Antagen 2024");
  });

  it("says plan without year when link exists but year is missing", () => {
    expect(
      climatePlanStatusLabel({
        year: null,
        link: "https://example.test/a.pdf",
        ...strings,
      }),
    ).toBe("Plan utan angivet år");
  });

  it("says missing when there is no link and no year", () => {
    expect(
      climatePlanStatusLabel({
        year: null,
        link: null,
        ...strings,
      }),
    ).toBe("Saknar klimatplan");
  });
});

describe("climatePlanStatusTone", () => {
  it("returns noYear for link without year", () => {
    expect(climatePlanStatusTone(null, "https://example.test/a.pdf")).toBe(
      "noYear",
    );
  });
});
