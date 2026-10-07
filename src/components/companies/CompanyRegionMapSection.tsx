import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { FeatureCollection } from "geojson";
import regionGeoJson from "@/data/regionGeo.json";
import TerritoryMap from "@/components/maps/TerritoryMap";
import { useLanguage } from "@/components/LanguageProvider";
import { Text } from "@/components/ui/text";
import { useRegionsForExplore } from "@/hooks/regions/useRegionsForExplore";
import type { CompanyWithKPIs } from "@/hooks/companies/useCompanyKPIs";
import type { SupportedLanguage } from "@/lib/languageDetection";
import type { DataItem, DataKPI } from "@/types/rankings";
import {
  compareCompanySourcesToRegions,
  type CompanyPlaceSource,
  type RegionCompanyComparison,
  type RegionRelationship,
} from "@/utils/companies/regionCompanyComparison";
import {
  formatEmissionsAbsolute,
  formatPercent,
} from "@/utils/formatting/localization";
import { getEntityDetailPath } from "@/utils/routing";

const geoData = regionGeoJson as FeatureCollection;

function toPlaceSource(company: CompanyWithKPIs): CompanyPlaceSource {
  const withPlace = company as CompanyWithKPIs & Partial<CompanyPlaceSource>;
  return {
    id: company.id,
    name: company.name,
    municipality: withPlace.municipality,
    city: withPlace.city,
    location: withPlace.location,
    headquarters: withPlace.headquarters,
    baseMunicipality: withPlace.baseMunicipality,
    region: withPlace.region,
    tags: company.tags,
    reportingPeriods: company.reportingPeriods?.map((period) => ({
      endDate: period.endDate,
      emissions: period.emissions
        ? {
            calculatedTotalEmissions: period.emissions.calculatedTotalEmissions,
          }
        : null,
    })),
  };
}

function formatRatio(value: number, language: SupportedLanguage): string {
  return new Intl.NumberFormat(language === "en" ? "en-GB" : "sv-SE", {
    maximumFractionDigits: 1,
  }).format(value);
}

function yearSpan(
  min: number | null,
  max: number | null,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  if (min == null || max == null) return "";
  if (min === max) {
    return t("companiesOverviewPage.regionMap.card.yearSpanSingle", {
      year: min,
    });
  }
  return t("companiesOverviewPage.regionMap.card.yearSpan", { min, max });
}

function relationshipText(
  region: RegionCompanyComparison,
  nationalCompanyEmissions: number | null,
  companyYearMin: number | null,
  companyYearMax: number | null,
  language: SupportedLanguage,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  const territorial =
    region.territorialEmissions == null
      ? ""
      : formatEmissionsAbsolute(region.territorialEmissions, language);
  const regionalCompany =
    region.companyEmissions == null
      ? ""
      : formatEmissionsAbsolute(region.companyEmissions, language);
  const nationalCompany =
    nationalCompanyEmissions == null
      ? ""
      : formatEmissionsAbsolute(nationalCompanyEmissions, language);
  const share =
    region.shareOfTerritorial == null
      ? ""
      : formatPercent(region.shareOfTerritorial, language);
  const ratio =
    region.nationalScaleRatio == null
      ? ""
      : formatRatio(region.nationalScaleRatio, language);

  const copy: Record<RegionRelationship, string> = {
    "regional-share": t(
      "companiesOverviewPage.regionMap.card.relationshipRegionalShare",
      {
        region: region.regionName,
        company: regionalCompany,
        share,
        territorial,
        year: region.territorialYear ?? "",
      },
    ),
    "regional-company-only": t(
      "companiesOverviewPage.regionMap.card.relationshipCompanyOnly",
      {
        region: region.regionName,
        company: regionalCompany,
      },
    ),
    "placed-without-emissions": t(
      "companiesOverviewPage.regionMap.card.relationshipPlacedWithoutEmissions",
      {
        count: region.companyCount,
        region: region.regionName,
      },
    ),
    "national-scale": t(
      "companiesOverviewPage.regionMap.card.relationshipNationalScale",
      {
        region: region.regionName,
        company: nationalCompany,
        yearSpan: yearSpan(companyYearMin, companyYearMax, t),
        ratio,
        territorial,
        year: region.territorialYear ?? "",
      },
    ),
    "region-unplaced": t(
      "companiesOverviewPage.regionMap.card.relationshipRegionUnplaced",
      { region: region.regionName },
    ),
    "missing-territorial": t(
      "companiesOverviewPage.regionMap.card.relationshipMissingTerritorial",
      { region: region.regionName },
    ),
  };

  return copy[region.relationship];
}

