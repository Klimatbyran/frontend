import { Packer } from "docx";
import { describe, expect, it } from "vitest";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import {
  buildClimatePlanDocument,
  climatePlanDocumentLines,
} from "./climatePlanDocument";
import {
  CLIMATE_PLAN_STEPS,
  resolveClimatePlanAnswers,
} from "./climatePlanContent";
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

    expect(figures.stats[0]?.caption).toBe("2023, inom kommungränsen");
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

  it("ignores an emissions year that is not a number", () => {
    const figures = buildClimatePlanFigures(
      {
        ...municipality,
        emissions: [{ year: "okänt", value: 10 }],
      },
      undefined,
    );

    expect(figures.stats[0]?.caption).toBe("Inom kommungränsen");
    expect(figures.stats[0]?.value).not.toContain("NaN");
  });
});

describe("resolveClimatePlanAnswers", () => {
  it("keeps a typed value when Klimatkollen has no number, and drops it when no municipality is chosen", () => {
    const kept = resolveClimatePlanAnswers(
      { "kpi-total": "12", pledge: "Ett löfte" },
      { "kpi-total": "" },
    );
    expect(kept["kpi-total"]).toBe("12");
    expect(kept.pledge).toBe("Ett löfte");

    const cleared = resolveClimatePlanAnswers(
      { "kpi-total": "12", pledge: "Ett löfte" },
      null,
    );
    expect(cleared["kpi-total"]).toBe("");
    expect(cleared.pledge).toBe("Ett löfte");
  });

  it("uses the Klimatkollen value when one exists", () => {
    const resolved = resolveClimatePlanAnswers(
      { "kpi-total": "12" },
      { "kpi-total": "480" },
    );
    expect(resolved["kpi-total"]).toBe("480");
  });
});

describe("climate plan steps", () => {
  it("gives every step and field its own id", () => {
    const stepIds = CLIMATE_PLAN_STEPS.map((step) => step.id);
    const fieldIds = CLIMATE_PLAN_STEPS.flatMap((step) =>
      step.fields.map((field) => field.id),
    );
    expect(new Set(stepIds).size).toBe(stepIds.length);
    expect(new Set(fieldIds).size).toBe(fieldIds.length);
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
    const pledge =
      "Kommunstyrelsen, 2030, halvera resorna med bil, via klimatkontrakt";
    expect(lines).toContain("Offentligt åtagande");
    expect(lines).toContain(pledge);
    expect(lines).not.toContain(`Offentligt åtagande: ${pledge}`);
    expect(
      lines.filter((line) => line.includes("Offentligt åtagande")),
    ).toEqual(["Offentligt åtagande"]);
    expect(lines).toContain("Visionen");
    expect(lines).toContain("Ej ifyllt");
    expect(lines).not.toContain("Visionen: Ej ifyllt");
    expect(lines).toContain("Bolagsstyrning: Ja");
    const situation = "Nuläget: klimatpåverkan och utsatthet";
    expect(lines.filter((line) => line.includes(situation))).toEqual([
      `Del 1 · ${situation}`,
    ]);
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
