import { Packer } from "docx";
import { describe, expect, it } from "vitest";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import {
  buildClimatePlanDocument,
  climatePlanDocumentLines,
} from "./climatePlanDocument";
import {
  buildClimatePlanFigures,
  type ClimatePlanMunicipality,
} from "./climatePlanFigures";

const municipality: ClimatePlanMunicipality = {
  name: "Uppsala",
  historicalEmissionChangePercent: -18,
  electricCarChangePercent: 24,
  climatePlanYear: 2022,
  bicycleMetrePerCapita: 3.4,
  totalConsumptionEmission: 6.2,
  electricVehiclePerChargePoints: 8,
  procurementScore: 2,
  emissions: [
    { year: 2015, value: 500000 },
    { year: 2023, value: 480000 },
  ],
};

describe("buildClimatePlanFigures", () => {
  it("fills Klimatkollen answers from the municipality", () => {
    const figures = buildClimatePlanFigures(municipality, {
      "2023": {
        Transporter: 42,
        Jordbruk: 18,
        "El och fjärrvärme": 40,
      },
    });

    expect(figures.year).toBe(2023);
    expect(figures.answers["kpi-total"]).toBe(
      formatEmissionsAbsolute(480000, "sv"),
    );
    expect(figures.answers["kpi-climate-plan"]).toBe("Antagen 2022");
    expect(figures.answers["kpi-procurement"]).toBe("Ja");
    expect(figures.answers["kpi-charge-points"]).toBe("8");
    expect(figures.answers["consumption-per-capita"]).toBe("6,2");
    expect(figures.sectors.map((sector) => sector.label)).toEqual([
      "Transporter",
      "El och fjärrvärme",
      "Jordbruk",
    ]);
    expect(figures.sectors.reduce((sum, sector) => sum + sector.share, 0)).toBe(
      100,
    );
  });

  it("says when a climate plan or charge points are missing", () => {
    const figures = buildClimatePlanFigures(
      {
        ...municipality,
        climatePlanYear: null,
        electricVehiclePerChargePoints: null,
        procurementScore: 0,
      },
      undefined,
    );

    expect(figures.answers["kpi-climate-plan"]).toBe("Saknar klimatplan");
    expect(figures.answers["kpi-charge-points"]).toBe("Saknar laddpunkter");
    expect(figures.answers["kpi-procurement"]).toBe("Nej");
    expect(figures.sectors).toEqual([]);
  });
});

describe("climatePlanDocumentLines", () => {
  it("includes the municipality, emissions, and written answers", () => {
    const figures = buildClimatePlanFigures(municipality, undefined);
    const lines = climatePlanDocumentLines({
      municipalityName: "Uppsala",
      figures,
      answers: {
        ...figures.answers,
        pledge:
          "Kommunstyrelsen, 2030, halvera resorna med bil, via klimatkontrakt",
      },
      checks: { "check-companies": true },
      createdAt: new Date("2026-11-17T12:00:00Z"),
    });

    expect(lines[0]).toBe("Klimatplan för Uppsala");
    expect(lines).toContain(
      "Offentligt åtagande: Kommunstyrelsen, 2030, halvera resorna med bil, via klimatkontrakt",
    );
    expect(lines).toContain("Bolagsstyrning: Ja");
    expect(lines).toContain("Visionen: Ej ifyllt");
    expect(lines.some((line) => line.startsWith("Totala utsläpp:"))).toBe(true);
  });

  it("builds a docx file", async () => {
    const figures = buildClimatePlanFigures(municipality, undefined);
    const buffer = await Packer.toBuffer(
      buildClimatePlanDocument({
        municipalityName: "Uppsala",
        figures,
        answers: figures.answers,
        checks: {},
        createdAt: new Date("2026-11-17T12:00:00Z"),
      }),
    );

    expect(buffer.subarray(0, 2).toString()).toBe("PK");
  });
});
