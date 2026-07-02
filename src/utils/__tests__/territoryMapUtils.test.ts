import { DataItem } from "@/types/rankings";
import {
  buildTerritoryListEntries,
  findTerritoryIndexByMapName,
  findTerritoryMapDataItem,
  formatTerritoryKpiValue,
  getTerritoryKpiRawValue,
  getTerritoryListPage,
  getTerritoryMapFillColor,
  toRoutingEntityType,
  TERRITORY_MAP_COLORS,
  TerritoryKpi,
} from "../territoryMapUtils";

const emissionsKpi: TerritoryKpi = {
  label: "Utsläppen",
  key: "historicalEmissionChangePercent",
  unit: "%",
  higherIsBetter: false,
};

const booleanKpi: TerritoryKpi = {
  label: "Parisavtalet",
  key: "meetsParisGoal",
  unit: "",
  higherIsBetter: true,
  isBoolean: true,
  booleanLabels: {
    true: "Klarar Parisavtalet",
    false: "Missar Parisavtalet",
  },
};

describe("getTerritoryKpiRawValue", () => {
  it("returns numeric and boolean values as-is", () => {
    expect(
      getTerritoryKpiRawValue(
        { name: "A", historicalEmissionChangePercent: -2.5 },
        "historicalEmissionChangePercent",
      ),
    ).toBe(-2.5);
    expect(
      getTerritoryKpiRawValue(
        { name: "A", meetsParisGoal: true },
        "meetsParisGoal",
      ),
    ).toBe(true);
  });

  it("returns null for missing or invalid values", () => {
    expect(
      getTerritoryKpiRawValue({ name: "A" }, "historicalEmissionChangePercent"),
    ).toBeNull();
    expect(
      getTerritoryKpiRawValue(
        { name: "A", historicalEmissionChangePercent: null },
        "historicalEmissionChangePercent",
      ),
    ).toBeNull();
  });
});

describe("getTerritoryMapFillColor", () => {
  it("uses gradient end for true boolean values", () => {
    expect(
      getTerritoryMapFillColor(true, [], {
        higherIsBetter: true,
        isBoolean: true,
      }),
    ).toBe(TERRITORY_MAP_COLORS.gradientEnd);
  });

  it("uses gradient mid-low for false boolean values", () => {
    expect(
      getTerritoryMapFillColor(false, [], {
        higherIsBetter: true,
        isBoolean: true,
      }),
    ).toBe(TERRITORY_MAP_COLORS.gradientMidLow);
  });

  it("returns grey for null values", () => {
    expect(
      getTerritoryMapFillColor(null, [-5, 0, 5], {
        higherIsBetter: false,
        isBoolean: false,
      }),
    ).toBe(TERRITORY_MAP_COLORS.null);
  });
});

describe("formatTerritoryKpiValue", () => {
  it("formats numeric KPI values with unit", () => {
    expect(formatTerritoryKpiValue(-3.456, emissionsKpi)).toBe("-3.5 %");
  });

  it("formats boolean KPI values with labels", () => {
    expect(formatTerritoryKpiValue(true, booleanKpi)).toBe(
      "Klarar Parisavtalet",
    );
    expect(formatTerritoryKpiValue(false, booleanKpi)).toBe(
      "Missar Parisavtalet",
    );
  });

  it("returns fallback for null values", () => {
    expect(formatTerritoryKpiValue(null, emissionsKpi)).toBe("–");
  });
});

describe("findTerritoryMapDataItem", () => {
  const mapData: DataItem[] = [
    {
      id: "stockholms-lan",
      name: "stockholms-lan",
      displayName: "Stockholms län",
      historicalEmissionChangePercent: -1.2,
    },
    {
      id: "Göteborg",
      name: "Göteborg",
      displayName: "Göteborg",
      historicalEmissionChangePercent: 0.5,
    },
  ];

  it("matches by display name", () => {
    expect(
      findTerritoryMapDataItem(mapData, "Stockholms län", "stockholms-lan")?.id,
    ).toBe("stockholms-lan");
  });

  it("matches by map name", () => {
    expect(findTerritoryMapDataItem(mapData, "Göteborg", "Göteborg")?.id).toBe(
      "Göteborg",
    );
  });

  it("returns undefined when no item matches", () => {
    expect(
      findTerritoryMapDataItem(mapData, "Unknown", "unknown"),
    ).toBeUndefined();
  });
});

describe("findTerritoryIndexByMapName", () => {
  const territories = [
    {
      displayName: "Alpha",
      mapName: "Alpha",
      value: -1,
      formattedValue: "-1.0 %",
      fillColor: "#000",
    },
    {
      displayName: "Beta",
      mapName: "beta-map",
      value: 2,
      formattedValue: "2.0 %",
      fillColor: "#fff",
    },
  ];

  it("finds territories case-insensitively", () => {
    expect(findTerritoryIndexByMapName(territories, "BETA-MAP")).toBe(1);
  });

  it("returns -1 when territory is missing", () => {
    expect(findTerritoryIndexByMapName(territories, "Missing")).toBe(-1);
  });
});

describe("getTerritoryListPage", () => {
  it("returns the page number for a list index", () => {
    expect(getTerritoryListPage(0, 10)).toBe(1);
    expect(getTerritoryListPage(10, 10)).toBe(2);
  });
});

describe("buildTerritoryListEntries", () => {
  const mapData: DataItem[] = [
    {
      id: "A",
      name: "A",
      displayName: "Alpha",
      historicalEmissionChangePercent: -4,
    },
    {
      id: "B",
      name: "B",
      displayName: "Beta",
      historicalEmissionChangePercent: 2,
    },
  ];

  it("builds list entries with formatted values and colors", () => {
    const entries = buildTerritoryListEntries(
      ["Alpha", "Beta", "Missing"],
      "municipalities",
      mapData,
      emissionsKpi,
    );

    expect(entries).toHaveLength(3);
    expect(entries[0]).toMatchObject({
      displayName: "Alpha",
      mapName: "Alpha",
      formattedValue: "-4.0 %",
    });
    expect(entries[1]).toMatchObject({
      displayName: "Beta",
      formattedValue: "2.0 %",
    });
    expect(entries[2]).toMatchObject({
      displayName: "Missing",
      value: null,
      formattedValue: "–",
      fillColor: TERRITORY_MAP_COLORS.null,
    });
  });
});

describe("toRoutingEntityType", () => {
  it("maps map entity types to routing paths", () => {
    expect(toRoutingEntityType("regions")).toBe("region");
    expect(toRoutingEntityType("municipalities")).toBe("municipality");
  });
});
