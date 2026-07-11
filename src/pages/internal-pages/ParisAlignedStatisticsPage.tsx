import { useMemo } from "react";
import { Text } from "@/components/ui/text";
import { useCompanies } from "@/hooks/companies/useCompanies";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageSEO } from "@/components/SEO/PageSEO";
import { calculateParisAlignedStatistics } from "./paris-aligned-statistics/calculateStatistics";
import { ParisAlignedCompaniesTable } from "./paris-aligned-statistics/ParisAlignedCompaniesTable";
import { ParisAlignedEmissionsTotalsSection } from "./paris-aligned-statistics/ParisAlignedEmissionsTotalsSection";
import { ParisAlignedNotesSection } from "./paris-aligned-statistics/ParisAlignedNotesSection";
import { ParisAlignedSummarySection } from "./paris-aligned-statistics/ParisAlignedSummarySection";

export function ParisAlignedStatisticsPage() {
  const { companies, companiesLoading, companiesError } = useCompanies();

  const statistics = useMemo(
    () => (companies ? calculateParisAlignedStatistics(companies) : null),
    [companies],
  );

  if (companiesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Text variant="h1" className="text-white">
          Loading Paris alignment statistics...
        </Text>
      </div>
    );
  }

  if (companiesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Text variant="h1" className="text-red-400">
          Error loading data: {companiesError.toString()}
        </Text>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Text variant="h1" className="text-white">
          No data available
        </Text>
      </div>
    );
  }

  return (
    <>
      <PageSEO
        title="Paris Aligned Statistics - Internal"
        description="Internal dashboard showing aggregated Paris alignment statistics"
        canonicalUrl="https://klimatkollen.se/internal/paris-aligned-statistics"
      />

      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Paris Aligned Statistics"
          description="Aggregated statistics about companies and their Paris alignment status"
        />

        <div className="mt-8 space-y-6">
          <ParisAlignedSummarySection statistics={statistics} />
          <ParisAlignedEmissionsTotalsSection statistics={statistics} />
          <ParisAlignedNotesSection />
          <ParisAlignedCompaniesTable yesCompanies={statistics.yesCompanies} />
        </div>
      </div>
    </>
  );
}
