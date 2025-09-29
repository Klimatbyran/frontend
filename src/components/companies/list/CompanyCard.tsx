import { TrendingDown, Users, Wallet } from "lucide-react";
import type { RankedCompany } from "@/types/company";
import { Text } from "@/components/ui/text";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import {
  formatEmployeeCount,
  formatEmissionsAbsolute,
  localizeUnit,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { LinkCard } from "@/components/ui/link-card";
import { cn } from "@/lib/utils";
import { AiIcon } from "@/components/ui/ai-icon";
import { useVerificationStatus } from "@/hooks/useVerificationStatus";
import { InfoTooltip } from "@/components/layout/InfoTooltip";
import { LocalizedLink } from "@/components/LocalizedLink";
import { FinancialsTooltip } from "@/components/companies/detail/overview/FinancialsTooltip";

type CompanyCardProps = Pick<
  RankedCompany,
  | "wikidataId"
  | "name"
  | "descriptions"
  | "industry"
  | "reportingPeriods"
  | "metrics"
> &
  Partial<Pick<RankedCompany, "rankings">>;

export function CompanyCard({
  wikidataId,
  name,
  descriptions,
  industry,
  reportingPeriods,
}: CompanyCardProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { isAIGenerated, isEmissionsAIGenerated } = useVerificationStatus();

  // Check if company is in Financials sector
  const isFinancialsSector = industry?.industryGics?.sectorCode === "40";

  const latestPeriod = reportingPeriods?.[0];
  const previousPeriod = reportingPeriods?.[1];

  const localizedDescription =
    descriptions?.find(
      (d: { language: "SV" | "EN"; text: string }) =>
        d.language === (currentLanguage.toUpperCase() === "SV" ? "SV" : "EN"),
    )?.text ??
    descriptions?.[0]?.text ??
    "";

  const currentEmissions =
    latestPeriod?.emissions?.calculatedTotalEmissions || null;
  const previousEmissions =
    previousPeriod?.emissions?.calculatedTotalEmissions || null;

  const emissionsChange =
    currentEmissions && previousEmissions
      ? ((currentEmissions - previousEmissions) / previousEmissions) * 100
      : null;

  const employeeCount = latestPeriod?.economy?.employees?.value;
  const formattedEmployeeCount =
    employeeCount !== null && employeeCount !== undefined
      ? formatEmployeeCount(employeeCount, currentLanguage)
      : null;

  const latestPeriodEconomyTurnover = latestPeriod?.economy?.turnover || null;

  const noSustainabilityReport =
    !latestPeriod ||
    latestPeriod?.reportURL === null ||
    latestPeriod?.reportURL === "Saknar report" ||
    latestPeriod?.reportURL === undefined;

  const totalEmissionsAIGenerated = latestPeriod
    ? isEmissionsAIGenerated(latestPeriod)
    : false;
  const turnoverAIGenerated = latestPeriod?.economy?.turnover
    ? isAIGenerated(latestPeriod.economy.turnover)
    : false;
  const employeesAIGenerated = latestPeriod?.economy?.employees
    ? isAIGenerated(latestPeriod.economy.employees)
    : false;
  const yearOverYearAIGenerated =
    (latestPeriod && isEmissionsAIGenerated(latestPeriod)) ||
    (previousPeriod && isEmissionsAIGenerated(previousPeriod));

  return (
    <div className="relative rounded-level-2 @container">
      <LocalizedLink
        to={`/companies/${wikidataId}`}
        className="block bg-black-2 rounded-level-2 p-8 space-y-8 transition-all duration-300 hover:shadow-[0_0_10px_rgba(153,207,255,0.15)] hover:bg-[#1a1a1a]"
      >
        <div className="flex items-start justify-between rounded-level-2">
          <div className="space-y-2">
            <h2 className="text-3xl font-light">{name}</h2>
            <p className="text-grey text-sm line-clamp-2 min-h-[40px]">
              {localizedDescription}
            </p>
          </div>
          {/* TODO: add company logo to top right hand corner of card */}
        </div>
        <div className="flex flex-col gap-4 @xl:grid grid-cols-2">
          <div className="space-y-2 h-[80px]">
            <div className="flex items-center gap-2 text-grey mb-2 text-lg">
              <TrendingDown className="w-4 h-4" />
              {t("companies.card.emissions")}
              {isFinancialsSector && <FinancialsTooltip />}
            </div>
            <div className="text-3xl flex font-light h-[44px]">
              {currentEmissions != null ? (
                <span className="text-orange-2">
                  {formatEmissionsAbsolute(currentEmissions, currentLanguage)}
                  <span className="text-lg text-grey ml-1">
                    {t("emissionsUnit")}
                  </span>
                  {totalEmissionsAIGenerated && (
                    <span className="ml-2 absolute">
                      <AiIcon size="sm" className="absolute top-0" />
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-grey">{t("companies.card.noData")}</span>
              )}
            </div>
          </div>
          <div className="space-y-2 h-[80px]">
            <div className="flex items-center gap-2 text-grey mb-2 text-lg">
              <TrendingDown className="w-4 h-4" />
              <span>{t("companies.card.emissionsChangeRate")}</span>
              <InfoTooltip ariaLabel="Information about emissions change rate">
                {emissionsChange ? (
                  emissionsChange <= -80 || emissionsChange >= 80 ? (
                    <>
                      <p>{t("companies.card.emissionsChangeRateInfo")}</p>
                      <p className="my-2">
                        {t("companies.card.emissionsChangeRateInfoExtended")}
                      </p>
                    </>
                  ) : (
                    <p>{t("companies.card.emissionsChangeRateInfo")}</p>
                  )
                ) : (
                  <p>{t("companies.card.noData")}</p>
                )}
              </InfoTooltip>
            </div>
            <div className="text-3xl font-light">
              {emissionsChange ? (
                <span
                  className={cn(
                    emissionsChange < 0 ? "text-orange-2" : "text-pink-3",
                  )}
                >
                  {formatPercentChange(emissionsChange, currentLanguage)}
                  {yearOverYearAIGenerated && (
                    <span className="ml-2 absolute">
                      <AiIcon size="sm" className="absolute top-0" />
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
          <div>
            <Text
              variant="body"
              className="flex items-center gap-2 text-grey mb-2 text-lg"
            >
              <Wallet className="w-4 h-4" />
              <span>{t("companies.card.turnover")}</span>
            </Text>

            {latestPeriodEconomyTurnover?.value ? (
              <Text variant="h6">
                {localizeUnit(
                  latestPeriodEconomyTurnover.value / 1e9,
                  currentLanguage,
                )}{" "}
                <span className="text-lg text-grey ml-1">
                  {t("companies.card.turnoverAmount")}
                </span>
                <span className="text-lg text-grey ml-1">
                  {latestPeriodEconomyTurnover.currency}
                </span>
                {turnoverAIGenerated && (
                  <span className="ml-2 absolute">
                    <AiIcon size="sm" className="absolute top-0" />
                  </span>
                )}
              </Text>
            ) : (
              <Text variant="h6" className="text-grey">
                {t("companies.card.noData")}
              </Text>
            )}
          </div>

          <div>
            <Text
              variant="body"
              className="flex items-center gap-2 text-grey mb-2 text-lg"
            >
              <Users className="w-4 h-4" />{" "}
              <span>{t("companies.card.employees")}</span>
            </Text>
            {latestPeriod?.economy?.employees ? (
              <Text variant="h6">
                {formattedEmployeeCount}
                {employeesAIGenerated && (
                  <span className="ml-2 absolute">
                    <AiIcon size="sm" className="absolute top-0" />
                  </span>
                )}
              </Text>
            ) : (
              <Text variant="h6" className="text-grey">
                {" "}
                {t("companies.card.noData")}
              </Text>
            )}
          </div>
        </div>
        {/* Sustainability Report */}
        <LinkCard
          link={latestPeriod?.reportURL ? latestPeriod.reportURL : undefined}
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
      </LocalizedLink>
    </div>
  );
}
