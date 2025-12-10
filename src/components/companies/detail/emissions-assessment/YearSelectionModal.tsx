import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Text } from "@/components/ui/text";
import type { ReportingPeriod } from "@/types/company";

interface YearSelectionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedYears: string[];
  onYearSelection: (year: string) => void;
  onAssess: () => void;
  sortedPeriods: ReportingPeriod[];
  assessmentError: string | null;
}

export function YearSelectionModal({
  isOpen,
  onOpenChange,
  selectedYears,
  onYearSelection,
  onAssess,
  sortedPeriods,
  assessmentError,
}: YearSelectionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black-2 light:bg-white text-white light:text-black-3">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light">
            Select Years for Assessment
          </DialogTitle>
        </DialogHeader>
        {assessmentError && (
          <div className="mb-2 text-red-500 text-sm">{assessmentError}</div>
        )}
        <div className="space-y-4">
          <Text className="text-grey">
            Select the years you want to include in the emissions assessment:
          </Text>
          <div className="grid grid-cols-2 gap-2">
            {sortedPeriods.map((period) => {
              const year = new Date(period.endDate).getFullYear().toString();
              const isSelected = selectedYears.includes(year);
              return (
                <Button
                  key={year}
                  variant="outline"
                  className={`w-full justify-start transition-colors ${
                    isSelected
                      ? "bg-blue-5 light:bg-blue-4 text-white light:text-white border-blue-5"
                      : "text-white light:text-black-3 border-white light:border-grey"
                  }`}
                  onClick={() => onYearSelection(year)}
                >
                  {year}
                </Button>
              );
            })}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onAssess();
            }}
            disabled={selectedYears.length === 0}
          >
            Assess Selected Years
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
