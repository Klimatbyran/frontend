import { describe, expect, it } from "vitest";
import {
  benchmarkToneTextClass,
  buildBooleanBarBackground,
  numericBenchmarkAccent,
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

  it("matches orange text and dot to neutral gradient bars", () => {
    expect(benchmarkToneTextClass("bad", BENCHMARK_VISUAL.neutralBar)).toBe(
      "text-orange-2",
    );
    expect(
      numericBenchmarkAccent({
        kind: "numeric",
        tone: "good",
        higherIsBetter: false,
        position: 0.2,
        averagePosition: 0.5,
        averageLabel: "0",
        primaryReference: "all",
        primary: { key: "kpiBenchmark.betterThanReference" },
        visual: BENCHMARK_VISUAL.neutralBar,
      }),
    ).toEqual({
      textClass: "text-orange-2",
      fill: "var(--orange-2)",
    });
  });
});
