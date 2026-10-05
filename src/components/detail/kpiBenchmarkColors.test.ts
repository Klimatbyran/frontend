import { describe, expect, it } from "vitest";
import {
  benchmarkToneTextClass,
  buildBooleanBarBackground,
} from "./kpiBenchmarkColors";
import { BENCHMARK_VISUAL } from "@/utils/detail/kpiBenchmark";

describe("kpiBenchmarkColors", () => {
  it("uses green for Paris-style good outcomes", () => {
    expect(benchmarkToneTextClass("good", BENCHMARK_VISUAL.paris)).toBe(
      "text-green-3",
    );
    expect(
      buildBooleanBarBackground(0.6, true, BENCHMARK_VISUAL.paris),
    ).toContain("--green-3");
  });

  it("uses orange neutral bars via visual flag", () => {
    expect(benchmarkToneTextClass("bad", BENCHMARK_VISUAL.neutralBar)).toBe(
      "text-pink-3",
    );
  });
});
