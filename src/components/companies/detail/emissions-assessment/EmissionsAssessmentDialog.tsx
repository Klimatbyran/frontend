import { Text } from "@/components/ui/text";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { paths } from "@/lib/api-types";
import { formatPercent } from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";

type Assessment =
  paths["/emissions-assessment/"]["post"]["responses"][200]["content"]["application/json"]["assessment"];

interface EmissionsAssessmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assessment: Assessment | null;
}

export function EmissionsAssessmentDialog({
  isOpen,
  onOpenChange,
  assessment,
}: EmissionsAssessmentDialogProps) {
  const { currentLanguage } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-black-2 text-white max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light">
            Emissions Assessment
          </DialogTitle>
        </DialogHeader>

        {assessment && (
          <div className="space-y-6 overflow-y-auto pr-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${assessment.isReasonable ? "bg-green-500" : "bg-red-500"}`}
              />
              <Text className="text-lg">
                {assessment.isReasonable ? "Reasonable" : "Unreasonable"}
                (Confidence:{" "}
                {formatPercent(assessment.confidence, currentLanguage, false)})
              </Text>
            </div>

            <div>
              <Text className="text-lg font-medium mb-2">Reasoning</Text>
              <Text className="text-grey">{assessment.reasoning}</Text>
            </div>

            {assessment.issues.length > 0 && (
              <div>
                <Text className="text-lg font-medium mb-2">Issues Found</Text>
                <div className="space-y-4">
                  {assessment.issues.map((issue, index) => (
                    <div key={index} className="bg-black-1 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            issue.severity === "HIGH"
                              ? "bg-red-500"
                              : issue.severity === "MEDIUM"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                          }`}
                        />
                        <Text className="font-medium">{issue.type}</Text>
                      </div>
                      <Text className="text-grey mb-2">
                        {issue.description}
                      </Text>
                      {issue.suggestedAction && (
                        <Text className="text-sm text-grey">
                          Suggested Action: {issue.suggestedAction}
                        </Text>
                      )}
                      {issue.yearComparison && (
                        <div className="mt-2 text-sm text-grey">
                          Comparison: {issue.yearComparison.previousYear} to{" "}
                          {issue.yearComparison.currentYear}
                          (Change: {issue.yearComparison.reduction}%)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {assessment.nextSteps.length > 0 && (
              <div>
                <Text className="text-lg font-medium mb-2">
                  Recommended Next Steps
                </Text>
                <div className="space-y-2">
                  {assessment.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          step.priority === "HIGH"
                            ? "bg-red-500"
                            : step.priority === "MEDIUM"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                        }`}
                      />
                      <Text>{step.description}</Text>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
