import { useLanguage } from "@/components/LanguageProvider";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RankedCompany, useCompanies } from "@/hooks/companies/useCompanies";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { formatPercent } from "@/utils/localizeUnit";

type UnverifiedCompanyWithPeriod = {
  company: RankedCompany;
  period: RankedCompany["reportingPeriods"][0];
};
const useGetUnverifiedCompaniesForYear = (year: number) => {
  const { companies } = useCompanies();
  const { isEmissionsAIGenerated } = useVerificationStatus();

  const unverifiedCompanies = companies
    .map((company) => {
      const period = company.reportingPeriods.find(
        (period) => new Date(period.endDate).getFullYear() == year,
      );

      return {
        company,
        period,
      };
    })
    .filter(({ period }) => {
      return period && isEmissionsAIGenerated(period);
    })
    .sort(({ company: companyA }, { company: companyB }) =>
      companyA.name.localeCompare(companyB.name),
    );

  return unverifiedCompanies as UnverifiedCompanyWithPeriod[];
};

export const ValidationDashboard = () => {
  const year =
    new URLSearchParams(window.location.search).get("year") || "2024";

  const { companies: allCompanies } = useCompanies();
  const companies = useGetUnverifiedCompaniesForYear(parseInt(year));
  const { currentLanguage } = useLanguage();

  const handleYearChange = (selectedYear: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("year", selectedYear);
    window.history.pushState({}, "", url);
    window.location.reload();
  };

  const years = Array.from({ length: 5 }, (_, i) => 2024 - i);

  const nrFinishedCompanies = allCompanies.length - companies.length;
  const progress = nrFinishedCompanies / allCompanies.length;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold">
        Validation status for <span className="text-green-3">{year}</span>
      </h1>

      <div className="my-6 flex items-center gap-2">
        <label htmlFor="year-selector" className="block text-sm">
          Select Year:
        </label>
        <Select value={year} onValueChange={(value) => handleYearChange(value)}>
          <SelectTrigger className="w-auto bg-black-1 text-white border border-gray-600 px-3 py-2 rounded-md">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="bg-black-1 text-white">
            {years.map((y) => (
              <SelectItem value={y.toString()}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-gray-400 mb-1">
        Verified: {allCompanies.length - companies.length} of{" "}
        {allCompanies.length}
        <span className="ml-2">
          ({formatPercent(progress, currentLanguage)})
        </span>
      </p>
      <Progress value={progress * 100} className="mb-8" />

      <p className="text-gray-400 mb-4">
        These are companies that have one or more unverified data points
      </p>
      <div className="grid grid-cols-[auto_1fr] mb-6 gap-x-8 gap-y-2">
        {companies.map(({ company, period }) => (
          <div
            key={company.wikidataId}
            className="grid grid-cols-subgrid col-span-2"
          >
            <a
              className="text-blue-2"
              href={`/companies/${company.wikidataId}/edit`}
            >
              {company.name}
            </a>
            {period.reportURL && (
              <a className="text-green-2" href={period.reportURL}>
                Report
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
