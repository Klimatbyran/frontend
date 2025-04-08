import { CompanyCard } from "./CompanyCard";
import type { RankedCompany } from "@/types/company";

interface SectionedCompanyListProps {
  companies: Omit<RankedCompany, "rankings" | "goals" | "initiatives">[];
}

export function SectionedCompanyList({ companies }: SectionedCompanyListProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {companies.map((company) => (
        <div key={company.wikidataId} className="block rounded-level-2">
          <div>
            <CompanyCard {...company} />
          </div>
        </div>
      ))}
    </div>
  );
}
