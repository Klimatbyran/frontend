import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReportingCoverage } from "./ReportingCoverage";
import type { CompanyWithKPIs } from "@/types/company";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (
        options &&
        "longCount" in options &&
        "enough" in options &&
        "thin" in options
      ) {
        return `${key}:${options.longCount}:${options.enough}:${options.thin}`;
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
  it("stacks a long record, the minimum trend, and companies with too little", () => {
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
        name: "companiesOverviewPage.paris.reportingAria:1:2:2",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("companiesOverviewPage.paris.reportingLong"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("companiesOverviewPage.paris.reportingEnough"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("companiesOverviewPage.paris.reportingTooLittle"),
    ).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getAllByText("2")).toHaveLength(2);
  });

  it("renders nothing when the view is empty", () => {
    const { container } = render(<ReportingCoverage companies={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
