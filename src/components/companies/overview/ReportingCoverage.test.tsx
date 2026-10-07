import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReportingCoverage } from "./ReportingCoverage";
import type { ParisSummary } from "@/hooks/companies/parisOverviewUtils";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (options && "enough" in options && "tooLittle" in options) {
        return `${key}:${options.enough}:${options.tooLittle}`;
      }
      return key;
    },
  }),
}));

vi.mock("@/hooks/useChartMotion", () => ({
  useChartMotion: () => ({
    reduceMotion: true,
    barDuration: 0,
    fadeDuration: 0,
    stagger: () => 0,
    ease: [0, 0, 1, 1],
  }),
}));

const summary: ParisSummary = {
  total: 10,
  onTrack: 3,
  offTrack: 5,
  unknown: 2,
  reducingNotOnTrack: 2,
  onTrackPercent: 30,
};

describe("ReportingCoverage", () => {
  it("splits companies that have a readable trend from those that reported too little", () => {
    render(<ReportingCoverage summary={summary} />);

    expect(
      screen.getByRole("img", {
        name: "companiesOverviewPage.paris.reportingAria:8:2",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(
      screen.getByText("companiesOverviewPage.paris.reportingEnough"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("companiesOverviewPage.paris.reportingTooLittle"),
    ).toBeInTheDocument();
  });

  it("renders nothing when the view is empty", () => {
    const { container } = render(
      <ReportingCoverage
        summary={{ ...summary, total: 0, onTrack: 0, offTrack: 0, unknown: 0 }}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