export function CompanyRegionMapSection({
  companies,
}: {
  companies: CompanyWithKPIs[];
}) {
  const { t } = useTranslation();
  const { currentLanguage, getLocalizedPath } = useLanguage();
  const { regions, loading, error } = useRegionsForExplore();
  const [activeMapName, setActiveMapName] = useState<string | null>(null);

  const comparison = useMemo(
    () =>
      compareCompanySourcesToRegions(
        companies.map(toPlaceSource),
        regions.map((region) => ({
          name: region.name,
          emissionsByYear: region.emissions,
        })),
      ),
    [companies, regions],
  );

  const selectedKPI = useMemo<DataKPI>(
    () => ({
      key: "mapValue",
      label:
        comparison.colorMode === "company-share"
          ? t("companiesOverviewPage.regionMap.legendCompanyShare")
          : t("companiesOverviewPage.regionMap.legendTerritorialShare"),
      unit: "%",
      higherIsBetter: false,
    }),
    [comparison.colorMode, t],
  );

  const mapData = useMemo<DataItem[]>(
    () =>
      comparison.regions.map((region) => ({
        id: region.mapName,
        name: region.mapName,
        displayName: region.regionName,
        mapValue: region.mapValue,
      })),
    [comparison.regions],
  );

  const defaultMapName = useMemo(() => {
    const ranked = [...comparison.regions].sort(
      (a, b) => (b.territorialEmissions ?? -1) - (a.territorialEmissions ?? -1),
    );
    return ranked[0]?.mapName ?? null;
  }, [comparison.regions]);

  const resolvedMapName = comparison.regions.some(
    (region) => region.mapName === activeMapName,
  )
    ? activeMapName
    : defaultMapName;

  const activeRegion =
    comparison.regions.find((region) => region.mapName === resolvedMapName) ??
    null;

  const description =
    comparison.regions.length === 0 || comparison.territorialYear == null
      ? t("companiesOverviewPage.regionMap.descriptionNoTerritorial")
      : comparison.colorMode === "company-share"
        ? t("companiesOverviewPage.regionMap.descriptionPlaced", {
            year: comparison.territorialYear,
          })
        : t("companiesOverviewPage.regionMap.descriptionUnplaced", {
            year: comparison.territorialYear,
          });

  return (
    <section
      className="mt-12 space-y-4"
      aria-labelledby="company-region-map-title"
    >
      <div className="max-w-3xl space-y-2">
        <h2 id="company-region-map-title" className="text-2xl font-light">
          {t("companiesOverviewPage.regionMap.title")}
        </h2>
        <Text variant="small" className="text-grey">
          {loading
            ? t("companiesOverviewPage.regionMap.loading")
            : error
              ? t("companiesOverviewPage.regionMap.error")
              : description}
        </Text>
        {comparison.colorMode === "company-share" &&
          comparison.unplacedCompanyCount > 0 && (
            <Text variant="small" className="text-grey">
              {t("companiesOverviewPage.regionMap.unplacedNote", {
                count: comparison.unplacedCompanyCount,
              })}
            </Text>
          )}
      </div>

      {!loading && !error && comparison.regions.length > 0 && (
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          <div className="h-[420px] md:h-[560px]">
            <TerritoryMap
              entityType="regions"
              geoData={geoData}
              data={mapData}
              selectedKPI={selectedKPI}
              hoveredArea={resolvedMapName}
              onHoveredAreaChange={(area) => {
                if (area) setActiveMapName(area);
              }}
              onAreaClick={setActiveMapName}
              showTooltip={false}
              scrollWheelZoom={false}
              fitBounds
              legendPosition="bottom-left"
              className="max-w-none"
            />
          </div>

          {activeRegion && (
            <div className="flex flex-col gap-4 rounded-level-2 bg-black-2 p-4 md:p-6">
              <label className="flex flex-col gap-2 text-sm text-grey">
                <span>{t("companiesOverviewPage.regionMap.chooseRegion")}</span>
                <select
                  className="rounded-md border border-white/10 bg-black-1 px-3 py-2 text-white"
                  value={resolvedMapName ?? ""}
                  onChange={(event) => setActiveMapName(event.target.value)}
                >
                  {comparison.regions.map((region) => (
                    <option key={region.regionName} value={region.mapName}>
                      {region.regionName}
                    </option>
                  ))}
                </select>
              </label>

              <div className="space-y-4" aria-live="polite">
                <p className="text-xl font-medium">{activeRegion.regionName}</p>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-grey">
                      {activeRegion.territorialEmissions == null
                        ? t(
                            "companiesOverviewPage.regionMap.card.territorialMissing",
                          )
                        : t(
                            "companiesOverviewPage.regionMap.card.territorialLabel",
                            { year: activeRegion.territorialYear ?? "" },
                          )}
                    </dt>
                    {activeRegion.territorialEmissions != null && (
                      <dd className="text-lg text-orange-2">
                        {formatEmissionsAbsolute(
                          activeRegion.territorialEmissions,
                          currentLanguage,
                        )}{" "}
                        {t("companiesOverviewPage.regionMap.card.unit")}
                      </dd>
                    )}
                  </div>
                  <div>
                    <dt className="text-sm text-grey">
                      {activeRegion.relationship === "national-scale"
                        ? t(
                            "companiesOverviewPage.regionMap.card.companyInList",
                          )
                        : t(
                            "companiesOverviewPage.regionMap.card.companyInRegion",
                          )}
                    </dt>
                    <dd className="text-lg text-orange-2">
                      {activeRegion.relationship === "national-scale" &&
                      comparison.companyEmissions != null
                        ? `${formatEmissionsAbsolute(comparison.companyEmissions, currentLanguage)} ${t("companiesOverviewPage.regionMap.card.unit")}`
                        : activeRegion.companyEmissions != null
                          ? `${formatEmissionsAbsolute(activeRegion.companyEmissions, currentLanguage)} ${t("companiesOverviewPage.regionMap.card.unit")}`
                          : t(
                              activeRegion.companyCount === 0
                                ? "companiesOverviewPage.regionMap.card.companyNonePlaced"
                                : "companiesOverviewPage.regionMap.card.companyMissing",
                            )}
                    </dd>
                    {activeRegion.companyCount > 0 && (
                      <dd className="text-sm text-white/70">
                        {t(
                          "companiesOverviewPage.regionMap.card.companyCount",
                          { count: activeRegion.companyCount },
                        )}
                      </dd>
                    )}
                  </div>
                </dl>
                <p className="text-sm leading-relaxed text-white/80">
                  {relationshipText(
                    activeRegion,
                    comparison.companyEmissions,
                    comparison.companyYearMin,
                    comparison.companyYearMax,
                    currentLanguage,
                    t,
                  )}
                </p>
                <Link
                  className="text-sm text-orange-2 underline-offset-2 hover:underline"
                  to={getLocalizedPath(
                    getEntityDetailPath("region", activeRegion.regionName),
                  )}
                >
                  {t("companiesOverviewPage.regionMap.card.openRegion")}
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
