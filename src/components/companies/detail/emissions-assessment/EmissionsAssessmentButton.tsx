import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useEmissionsAssessment } from "@/hooks/companies/useEmissionsAssessment";
import { YearSelectionModal } from "./YearSelectionModal";
import { EmissionsAssessmentDialog } from "./EmissionsAssessmentDialog";
import type { ReportingPeriod } from "@/types/company";

interface EmissionsAssessmentButtonProps {
  wikidataId: string;
  sortedPeriods: ReportingPeriod[];
  disabled?: boolean;
}

export function EmissionsAssessmentButton({
  wikidataId,
  sortedPeriods,
  disabled = false,
}: EmissionsAssessmentButtonProps) {
  const [showYearSelectionModal, setShowYearSelectionModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const { assessment, isLoadingAssessment, assessmentError, assessEmissions } =
    useEmissionsAssessment();

  const handleAssessEmissions = () => {
    assessEmissions(
      { wikidataId, years: selectedYears },
      {
        onSuccess: () => {
          setShowAssessmentModal(true);
        },
        onError: () => {
          setShowYearSelectionModal(true);
        },
      },
    );
  };

  const handleYearSelection = (year: string) => {
    setSelectedYears((prev) => {
      if (prev.includes(year)) {
        return prev.filter((y) => y !== year);
      }
      return [...prev, year];
    });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => {
          setSelectedYears([]);
          setShowYearSelectionModal(true);
        }}
        disabled={disabled || isLoadingAssessment}
      >
        {isLoadingAssessment ? "Assessing..." : "Assess emissions"}
        <div className="w-5 h-5 rounded-full bg-blue-5/30 text-blue-2 text-xs flex items-center justify-center">
          <AlertTriangle />
        </div>
      </Button>

      <YearSelectionModal
        isOpen={showYearSelectionModal}
        onOpenChange={setShowYearSelectionModal}
        selectedYears={selectedYears}
        onYearSelection={handleYearSelection}
        onAssess={handleAssessEmissions}
        sortedPeriods={sortedPeriods}
        assessmentError={assessmentError}
      />

      <EmissionsAssessmentDialog
        isOpen={showAssessmentModal}
        onOpenChange={setShowAssessmentModal}
        assessment={assessment}
      />
    </>
  );
}
