import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import InsightsList from "./InsightsList";

vi.mock("@/components/LocalizedLink", () => ({
  LocalizedLink: ({
    children,
    to,
  }: {
    children: React.ReactNode;
    to: string;
  }) => <a href={to}>{children}</a>,
}));

describe("InsightsList", () => {
  it("renders companies that share a name as separate rows", () => {
    render(
      <InsightsList
        title="Top companies"
        entities={[
          { id: "company-a", name: "Duni AB", value: 10 },
          { id: "company-b", name: "Duni AB", value: 20 },
        ]}
        dataPointKey="value"
        unit="%"
        totalCount={2}
        entityType="companies"
        nameKey="name"
        colorItem={() => "#ffffff"}
      />,
    );

    expect(screen.getAllByText("Duni AB")).toHaveLength(2);
  });
});
