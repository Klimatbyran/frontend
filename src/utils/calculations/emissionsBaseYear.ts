import { yearFromIsoDate } from "@/utils/date";

type ReportingPeriod = {
  startDate: string;
  endDate: string;
  emissions?: {
    calculatedTotalEmissions?: number | null;
  } | null;
};

type CompanyForBaseYearChange = {
  baseYear?: { year?: number } | null;
  reportingPeriods?: ReportingPeriod[];
};

function sortReportingPeriods(periods: ReportingPeriod[]): ReportingPeriod[] {
  return [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function findBaselinePeriod(
  periods: ReportingPeriod[],
  baseYear: number,
): ReportingPeriod | undefined {
  const baseYearStr = baseYear.toString();
  return periods.find((p) => yearFromIsoDate(p.endDate) === baseYearStr);
}

function findLatestPeriod(
  periods: ReportingPeriod[],
  baseYear: number,
  useLastPeriod: boolean,
): ReportingPeriod | null {
  if (useLastPeriod) {
    return periods[periods.length - 1];
  }

  for (let i = periods.length - 1; i >= 0; i--) {
    const periodYear = Number(yearFromIsoDate(periods[i].endDate));
    if (periodYear <= baseYear) {
      continue;
    }

    const emissions = periods[i].emissions?.calculatedTotalEmissions ?? null;
    if (emissions !== null && emissions > 0) {
      return periods[i];
    }
  }

  return null;
}

function calculateChangePercent(
  baselineEmissions: number,
  latestEmissions: number,
): number | null {
  const changePercent =
    ((latestEmissions - baselineEmissions) / baselineEmissions) * 100;

  if (Math.abs(changePercent) > 200) {
    return null;
  }

  return changePercent;
}

function isValidBaseline(
  baselineEmissions: number | null | undefined,
): baselineEmissions is number {
  return (
    baselineEmissions !== null &&
    baselineEmissions !== undefined &&
    baselineEmissions !== 0
  );
}

export function calculateEmissionsChangeFromBaseYear(
  company: CompanyForBaseYearChange,
  options?: {
    useLastPeriod?: boolean;
  },
): number | null {
  if (!company.reportingPeriods?.length || !company.baseYear?.year) {
    return null;
  }

  const baseYear = company.baseYear.year;
  const periods = sortReportingPeriods(company.reportingPeriods);
  const baselinePeriod = findBaselinePeriod(periods, baseYear);
  if (!baselinePeriod) {
    return null;
  }

  const baselineEmissions =
    baselinePeriod.emissions?.calculatedTotalEmissions ?? null;
  if (!isValidBaseline(baselineEmissions)) {
    return null;
  }

  const latestPeriod = findLatestPeriod(
    periods,
    baseYear,
    options?.useLastPeriod ?? false,
  );
  if (!latestPeriod) {
    return null;
  }

  const latestYear = Number(yearFromIsoDate(latestPeriod.endDate));
  if (latestYear <= baseYear) {
    return null;
  }

  const latestEmissions = latestPeriod.emissions?.calculatedTotalEmissions ?? 0;
  return calculateChangePercent(baselineEmissions, latestEmissions);
}
