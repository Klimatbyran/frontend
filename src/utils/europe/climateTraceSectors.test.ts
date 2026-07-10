import { describe, expect, it } from "vitest";
import {
  buildClimateTraceSectorEmissionsResponse,
  CLIMATE_TRACE_EMISSIONS_SECTORS,
} from "@/utils/europe/climateTraceSectors";

describe("buildClimateTraceSectorEmissionsResponse", () => {
  it("returns null when sector data is missing", () => {
    expect(buildClimateTraceSectorEmissionsResponse(undefined)).toBeNull();
  });

  it("filters out zero-value sectors and empty years", () => {
    const response = buildClimateTraceSectorEmissionsResponse({
      2024: {
        transportation: 30,
        agriculture: 0,
      },
      2025: {
        transportation: 28,
        power: 6,
      },
    });

    expect(response).toEqual({
      sectors: {
        2024: {
          transportation: 30,
        },
        2025: {
          transportation: 28,
          power: 6,
        },
      },
    });
  });

  it("includes all configured Climate TRACE sectors", () => {
    expect(CLIMATE_TRACE_EMISSIONS_SECTORS).toEqual([
      "transportation",
      "manufacturing",
      "agriculture",
      "power",
      "fossil-fuel-operations",
      "buildings",
      "waste",
      "fluorinated-gases",
      "mineral-extraction",
    ]);
  });
});
