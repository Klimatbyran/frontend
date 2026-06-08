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
import {
  githubProjectUrl,
  GithubValidationIssue,
  useValidationReports,
} from "@/hooks/useValidationReports";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { cn } from "@/lib/utils";
import { ReportingPeriod } from "@/types/company";
import { getCompanyDetailPath } from "@/utils/companyRouting";
import { formatPercent } from "@/utils/formatting/localization";

const useGetUnverifiedCompaniesForYear = (year: number) => {
  const { companies } = useCompanies();
  const { isEmissionsAIGenerated } = useVerificationStatus();

  return companies
    .map((company) => {
      const period = company.reportingPeriods.find(
        (period) => new Date(period.endDate).getFullYear() == year,
      );

      return {
        company,
        period: period as ReportingPeriod,
      };
    })
    .filter(({ period }) => period && isEmissionsAIGenerated(period))
    .sort(({ company: companyA }, { company: companyB }) =>
      companyA.name.localeCompare(companyB.name),
    );
};

const githubUrl = (company: RankedCompany, reportUrl?: string | null) => {
  const body = reportUrl ? `\nReport URL: ${reportUrl}` : "";
  const label = company.wikidataId
    ? `[${company.wikidataId}] ${company.name}`
    : `[${company.id}] ${company.name}`;

  const encodedTitle = encodeURIComponent(label);
  const encodedBody = encodeURIComponent(body);
  return `${githubProjectUrl}/issues/new?title=${encodedTitle}&body=${encodedBody}`;
};

type IssueViewProps = {
  issues?: GithubValidationIssue[];
  className?: string;
  error: boolean;
};

const IssueView = ({ issues, className, error }: IssueViewProps) => {
  if (error) {
    return (
      <a href={`${githubProjectUrl}/issues`} className="text-red-400">
        Error fetching issues, see all issues
      </a>
    );
  }

  if (!issues || issues.length === 0) {
    return <span className="text-gray-400">No issues</span>;
  }

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {issues.map((issue) => (
        <div key={issue.number} className="flex items-center">
          <a
            href={issue.html_url}
            target="_blank"
            className={cn(
              "mr-2",
              issue.state == "open" ? "text-green-3" : "text-gray-500",
            )}
          >
            {issues.length > 1 ? `#${issue.number} ` : ""}
            {issue.state === "open" ? "Issue reported" : "Issue closed"}
          </a>
          {issue.state === "open" &&
            issue.labels.map((label) => (
              <span
                key={label.name}
                style={{ backgroundColor: `#${label.color}` }}
                className="rounded-sm text-xs font-bold uppercase mx-[2px] px-1"
              >
                {label.name}
              </span>
            ))}
        </div>
      ))}
    </div>
  );
};

export const ValidationDashboard = () => {
  const year =
    new URLSearchParams(window.location.search).get("year") || "2024";

  const {
    companies: allCompanies,
    companiesLoading: companiesLoading,
    companiesError: companiesError,
  } = useCompanies();
  const unverifiedCompanies = useGetUnverifiedCompaniesForYear(parseInt(year));
  const { currentLanguage } = useLanguage();
  const {
    issues,
    isLoading: issuesLoading,
    error: issuesError,
  } = useValidationReports();

  const handleYearChange = (selectedYear: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("year", selectedYear);
    window.history.pushState({}, "", url);
    window.location.reload();
  };

  const years = Array.from({ length: 5 }, (_, i) => 2024 - i);

  const nrFinishedCompanies = allCompanies.length - unverifiedCompanies.length;
  const progress = nrFinishedCompanies / allCompanies.length;

  if (companiesError) {
    return <span>Error</span>;
  }

  if (issuesLoading || companiesLoading) {
    return <span>Loading</span>;
  }

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
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="inline-grid grid-cols-[auto_auto_auto_1fr] mb-6 gap-x-8 gap-y-2 border-b border-gray-400 pb-2">
        <div className="col-span-4">
          <p className="text-gray-400 mb-1">
            Verified: {allCompanies.length - unverifiedCompanies.length} of{" "}
            {allCompanies.length}
            <span className="ml-2">
              ({formatPercent(progress, currentLanguage)})
            </span>
          </p>
          <Progress value={progress * 100} className="mb-8" />
        </div>
        <div className="grid grid-cols-subgrid col-span-4 text-gray-400 border-b border-gray-400 pb-1 mb-2">
          <span>Company name</span>
          <span>Report link</span>
          <span>Report issue</span>
          <span>Issues</span>
        </div>

        {unverifiedCompanies.length > 0 ? (
          unverifiedCompanies.map(({ company, period }) => (
            <div key={company.id} className="grid grid-cols-subgrid col-span-4">
              <a target="_blank" href={`${getCompanyDetailPath(company)}/edit`}>
                {company.name}
              </a>
              {period.reportURL ? (
                <a
                  className="text-blue-3 text-center"
                  target="_blank"
                  href={period.reportURL}
                >
                  Report
                </a>
              ) : (
                <span />
              )}

              <a
                target="_blank"
                href={githubUrl(company, period?.reportURL)}
                className="text-blue-2 text-center"
              >
                Report issue
              </a>

              <IssueView
                issues={
                  company.wikidataId ? issues?.[company.wikidataId] : undefined
                }
                error={!!issuesError}
                className=""
              />
            </div>
          ))
        ) : (
          <span className="col-span-4 text-center text-2xl my-4">
            All done! 🎉
          </span>
        )}
      </div>
    </div>
  );
};
