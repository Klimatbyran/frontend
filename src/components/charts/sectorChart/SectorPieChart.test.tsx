import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SectorPieChart from "./SectorPieChart";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverStub);

const { cells } = vi.hoisted(() => ({
  cells: [] as Array<Record<string, unknown>>,
}));

vi.mock("recharts", () => ({
  PieChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Pie: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  Cell: (props: Record<string, unknown>) => {
    cells.push(props);
    return <div />;
  },
  Tooltip: () => null,
}));

vi.mock("@/hooks/useChartMotion", () => ({
  useChartMotion: () => ({
    reduceMotion: true,
    pieDuration: 0,
  }),
}));

const data = [
  { key: "15", name: "Materials", value: 1000, color: "#111111" },
  { key: "35", name: "Health Care", value: 500, color: "#222222" },
];

describe("SectorPieChart", () => {
  it("keeps every slice and marks only the highlighted sector", () => {
    cells.length = 0;

    render(<SectorPieChart data={data} highlightedKey="35" />);

    const materials = cells.filter((cell) => cell.fill === "#111111");
    const health = cells.filter((cell) => cell.fill === "#222222");

    expect(materials.length).toBeGreaterThan(0);
    expect(health.length).toBeGreaterThan(0);
    for (const cell of health) {
      expect(cell).toMatchObject({
        stroke: "#ffffff",
        strokeWidth: 2.5,
        style: { opacity: 1 },
      });
    }
    for (const cell of materials) {
      expect(cell).toMatchObject({
        stroke: "#111111",
        style: { opacity: 0.28 },
      });
    }
  });

  it("leaves every slice equally visible when nothing is highlighted", () => {
    cells.length = 0;

    render(<SectorPieChart data={data} />);

    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) {
      expect(cell.stroke).toBe(cell.fill);
      expect((cell.style as { opacity: number }).opacity).toBe(1);
    }
  });
});
