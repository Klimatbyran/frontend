import { EmissionsHistory } from "./history/EmissionsHistory";
import type { CompanyDetails } from "@/types/company";

interface CompanyHistoryProps {
  company: CompanyDetails;
}

export function CompanyHistory({ company }: CompanyHistoryProps) {
  return (
    <>
      <EmissionsHistory
        reportingPeriods={company.reportingPeriods}
        baseYear={company.baseYear}
      />
    </>
  );
}
