import { regions as municipalitiesByRegion } from "@/lib/constants/regions";
import { toMapRegionName } from "@/utils/regionUtils";

const PLACE_SUFFIXES = [
  " kommun",
  " municipality",
  " stad",
  " city",
  " län",
  " county",
] as const;

const LOCATION_FIELDS = [
  "municipality",
  "city",
  "location",
  "headquarters",
  "baseMunicipality",
  "region",
] as const;

export type CompanyReportingPeriodInput = {
  endDate?: string | null;
  emissions?: {
    calculatedTotalEmissions?: number | null;
  } | null;
};

export type CompanyPlaceSource = {
  id: string;
  name?: string;
  municipality?: string | null;
  city?: string | null;
  location?: string | null;
  headquarters?: string | null;
  baseMunicipality?: string | null;
  region?: string | null;
  tags?: string[] | null;
  reportingPeriods?: CompanyReportingPeriodInput[] | null;
};

export type CompanyComparisonInput = {
  id: string;
  location: string | null;
  reportedEmissions: number | null;
  reportedYear: number | null;
};

export type RegionTerritorialInput = {
  name: string;
  emissionsByYear: Record<string, number>;
};

export type RegionRelationship =
  | "regional-share"
  | "regional-company-only"
  | "placed-without-emissions"
  | "national-scale"
  | "region-unplaced"
  | "missing-territorial";

export type RegionCompanyComparison = {
  regionName: string;
  mapName: string;
  territorialYear: number | null;
  territorialEmissions: number | null;
  /** This region's territorial emissions divided by the national sum. */
  territorialShareOfSweden: number | null;
  companyCount: number;
  companyEmissions: number | null;
  /** Placed company reports divided by territorial emissions. */
  shareOfTerritorial: number | null;
  /** National company reports divided by this region's territorial emissions. */
  nationalScaleRatio: number | null;
  relationship: RegionRelationship;
  /** Percent used to color the map. Null when the figure is missing. */
  mapValue: number | null;
};

export type CompanyRegionComparison = {
  territorialYear: number | null;
  nationalTerritorialEmissions: number | null;
  companyEmissions: number | null;
  companyYearMin: number | null;
  companyYearMax: number | null;
  placedCompanyCount: number;
  unplacedCompanyCount: number;
  /** Company reports could be summed inside at least one region. */
  anyRegionalCompanyEmissions: boolean;
  colorMode: "company-share" | "territorial-share";
  regions: RegionCompanyComparison[];
};

type PlaceIndex = {
  municipalityToRegion: Map<string, string>;
  regionNames: Map<string, string>;
  mapNames: Map<string, string>;
};

function placeKey(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("sv-SE");
}

export function normalizePlaceName(value: string): string {
  const compact = value.trim().replace(/\s+/g, " ");
  const lower = compact.toLocaleLowerCase("sv-SE");
  for (const suffix of PLACE_SUFFIXES) {
    if (lower.endsWith(suffix)) {
      return compact.slice(0, -suffix.length).trim();
    }
  }
  return compact;
}

function buildPlaceIndex(regionNames: string[]): PlaceIndex {
  const municipalityToRegion = new Map<string, string>();
  const names = new Map<string, string>();
  const mapNames = new Map<string, string>();

  for (const [regionName, municipalities] of Object.entries(
    municipalitiesByRegion,
  )) {
    for (const municipality of municipalities) {
      municipalityToRegion.set(placeKey(municipality), regionName);
    }
    names.set(placeKey(regionName), regionName);
    mapNames.set(placeKey(toMapRegionName(regionName)), regionName);
  }

  for (const regionName of regionNames) {
    names.set(placeKey(regionName), regionName);
    mapNames.set(placeKey(toMapRegionName(regionName)), regionName);
  }

  return { municipalityToRegion, regionNames: names, mapNames };
}

function withoutGenitiveS(value: string): string | null {
  const compact = value.trim();
  if (compact.length > 2 && compact.toLocaleLowerCase("sv-SE").endsWith("s")) {
    return compact.slice(0, -1);
  }
  return null;
}

function placeCandidates(value: string): string[] {
  const normalized = normalizePlaceName(value);
  const base = [
    value.trim(),
    normalized,
    toMapRegionName(value.trim()),
    toMapRegionName(normalized),
  ];
  const extras = base
    .map((candidate) => withoutGenitiveS(candidate))
    .filter((candidate): candidate is string => Boolean(candidate));
  return [...base, ...extras];
}

