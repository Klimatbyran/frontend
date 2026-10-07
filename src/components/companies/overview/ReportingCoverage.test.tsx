import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReportingCoverage } from "./ReportingCoverage";
import type { CompanyWithKPIs } from "@/types/company";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (options && "enough" in options && "tooLittle" in options) {
        return `${key}:${options.enough}:${options.tooLittle}:${options.enoughPercent}:${options.tooLittlePercent}`;
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

function companyWithYears(count: number): CompanyWithKPIs {
  return {
    reportingPeriods: Array.from({ length: count }, (_, index) => ({
      endDate: `${2010 + index}-12-31`,
      emissions: { calculatedTotalEmissions: 1 },
    })),
  } as unknown as CompanyWithKPIs;
}

describe("ReportingCoverage", () => {
  it("splits companies with enough years from those with too little", () => {
    render(
      <ReportingCoverage
        companies={[
          companyWithYears(7),
          companyWithYears(4),
          companyWithYears(3),
          companyWithYears(1),
          companyWithYears(0),
        ]}
      />,
    );

    expect(
      screen.getByRole("img", {
        name: "companiesOverviewPage.paris.reportingAria:3:2:60:40",
      }),
    ).toBeInTheDocument();
    const description = screen.getByText(
      "companiesOverviewPage.paris.reportingDescription",
    );
    expect(description.className).not.toContain("max-w-");
    expect(
      screen.getByText("companiesOverviewPage.paris.reportingEnough"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("companiesOverviewPage.paris.reportingTooLittle"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("companiesOverviewPage.paris.reportingLong"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("40%")).toBeInTheDocument();

    const bar = screen.getByRole("img");
    expect(bar.querySelector('[style*="--blue-3"]')).toBeTruthy();
    expect(bar.querySelector('[style*="--pink-3"]')).toBeTruthy();
  });

  it("gives the only populated side the full bar", () => {
    render(
      <ReportingCoverage
        companies={[companyWithYears(3), companyWithYears(5)]}
      />,
    );

    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
    const bar = screen.getByRole("img");
    expect(bar.querySelector('[style*="--blue-3"]')).toBeTruthy();
    expect(bar.querySelector('[style*="--pink-3"]')).toBeNull();
  });

  it("renders nothing when the view is empty", () => {
    const { container } = render(<ReportingCoverage companies={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
