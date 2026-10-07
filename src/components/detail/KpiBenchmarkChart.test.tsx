import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { KpiBenchmarkChart } from "./KpiBenchmarkChart";
import {
  BENCHMARK_VISUAL,
  buildBooleanBenchmark,
  buildNumericBenchmark,
} from "@/utils/detail/kpiBenchmark";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@/hooks/useChartMotion", () => ({
  useChartMotion: () => ({
    reduceMotion: true,
    ease: [0.22, 1, 0.36, 1],
  }),
}));

function peerDots(container: HTMLElement) {
  return [...container.querySelectorAll("span")].filter(
    (element) => (element as HTMLElement).style.width !== "",
  );
}

describe("KpiBenchmarkChart", () => {
  it("draws one animated dot per peer, with this entity ringed", () => {
    const view = buildBooleanBenchmark({
      value: true,
      peers: [false, false, null],
      higherIsBetter: true,
      peerGroup: "companies",
      peersIncludeSubject: false,
      visual: BENCHMARK_VISUAL.paris,
    });

    const { container } = render(<KpiBenchmarkChart benchmark={view!} />);
    const dots = peerDots(container);

    expect(dots.map((dot) => dot.style.backgroundColor)).toEqual([
      "var(--green-3)",
      "var(--pink-3)",
      "var(--pink-3)",
      "rgba(255, 255, 255, 0.2)",
    ]);
    expect(dots[0].style.boxShadow).toContain("255,255,255");
    expect(dots[0].style.width).toBe("12px");
    expect(container.textContent).toContain("yes");
    expect(container.textContent).toContain("no");
    expect(container.textContent).toContain("unknown");
  });

  it("uses smaller dots once the peer set wraps", () => {
    const view = buildBooleanBenchmark({
      value: true,
      peers: Array.from({ length: 50 }, () => false),
      higherIsBetter: true,
      peerGroup: "municipalities",
      peersIncludeSubject: false,
    });

    const { container } = render(<KpiBenchmarkChart benchmark={view!} />);
    const dots = peerDots(container);

    expect(dots).toHaveLength(51);
    expect(dots[0].style.width).toBe("8px");
    expect(dots[0].style.backgroundColor).toBe("var(--blue-3)");
    expect(dots[0].style.boxShadow).toContain("255,255,255");
    expect(dots[1].style.backgroundColor).toBe("var(--pink-3)");
  });

  it("keeps a gradient bar for numeric benchmarks", () => {
    const view = buildNumericBenchmark({
      value: 1,
      peers: [1, 2, 3, 4],
      higherIsBetter: false,
      peerGroup: "municipalities",
    });

    const { container } = render(<KpiBenchmarkChart benchmark={view!} />);

    expect(peerDots(container)).toHaveLength(0);
    expect(container.innerHTML).toContain("linear-gradient");
  });
});
