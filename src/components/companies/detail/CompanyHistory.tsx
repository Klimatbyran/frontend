import { EmissionsChart } from "./emissions-chart/EmissionsChart";
import type { CompanyDetails } from "@/types/company";

interface CompanyHistoryProps {
  company: CompanyDetails;
}

export function CompanyHistory({ company }: CompanyHistoryProps) {
  return (
    <>
      <EmissionsChart
        reportingPeriods={company.reportingPeriods}
        baseYear={company.baseYear}
      />
    </>
  );
}
