/** Slim page payloads from `GET /pages/*` (Klimatkollen site API). */

export type PageListResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type PageCompanyOverviewItem = {
  id: string;
  wikidataId?: string | null;
  name: string;
  logoUrl?: string | null;
  tags: string[];
  sectorCode: string | null;
  industryGroupCode: string | null;
  baseYear: number | null;
  meetsParis: boolean | null;
  emissionsChangeFromBaseYear: number | null;
  latestYear: number | null;
  latestTotalEmissions: number | null;
};

export type PageOverviewVerdictCompany = {
  id: string;
  wikidataId?: string | null;
  name: string;
  emissionsChangeFromBaseYear: number;
};

export type PageIndustryBreakdown = {
  code: string;
  companyCount: number;
  emissions: number;
  onTrackShare: number | null;
};

export type PageCompaniesOverviewSummary = {
  paris: {
    total: number;
    onTrack: number;
    offTrack: number;
    unknown: number;
    onTrackPercent: number;
  };
  reporting: {
    total: number;
    enough: number;
    tooLittle: number;
  };
  industries: PageIndustryBreakdown[];
  industryFilters: Array<{ code: string; companyCount: number }>;
  companyCount: number;
  doingWell: PageOverviewVerdictCompany[];
  fallingBehind: PageOverviewVerdictCompany[];
};

export type PageExploreCompany = PageCompanyOverviewItem & {
  emissionsChangeLastTwoYears: number | null;
  emissionsIsAIGenerated: boolean;
  changeRateIsAIGenerated: boolean;
  hasScope3Coverage: boolean;
  isFinancialsSector: boolean;
  scope1Emissions: number | null;
  scope2Emissions: number | null;
  scope3Emissions: number | null;
  turnover: number | null;
  turnoverCurrency: string | null;
  turnoverIsAIGenerated: boolean;
  employees: number | null;
  employeesIsAIGenerated: boolean;
};

export type PageLanding = {
  companies: Array<{
    id: string;
    wikidataId?: string | null;
    name: string;
    latestTotalEmissions: number;
  }>;
  municipalities: Array<{
    name: string;
    historicalEmissionChangePercent: number;
  }>;
};

export type PageSitemap = {
  companies: Array<{
    id: string;
    wikidataId?: string | null;
    name: string;
  }>;
  municipalities: Array<{ name: string }>;
  regions: Array<{ name: string }>;
};

export type PageCompanyHeader = {
  id: string;
  wikidataId?: string | null;
  name: string;
  logoUrl?: string | null;
  descriptions: Array<{ language: string; text: string }>;
  sectorCode: string | null;
  industryGroupCode: string | null;
  baseYear: number | null;
  availableYears: number[];
};

export type PageCompanyOverview = {
  year: number | null;
  meetsParis: boolean | null;
  totalEmissions: number | null;
  emissionsChangeLastTwoYears: number | null;
  emissionsIsAIGenerated: boolean;
  changeRateIsAIGenerated: boolean;
  turnover: number | null;
  turnoverCurrency: string | null;
  turnoverIsAIGenerated: boolean;
  employees: number | null;
  employeesIsAIGenerated: boolean;
  reportURL: string | null;
  sectorCode: string | null;
  industryGroupCode: string | null;
  previousYear: number | null;
};

export type PageAiValue = {
  value: number | null;
  isAIGenerated: boolean;
};

export type PageCompanyEmissionsHistory = {
  baseYear: number | null;
  futureEmissionsTrendSlope: number | null;
  sectorCode: string | null;
  periods: Array<{
    year: number;
    total: number | null;
    isAIGenerated: boolean;
    scope1: PageAiValue | null;
    scope2: PageAiValue | null;
    scope3: PageAiValue | null;
    scope3Categories: Array<{
      category: number;
      value: number | null;
      isAIGenerated: boolean;
    }>;
  }>;
};

export type PageCompanyTurnoverHistory = {
  baseYear: number | null;
  periods: Array<{
    year: number;
    total: number | null;
    isAIGenerated: boolean;
    turnover: number | null;
    turnoverCurrency: string | null;
    turnoverIsAIGenerated: boolean;
  }>;
};

export type PageCompanyScope3 = {
  year: number | null;
  calculatedTotalEmissions: number | null;
  categories: Array<{
    category: number;
    total: number | null;
    isAIGenerated: boolean;
  }>;
};

export type PageCompaniesOverviewQuery = {
  sector?: string | null;
  q?: string;
  sortBy?: "name" | "emissions" | "change" | "paris" | "sector";
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};
