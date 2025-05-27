import { Link } from "react-router-dom";
import { Building2, TrendingDown, Users, Wallet, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  useSectorNames,
  SectorCode,
} from "@/hooks/companies/useCompanyFilters";
import type { RankedCompany } from "@/types/company";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";
import { useCategoryMetadata } from "@/hooks/companies/useCategories";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatEmployeeCount,
  formatEmissionsAbsolute,
  localizeUnit,
  formatPercentChange,
} from "@/utils/localizeUnit";
import { LinkCard } from "@/components/ui/link-card";
import { cn } from "@/lib/utils";
import { AiIcon } from "@/components/ui/ai-icon";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";

type CompanyCardProps = Pick<
  RankedCompany,
  | "wikidataId"
  | "name"
  | "description"
  | "industry"
  | "reportingPeriods"
  | "metrics"
> &
  Partial<Pick<RankedCompany, "rankings">>;

export function CompanyCard({
  wikidataId,
  name,
  description,
  industry,
  reportingPeriods,
}: CompanyCardProps) {
  const { t } = useTranslation();
  const { getCategoryColor } = useCategoryMetadata();
  const sectorNames = useSectorNames();
  const { currentLanguage } = useLanguage();
  const { isAIGenerated, isEmissionsAIGenerated } = useVerificationStatus();

  const latestPeriod = reportingPeriods[0];
  const previousPeriod = reportingPeriods[1];

  const currentEmissions = latestPeriod?.emissions?.calculatedTotalEmissions;
  const previousEmissions = previousPeriod?.emissions?.calculatedTotalEmissions;
  const emissionsChange =
    previousEmissions != null && currentEmissions != null
      ? ((currentEmissions - previousEmissions) / previousEmissions) * 100
      : null;

  const employeeCount = latestPeriod?.economy?.employees?.value;
  const formattedEmployeeCount = employeeCount
    ? formatEmployeeCount(employeeCount, currentLanguage)
    : t("companies.card.noData");

  const sectorName = industry?.industryGics?.sectorCode
    ? sectorNames[industry.industryGics.sectorCode as SectorCode]
    : t("companies.card.unknownSector");

  // Find the largest scope 3 category
  const scope3Categories = latestPeriod?.emissions?.scope3?.categories || [];
  const largestCategory = scope3Categories.reduce(
    (max, current) =>
      (current?.total ?? -Infinity) > (max?.total ?? -Infinity) ? current : max,
    scope3Categories[0],
  );
  const noSustainabilityReport =
    latestPeriod?.reportURL === null ||
    latestPeriod?.reportURL === "Saknar report" ||
    latestPeriod?.reportURL === undefined;

  // Get the color for the largest category
  const categoryColor = largestCategory
    ? getCategoryColor(largestCategory.category)
    : "var(--blue-2)";

  const totalEmissionsAIGenerated = isEmissionsAIGenerated(latestPeriod);
  const turnoverAIGenerated = isAIGenerated(latestPeriod.economy?.turnover);
  const employeesAIGenerated = isAIGenerated(latestPeriod.economy?.employees);
  const yearOverYearAIGenerated =
    isEmissionsAIGenerated(latestPeriod) ||
    (previousPeriod && isEmissionsAIGenerated(previousPeriod));

  return (
    <div className="relative rounded-level-2 @container">
      <Link
        to={`/companies/${wikidataId}`}
        className="block bg-black-2 rounded-level-2 p-8 space-y-8 transition-all duration-300 hover:shadow-[0_0_10px_rgba(153,207,255,0.15)] hover:bg-[#1a1a1a]"
      >
        <div className="flex items-start justify-between rounded-level-2">
          <div className="space-y-2">
            <h2 className="text-3xl font-light">{name}</h2>
            {/* {rankings && (
            <div className="flex flex-wrap gap-4 text-sm text-grey">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span>#{rankings.overall} totalt</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ranking bland alla företag</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span>#{rankings.sector} inom {sectorName}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ranking inom {sectorName.toLowerCase()}-sektorn</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span>#{rankings.category} i kategorin</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Ranking inom företag av liknande storlek</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )} */}
            <p className="text-grey text-sm line-clamp-2">{description}</p>
          </div>
          <div
            className="w-12 h-12 rounded-full flex shrink-0 items-center justify-center"
            style={{
              backgroundColor: `color-mix(in srgb, ${categoryColor} 30%, transparent)`,
              color: categoryColor,
            }}
          >
            <Building2 className="w-6 h-6" />
          </div>
        </div>
        <div className="flex flex-col gap-4 @xl:grid grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-grey mb-2 text-lg">
              <TrendingDown className="w-4 h-4" />
              {t("companies.card.emissions")}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("companies.card.totalEmissionsInfo")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-3xl font-light">
              {currentEmissions != null ? (
                <span className="text-orange-2">
                  {formatEmissionsAbsolute(currentEmissions, currentLanguage)}
                  <span className="text-lg text-grey ml-1">
                    {t("emissionsUnit")}
                  </span>
                  {totalEmissionsAIGenerated && (
                    <span className="ml-2">
                      <AiIcon size="sm" />
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-grey">{t("companies.card.noData")}</span>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-grey mb-2 text-lg">
              <TrendingDown className="w-4 h-4" />
              <span>{t("companies.card.emissionsChangeRate")}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-80">
                    {emissionsChange != null ? (
                      emissionsChange <= -80 || emissionsChange >= 80 ? (
                        <>
                          <p>{t("companies.card.emissionsChangeRateInfo")}</p>
                          <p className="my-2">
                            {t(
                              "companies.card.emissionsChangeRateInfoExtended",
                            )}
                          </p>
                        </>
                      ) : (
                        <p>{t("companies.card.emissionsChangeRateInfo")}</p>
                      )
                    ) : (
                      <p>{t("companies.card.noData")}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="text-3xl font-light">
              {emissionsChange !== null ? (
                <span
                  className={cn(
                    emissionsChange < 0 ? "text-orange-2" : "text-pink-3",
                  )}
                >
                  {formatPercentChange(
                    Math.ceil(emissionsChange) / 100,
                    currentLanguage,
                  )}
                  {yearOverYearAIGenerated && (
                    <span className="ml-2">
                      <AiIcon size="sm" />
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-grey">{t("companies.card.noData")}</span>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black-1">
          {latestPeriod?.economy?.turnover && (
            <div>
              <Text
                variant="body"
                className="flex items-center gap-2 text-grey mb-2 text-lg"
              >
                <Wallet className="w-4 h-4" />
                <span>{t("companies.card.turnover")}</span>
              </Text>
              <Text variant="h6">
                {latestPeriod.economy.turnover.value
                  ? localizeUnit(
                      latestPeriod.economy.turnover.value / 1e9,
                      currentLanguage,
                    )
                  : t("companies.card.noData")}{" "}
                mdr
                <span className="text-lg text-grey ml-1">
                  {latestPeriod.economy.turnover.currency}
                </span>
                {turnoverAIGenerated && (
                  <span className="ml-2">
                    <AiIcon size="sm" />
                  </span>
                )}
              </Text>
            </div>
          )}

          <div>
            <Text
              variant="body"
              className="flex items-center gap-2 text-grey mb-2 text-lg"
            >
              <Users className="w-4 h-4" />{" "}
              <span>{t("companies.card.employees")}</span>
            </Text>
            {latestPeriod?.economy && (
              <Text variant="h6">
                {formattedEmployeeCount}
                {employeesAIGenerated && (
                  <span className="ml-2">
                    <AiIcon size="sm" />
                  </span>
                )}
              </Text>
            )}
          </div>
        </div>
        {/* Sustainability Report */}
        <LinkCard
          link={latestPeriod.reportURL ? latestPeriod.reportURL : undefined}
          title={t("companies.card.companyReport")}
          description={
            noSustainabilityReport
              ? t("companies.card.missingReport")
              : t("companies.card.reportYear", {
                  year: new Date(latestPeriod.endDate).getFullYear(),
                })
          }
          descriptionColor={
            noSustainabilityReport ? "text-pink-3" : "text-green-3"
          }
        />
      </Link>
    </div>
  );
}
