import { useCompanies } from "@/hooks/companies/useCompanies";
import { SectorComparison } from "./SectorComparison";
import type { CompanyDetails } from "@/types/company";

interface CompanySectorComparisonProps {
  company: CompanyDetails;
}

export function CompanySectorComparison({
  company,
}: CompanySectorComparisonProps) {
  const { getCompaniesBySector } = useCompanies();
  const sectorCode = company.industry?.industryGics?.sectorCode;

  if (!sectorCode) {
    return null;
  }

  const sectorCompanies = getCompaniesBySector(sectorCode);

  return (
    <SectorComparison
      currentCompany={company}
      sectorCompanies={sectorCompanies}
    />
  );
}
