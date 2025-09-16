import { EmissionsHistoryNew } from "./history/EmissionsHistory-New";
import type { CompanyDetails } from "@/types/company";

interface CompanyHistoryProps {
  company: CompanyDetails;
}

export function CompanyHistory({ company }: CompanyHistoryProps) {
  return (
    <>
      <EmissionsHistoryNew
        reportingPeriods={company.reportingPeriods}
        baseYear={company.baseYear}
      />
    </>
  );
}
