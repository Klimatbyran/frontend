import { describe, expect, it } from "vitest";
import {
  buildClimateTraceFetchYears,
  CLIMATE_TRACE_EMISSIONS_PARAMS,
} from "@/lib/climateTrace";

describe("buildClimateTraceFetchYears", () => {
  it("includes every year from 2015 through the reported end year", () => {
    expect(buildClimateTraceFetchYears()).toEqual([
      2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025,
    ]);
  });

  it("uses the configured reported end year", () => {
    expect(CLIMATE_TRACE_EMISSIONS_PARAMS.endYear).toBe(2025);
  });
});