function lookupPlace(value: string, index: PlaceIndex): string | null {
  const candidates = placeCandidates(value);
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const key = placeKey(candidate);
    if (!key || seen.has(key)) continue;
    seen.add(key);

    const asRegion = index.regionNames.get(key);
    if (asRegion) return asRegion;

    const asMunicipality = index.municipalityToRegion.get(key);
    if (asMunicipality) return asMunicipality;

    const asMapName = index.mapNames.get(key);
    if (asMapName) return asMapName;
  }

  return null;
}

function readExplicitLocation(company: CompanyPlaceSource): string | null {
  for (const field of LOCATION_FIELDS) {
    const value = company[field];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

/**
 * Place string from a company. Explicit municipality/city/region fields win.
 * Tags are used only when those fields are empty, and only when every matching
 * tag points at the same region.
 */
export function resolveCompanyRegionName(
  company: CompanyPlaceSource,
  index: PlaceIndex,
): string | null {
  const explicit = readExplicitLocation(company);
  if (explicit) {
    return lookupPlace(explicit, index);
  }

  const matched = new Set<string>();
  for (const tag of company.tags ?? []) {
    if (typeof tag !== "string" || !tag.trim()) continue;
    const regionName = lookupPlace(tag, index);
    if (regionName) matched.add(regionName);
  }

  if (matched.size === 1) {
    return [...matched][0];
  }

  return null;
}

function yearFromEndDate(endDate: string | null | undefined): number | null {
  if (!endDate) return null;
  const year = Number(endDate.slice(0, 4));
  return Number.isInteger(year) ? year : null;
}

function asEmissions(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return value;
}

export function latestReportedCompanyEmissions(
  periods: CompanyReportingPeriodInput[] | null | undefined,
): { reportedYear: number | null; reportedEmissions: number | null } {
  const sorted = [...(periods ?? [])].sort((a, b) =>
    (b.endDate ?? "").localeCompare(a.endDate ?? ""),
  );
  const latest = sorted[0];
  if (!latest) {
    return { reportedYear: null, reportedEmissions: null };
  }

  return {
    reportedYear: yearFromEndDate(latest.endDate),
    reportedEmissions: asEmissions(latest.emissions?.calculatedTotalEmissions),
  };
}

export function toCompanyComparisonInput(
  company: CompanyPlaceSource,
  index?: PlaceIndex,
): CompanyComparisonInput {
  const placeIndex =
    index ?? buildPlaceIndex(Object.keys(municipalitiesByRegion));
  const { reportedEmissions, reportedYear } = latestReportedCompanyEmissions(
    company.reportingPeriods,
  );
  const regionName = resolveCompanyRegionName(company, placeIndex);

  return {
    id: company.id,
    location: regionName,
    reportedEmissions,
    reportedYear,
  };
}

function chooseTerritorialYear(
  regions: RegionTerritorialInput[],
): number | null {
  const counts = new Map<number, number>();
  for (const region of regions) {
    for (const [yearKey, value] of Object.entries(region.emissionsByYear)) {
      const year = Number(yearKey);
      if (!Number.isInteger(year) || !Number.isFinite(value)) continue;
      counts.set(year, (counts.get(year) ?? 0) + 1);
    }
  }

  let bestYear: number | null = null;
  let bestCount = -1;
  for (const [year, count] of counts) {
    if (
      count > bestCount ||
      (count === bestCount && bestYear !== null && year > bestYear)
    ) {
      bestYear = year;
      bestCount = count;
    }
  }

  return bestYear;
}

function relationshipForRegion(input: {
  companyCount: number;
  companyEmissions: number | null;
  territorialEmissions: number | null;
  anyCompanyPlaced: boolean;
  nationalCompanyEmissions: number | null;
}): RegionRelationship {
  const {
    companyCount,
    companyEmissions,
    territorialEmissions,
    anyCompanyPlaced,
    nationalCompanyEmissions,
  } = input;

  if (companyCount > 0 && companyEmissions == null) {
    return "placed-without-emissions";
  }

  if (companyCount > 0 && companyEmissions != null) {
    if (territorialEmissions != null && territorialEmissions > 0) {
      return "regional-share";
    }
    return "regional-company-only";
  }

  if (
    !anyCompanyPlaced &&
    territorialEmissions != null &&
    territorialEmissions > 0 &&
    nationalCompanyEmissions != null
  ) {
    return "national-scale";
  }

  if (territorialEmissions == null) {
    return "missing-territorial";
  }

  return "region-unplaced";
}

export function compareCompaniesToRegions(
  companies: CompanyComparisonInput[],
  regions: RegionTerritorialInput[],
): CompanyRegionComparison {
  const territorialYear = chooseTerritorialYear(regions);
  const knownRegions = new Set(regions.map((region) => region.name));
  const companiesByRegion = new Map<string, CompanyComparisonInput[]>();
  let placedCompanyCount = 0;
  let unplacedCompanyCount = 0;

  for (const company of companies) {
    if (!company.location || !knownRegions.has(company.location)) {
      unplacedCompanyCount += 1;
      continue;
    }
    const bucket = companiesByRegion.get(company.location) ?? [];
    bucket.push(company);
    companiesByRegion.set(company.location, bucket);
    placedCompanyCount += 1;
  }

  const emissionYears: number[] = [];
  let companyEmissions = 0;
  let companiesWithEmissions = 0;
  for (const company of companies) {
    if (company.reportedEmissions == null) continue;
    companyEmissions += company.reportedEmissions;
    companiesWithEmissions += 1;
    if (company.reportedYear != null) emissionYears.push(company.reportedYear);
  }

  const nationalCompanyEmissions =
    companiesWithEmissions > 0 ? companyEmissions : null;

  let nationalTerritorialEmissions = 0;
  let regionsWithTerritorial = 0;
  const territorialByRegion = new Map<string, number | null>();

  for (const region of regions) {
    const value =
      territorialYear == null
        ? null
        : asEmissions(region.emissionsByYear[String(territorialYear)]);
    territorialByRegion.set(region.name, value);
    if (value != null) {
      nationalTerritorialEmissions += value;
      regionsWithTerritorial += 1;
    }
  }

  const swedenTotal =
    regionsWithTerritorial > 0 ? nationalTerritorialEmissions : null;

  const regionRows: RegionCompanyComparison[] = regions.map((region) => {
    const placed = companiesByRegion.get(region.name) ?? [];
    const withEmissions = placed.filter(
      (company) => company.reportedEmissions != null,
    );
    const regionalCompanyEmissions =
      withEmissions.length > 0
        ? withEmissions.reduce(
            (sum, company) => sum + (company.reportedEmissions ?? 0),
            0,
          )
        : null;
    const territorialEmissions = territorialByRegion.get(region.name) ?? null;
    const shareOfTerritorial =
      regionalCompanyEmissions != null &&
      territorialEmissions != null &&
      territorialEmissions > 0
        ? regionalCompanyEmissions / territorialEmissions
        : null;
    const territorialShareOfSweden =
      territorialEmissions != null && swedenTotal != null && swedenTotal > 0
        ? territorialEmissions / swedenTotal
        : null;
    const nationalScaleRatio =
      nationalCompanyEmissions != null &&
      territorialEmissions != null &&
      territorialEmissions > 0
        ? nationalCompanyEmissions / territorialEmissions
        : null;

    return {
      regionName: region.name,
      mapName: toMapRegionName(region.name),
      territorialYear,
      territorialEmissions,
      territorialShareOfSweden,
      companyCount: placed.length,
      companyEmissions: regionalCompanyEmissions,
      shareOfTerritorial,
      nationalScaleRatio,
      relationship: relationshipForRegion({
        companyCount: placed.length,
        companyEmissions: regionalCompanyEmissions,
        territorialEmissions,
        anyCompanyPlaced: placedCompanyCount > 0,
        nationalCompanyEmissions,
      }),
      mapValue: null,
    };
  });

  const anyRegionalCompanyEmissions = regionRows.some(
    (region) => region.companyEmissions != null,
  );
  const colorMode = anyRegionalCompanyEmissions
    ? "company-share"
    : "territorial-share";

  for (const region of regionRows) {
    if (colorMode === "company-share") {
      if (region.shareOfTerritorial != null) {
        region.mapValue = region.shareOfTerritorial * 100;
      } else if (
        region.companyCount === 0 &&
        region.territorialEmissions != null
      ) {
        region.mapValue = 0;
      } else {
        region.mapValue = null;
      }
    } else {
      region.mapValue =
        region.territorialShareOfSweden == null
          ? null
          : region.territorialShareOfSweden * 100;
    }
  }

  return {
    territorialYear,
    nationalTerritorialEmissions: swedenTotal,
    companyEmissions: nationalCompanyEmissions,
    companyYearMin: emissionYears.length ? Math.min(...emissionYears) : null,
    companyYearMax: emissionYears.length ? Math.max(...emissionYears) : null,
    placedCompanyCount,
    unplacedCompanyCount,
    anyRegionalCompanyEmissions,
    colorMode,
    regions: regionRows,
  };
}

export function compareCompanySourcesToRegions(
  companies: CompanyPlaceSource[],
  regions: RegionTerritorialInput[],
): CompanyRegionComparison {
  const index = buildPlaceIndex(regions.map((region) => region.name));
  return compareCompaniesToRegions(
    companies.map((company) => toCompanyComparisonInput(company, index)),
    regions,
  );
}
