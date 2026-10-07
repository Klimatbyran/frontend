import type { ReportingPeriod } from "@/types/company";
import { useAuth } from "@/contexts/AuthContext";
import { EmissionsAssessmentButton } from "../emissions-assessment/EmissionsAssessmentButton";

interface CompanyOverviewActionsProps {
  companyId: string;
  sortedPeriods: ReportingPeriod[];
}

export function CompanyOverviewActions({
  companyId,
  sortedPeriods,
}: CompanyOverviewActionsProps) {
  const { token } = useAuth();

  if (!token) {
    return null;
  }

  return (
    <div className="flex flex-row gap-2">
      <EmissionsAssessmentButton
        companyId={companyId}
        sortedPeriods={sortedPeriods}
      />
    </div>
  );
}
