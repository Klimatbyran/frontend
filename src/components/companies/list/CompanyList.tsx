import { useTranslation } from "react-i18next";
import { CardGrid } from "@/components/layout/CardGrid";
import { ListCard } from "@/components/layout/ListCard";
import type { RankedCompany } from "@/types/company";
import ListFilter from "@/components/ListFilter";
import { useCompanyFilters } from "@/hooks/companies/useCompanyFilters";
import useTransformCompanyListCard from "@/hooks/companies/useTransformCompanyListCard";

interface CompanyListProps {
  companies: RankedCompany[];
}

export function CompanyList({ companies }: CompanyListProps) {
  const { t } = useTranslation();

  const { filteredCompanies } = useCompanyFilters(companies);

  // Transform company data for ListCard components
  const transformedCompanies = useTransformCompanyListCard({
    filteredCompanies,
  });

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-light text-grey">
          {t("explorePage.companies.noCompaniesFound")}
        </h3>
        <p className="text-grey mt-2">
          {t("explorePage.companies.tryDifferentCriteria")}
        </p>
      </div>
    );
  }

  return (
    <>
      <ListFilter companies={companies} />
      <CardGrid
        items={transformedCompanies}
        itemContent={(transformedData) => (
          <ListCard key={transformedData.linkTo} {...transformedData} />
        )}
      />
    </>
  );
}
