/**
 * Lightweight `/pages/*` responses from the Unearth API.
 * These routes are not in the generated production schema yet, so the client
 * intersects them with `paths` from `api-types.ts`.
 */

type NoParams = {
  query?: never;
  header?: never;
  path?: never;
  cookie?: never;
};

type PageQuery = {
  query?: {
    page?: number;
    pageSize?: number;
  };
  header?: never;
  path?: never;
  cookie?: never;
};

export type CompaniesOverviewItem = {
  /** Format: uuid */
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

export type ExploreCompanyItem = CompaniesOverviewItem & {
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
  employees: number | null;
  turnoverIsAIGenerated: boolean;
  employeesIsAIGenerated: boolean;
};

export type ExploreCompaniesPage = {
  items: ExploreCompanyItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ExploreMunicipalityItem = {
  name: string;
  region: string;
  logoUrl: string | null;
  lastYear: number | null;
  lastYearEmissions: number | null;
  historicalEmissionChangePercent: number;
  meetsParis: boolean;
  climatePlan: boolean;
  climatePlanYear: number | null;
  totalConsumptionEmission: number;
  electricCarChangePercent: number;
  electricVehiclePerChargePoints: number | null;
  bicycleMetrePerCapita: number;
  procurementScore: number;
  politicalRule: string[];
  politicalKSO: string;
};

export type ExploreMunicipalitiesPage = {
  items: ExploreMunicipalityItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ExploreRegionItem = {
  name: string;
  logoUrl?: string | null;
  lastYear: number | null;
  lastYearEmissions: number | null;
  historicalEmissionChangePercent: number;
  meetsParis: boolean;
  municipalityCount: number;
  municipalities: string[];
};

export type ExploreRegionsPage = {
  items: ExploreRegionItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type LandingPageResponse = {
  companies: {
    id: string;
    wikidataId?: string | null;
    name: string;
    latestTotalEmissions: number;
  }[];
  municipalities: {
    name: string;
    historicalEmissionChangePercent: number;
  }[];
};

export type SectorPeriod = {
  year: number;
  scope1: number | null;
  scope2: number | null;
  scope3: number | null;
  total: number | null;
};

export type SectorCompanyItem = {
  id: string;
  wikidataId?: string | null;
  name: string;
  tags: string[];
  sectorCode: string | null;
  industryGroupCode: string | null;
  periods: SectorPeriod[];
};

export type SitemapPageResponse = {
  companies: {
    id: string;
    wikidataId?: string | null;
    name: string;
  }[];
  municipalities: {
    name: string;
  }[];
  regions: {
    name: string;
  }[];
};

type JsonGet<T, Params extends NoParams | PageQuery = NoParams> = {
  parameters: Params;
  requestBody?: never;
  responses: {
    200: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        "application/json": T;
      };
    };
  };
};

export interface PagePaths {
  "/pages/companies-overview": {
    parameters: NoParams;
    get: JsonGet<CompaniesOverviewItem[]>;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/pages/explore/companies": {
    parameters: PageQuery;
    get: JsonGet<ExploreCompaniesPage, PageQuery>;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/pages/explore/municipalities": {
    parameters: PageQuery;
    get: JsonGet<ExploreMunicipalitiesPage, PageQuery>;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/pages/explore/regions": {
    parameters: PageQuery;
    get: JsonGet<ExploreRegionsPage, PageQuery>;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/pages/landing": {
    parameters: NoParams;
    get: JsonGet<LandingPageResponse>;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/pages/sectors": {
    parameters: NoParams;
    get: JsonGet<SectorCompanyItem[]>;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/pages/sitemap": {
    parameters: NoParams;
    get: JsonGet<SitemapPageResponse>;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
