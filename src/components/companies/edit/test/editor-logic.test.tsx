import { render, fireEvent, screen } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import type { CompanyDetails } from "@/types/company";
import { CompanyEditInputField } from "../CompanyEditField";
import { CompanyEditScope1 } from "../CompanyEditScope1";
import { CompanyEditScope2 } from "../CompanyEditScope2";
import { CompanyEditScope3 } from "../CompanyEditScope3";
import { CompanyEditPeriod } from "../CompanyEditPeriod";
import { CompanyEditHeader } from "../CompanyEditHeader";
import { CompanyEditRow } from "../CompanyEditRow";
import { AuthExpiredModal } from "../AuthExpiredModal";

describe("Editor Logic Integration", () => {
  it("CompanyEditInputField: renders input and calls onInputChange", () => {
    const onInputChange = vi.fn();
    render(
      <CompanyEditInputField
        type="number"
        value={42}
        name="test"
        displayAddition="none"
        onInputChange={onInputChange}
        formData={new Map()}
      />,
    );
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveValue(42);
    fireEvent.change(input, { target: { value: "123" } });
    expect(onInputChange).toHaveBeenCalledWith("test", "123");
  });

  it("CompanyEditInputField: disables checkbox if originalVerified and value unchanged", () => {
    render(
      <CompanyEditInputField
        type="number"
        value={0}
        name="test"
        displayAddition="verification"
        verified={false}
        originalVerified
        onInputChange={vi.fn()}
        formData={new Map()}
      />,
    );
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("CompanyEditInputField: does not disable checkbox if only verified is true", () => {
    render(
      <CompanyEditInputField
        type="number"
        value={0}
        name="test"
        displayAddition="verification"
        verified
        originalVerified={false}
        onInputChange={vi.fn()}
        formData={new Map()}
      />,
    );
    expect(screen.getByRole("checkbox")).not.toBeDisabled();
  });

  it("CompanyEditInputField: calls onInputChange for checkbox", () => {
    const onInputChange = vi.fn();
    render(
      <CompanyEditInputField
        type="number"
        value={0}
        name="test"
        displayAddition="verification"
        verified={false}
        onInputChange={onInputChange}
        formData={new Map()}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onInputChange).toHaveBeenCalled();
  });

  it("CompanyEditScope1: propagates onInputChange", () => {
    const onInputChange = vi.fn();
    render(
      <CompanyEditScope1
        periods={[
          {
            id: "1",
            startDate: "2022-01-01",
            endDate: "2022-12-31",
            reportURL: null,
            emissions: {
              scope1: { total: 10, unit: "t", metadata: { verifiedBy: null } },
            } as any,
            economy: null,
          },
        ]}
        onInputChange={onInputChange}
        formData={new Map()}
      />,
    );
    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "99" },
    });
    expect(onInputChange).toHaveBeenCalled();
  });

  it("CompanyEditPeriod: calls resetPeriod on undo", () => {
    const resetPeriod = vi.fn();
    render(
      <CompanyEditPeriod
        periods={[
          {
            id: "1",
            startDate: "2022-01-01",
            endDate: "2022-12-31",
            reportURL: null,
            emissions: null,
            economy: null,
          },
        ]}
        onInputChange={vi.fn()}
        formData={new Map()}
        resetPeriod={resetPeriod}
      />,
    );
    fireEvent.click(screen.getByTestId("undo"));
    expect(resetPeriod).toHaveBeenCalled();
  });

  it("CompanyEditHeader: shows unsaved changes modal", () => {
    const mockCompany = {
      name: "TestCo",
      wikidataId: "Q1",
      reportingPeriods: [
        {
          id: "1",
          startDate: "2022-01-01",
          endDate: "2022-12-31",
          reportURL: null,
          emissions: null,
          economy: null,
        },
      ],
    } as CompanyDetails;
    render(
      <MemoryRouter>
        <CompanyEditHeader
          company={mockCompany}
          onYearsSelect={vi.fn()}
          hasUnsavedChanges
        />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByLabelText("Close editor"));
    expect(screen.getByTestId("unsaved-changes-title")).toBeInTheDocument();
  });

  it("CompanyEditRow: renders children and header", () => {
    render(
      <CompanyEditRow name="Test Row">
        <span>Child</span>
      </CompanyEditRow>,
    );
    expect(screen.getByText("Test Row")).toBeInTheDocument();
    expect(screen.getByText("Child")).toBeInTheDocument();
  });

  it("CompanyAuthExpiredModal: calls handlers", () => {
    const onClose = vi.fn();
    const onLogin = vi.fn();
    render(<AuthExpiredModal isOpen onClose={onClose} onLogin={onLogin} />);
    fireEvent.click(screen.getByText(/cancel/i));
    fireEvent.click(screen.getByText(/login/i));
    expect(onClose).toHaveBeenCalled();
    expect(onLogin).toHaveBeenCalled();
  });

  it("CompanyEditScope2: propagates onInputChange and renders all fields", () => {
    const onInputChange = vi.fn();
    const periods = [
      {
        id: "1",
        startDate: "2022-01-01",
        endDate: "2022-12-31",
        reportURL: null,
        emissions: {
          scope2: {
            mb: 1,
            lb: 2,
            unknown: 3,
            unit: "t",
            calculatedTotalEmissions: 6,
            metadata: { verifiedBy: null },
          },
        },
        economy: null,
      },
    ];
    render(
      <CompanyEditScope2
        periods={periods}
        onInputChange={onInputChange}
        formData={new Map()}
      />,
    );
    // There should be three number inputs (mb, lb, unknown)
    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs.length).toBe(3);
    fireEvent.change(inputs[0], { target: { value: "10" } });
    fireEvent.change(inputs[1], { target: { value: "20" } });
    fireEvent.change(inputs[2], { target: { value: "30" } });
    expect(onInputChange).toHaveBeenCalledTimes(3);
  });

  it("CompanyEditScope3: propagates onInputChange and renders all 16 categories", () => {
    const onInputChange = vi.fn();
    const periods = [
      {
        id: "1",
        startDate: "2022-01-01",
        endDate: "2022-12-31",
        reportURL: null,
        emissions: {
          scope3: {
            calculatedTotalEmissions: 100,
            metadata: { verifiedBy: null },
            statedTotalEmissions: null,
            categories: Array.from({ length: 16 }, (_, i) => ({
              category: i + 1,
              total: 0,
              unit: "tCO2e",
            })),
          },
        },
        economy: null,
      },
    ];
    render(
      <CompanyEditScope3
        periods={periods}
        onInputChange={onInputChange}
        formData={new Map()}
      />,
    );
    // There should be 16 number inputs for categories + 1 for statedTotalEmissions
    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs.length).toBe(17);
    // Interact with a few
    fireEvent.change(inputs[0], { target: { value: "1" } });
    fireEvent.change(inputs[15], { target: { value: "16" } });
    fireEvent.change(inputs[16], { target: { value: "100" } });
    expect(onInputChange).toHaveBeenCalledTimes(3);
  });

  it("AuthExpiredModal: shows correct message when open", () => {
    render(<AuthExpiredModal isOpen onClose={vi.fn()} onLogin={vi.fn()} />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    // Use getAllByText to avoid multiple match error
    expect(screen.getAllByText(/auth/i).length).toBeGreaterThan(0);
  });

  // Simulate the logic for indicating the user is logged out (auth modal open)
  it("Indicates user is logged out by showing auth modal", () => {
    render(<AuthExpiredModal isOpen onClose={vi.fn()} onLogin={vi.fn()} />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getAllByText(/auth/i).length).toBeGreaterThan(0);
  });
});
