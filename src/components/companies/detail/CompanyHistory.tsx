import { EmissionsHistoryWrapper } from "./history/EmissionsHistoryWrapper";
import type { CompanyDetails } from "@/types/company";

interface CompanyHistoryProps {
  company: CompanyDetails;
}

export function CompanyHistory({ company }: CompanyHistoryProps) {
  return (
    <>
      <EmissionsHistoryWrapper
        reportingPeriods={company.reportingPeriods}
        baseYear={company.baseYear}
      />
    </>
  );
}
