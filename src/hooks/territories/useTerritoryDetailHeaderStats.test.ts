import { describe, expect, it } from "vitest";
import { createEmissionsPerCapitaStat } from "./useTerritoryDetailHeaderStats";

describe("createEmissionsPerCapitaStat", () => {
  const t = (key: string) => key;

  it("formats emissions per capita with default labels", () => {
    const stat = createEmissionsPerCapitaStat(5.4, "en", t);

    expect(stat.label).toBe("detailPage.emissionsPerCapita");
    expect(stat.value).toBe("5.4");
    expect(stat.unit).toBe("detailPage.emissionsPerCapitaUnit");
    expect(stat.valueClassName).toBe("text-orange-2");
  });

  it("supports custom label, unit, and tooltip", () => {
    const stat = createEmissionsPerCapitaStat(5.4, "en", t, {
      label: "Custom label",
      unit: " tCO₂e",
      infoText: "Custom tooltip",
    });

    expect(stat.label).toBe("Custom label");
    expect(stat.unit).toBe(" tCO₂e");
    expect(stat.info).toBe(true);
    expect(stat.infoText).toBe("Custom tooltip");
  });
});
