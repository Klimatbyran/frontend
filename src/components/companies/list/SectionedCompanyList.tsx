import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CompanyCard } from "./CompanyCard";
import type { RankedCompany } from "@/types/company";
import {
  SECTOR_ORDER,
  useSectorNames,
} from "@/hooks/companies/useCompanyFilters";
import { useTranslation } from "react-i18next";

interface SectionedCompanyListProps {
  companies: Omit<RankedCompany, "rankings" | "goals" | "initiatives">[];
  sortBy: string;
}

export function SectionedCompanyList({
  companies,
  sortBy,
}: SectionedCompanyListProps) {
  const { t } = useTranslation();
  const sectorNames = useSectorNames();

  // Group companies by sector
  const companiesBySector = companies.reduce((acc, company) => {
    const sectorCode = company.industry?.industryGics?.sectorCode || "unknown";
    if (!acc[sectorCode]) {
      acc[sectorCode] = [];
    }
    acc[sectorCode].push(company);
    return acc;
  }, {} as Record<string, Omit<RankedCompany, "rankings" | "goals" | "initiatives">[]>);

  // Sort sectors by predefined order
  const sortedSectors = Object.keys(companiesBySector).sort((a, b) => {
    const indexA = SECTOR_ORDER.indexOf(a as (typeof SECTOR_ORDER)[number]);
    const indexB = SECTOR_ORDER.indexOf(b as (typeof SECTOR_ORDER)[number]);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  // Sort companies within each sector based on the selected sort option
  Object.keys(companiesBySector).forEach((sector) => {
    companiesBySector[sector].sort((a, b) => {
      switch (sortBy) {
        case "emissions_reduction":
          return b.metrics.emissionsReduction - a.metrics.emissionsReduction;
        case "total_emissions":
          return (
            (b.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0) -
            (a.reportingPeriods[0]?.emissions?.calculatedTotalEmissions || 0)
          );
        case "scope3_coverage":
          return (
            (b.reportingPeriods[0]?.emissions?.scope3?.categories?.length ||
              0) -
            (a.reportingPeriods[0]?.emissions?.scope3?.categories?.length || 0)
          );
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  });

  return (
    <div className="space-y-6">
      {sortedSectors.map((sectorCode) => {
        const sectorCompanies = companiesBySector[sectorCode];
        if (!sectorCompanies?.length) return null;

        return (
          <Accordion
            type="single"
            collapsible
            defaultValue="companies"
            key={sectorCode}
          >
            <AccordionItem value="companies" className="border-none">
              <AccordionTrigger className="rounded-level-2 p-6 hover:no-underline hover:bg-black-2 data-[state=open]:hover:bg-black-2">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-light">
                    {sectorNames[sectorCode as keyof typeof sectorNames] ||
                      t("companies.sectionedCompanyList.otherCompanies")}
                  </h2>
                  <span className="text-grey">
                    {sectorCompanies.length}{" "}
                    {t("companies.sectionedCompanyList.companies")}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {sectorCompanies.map((company) => (
                    <div
                      key={company.wikidataId}
                      className="block rounded-level-2"
                    >
                      <div>
                        <CompanyCard {...company} />
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        );
      })}
    </div>
  );
}
