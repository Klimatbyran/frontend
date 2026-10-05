import { describe, expect, it } from "vitest";
import {
  benchmarkToneTextClass,
  buildBooleanBarBackground,
  numericBenchmarkAccent,
} from "./kpiBenchmarkColors";
import { BENCHMARK_VISUAL } from "@/utils/detail/kpiBenchmark";

describe("kpiBenchmarkColors", () => {
  it("splits the yes and no colors at the share who said yes", () => {
    // A quarter of the peers said yes. Yes is the good answer, so the
    // left 25% is blue and the rest is pink.
    expect(buildBooleanBarBackground(0.25, true)).toBe(
      "linear-gradient(to right, var(--blue-4) 0%, var(--blue-3) 25%, var(--pink-4) 25%, var(--pink-3) 100%)",
    );
    // Yes is the bad answer, so that same left portion is pink.
    expect(buildBooleanBarBackground(0.25, false)).toBe(
      "linear-gradient(to right, var(--pink-4) 0%, var(--pink-3) 25%, var(--blue-4) 25%, var(--blue-3) 100%)",
    );
  });

  it("uses green for Paris-style good outcomes", () => {
    expect(benchmarkToneTextClass("good", BENCHMARK_VISUAL.paris)).toBe(
      "text-green-3",
    );
    expect(buildBooleanBarBackground(0.6, true, BENCHMARK_VISUAL.paris)).toBe(
      "linear-gradient(to right, var(--green-4) 0%, var(--green-3) 60%, var(--pink-4) 60%, var(--pink-3) 100%)",
    );
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
        primary: { key: "kpiBenchmark.betterThanReference" },
        visual: BENCHMARK_VISUAL.neutralBar,
      }),
    ).toEqual({
      textClass: "text-orange-2",
      fill: "var(--orange-2)",
    });
  });
});
