import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LocalizedLink } from "@/components/LocalizedLink";
import { FinancialsTooltip } from "@/components/companies/detail/overview/FinancialsTooltip";
import { CardInfo } from "@/components/layout/CardInfo";
import { useListCardMeta } from "@/hooks/useListCardMeta";

export interface ListCardProps {
  // Basic info
  name: string;
  description: string; // For municipalities: region, For companies: sector
  linkTo: string;
  logoUrl?: string | null;

  // Meets Paris
  meetsParis: boolean | null;
  meetsParisTranslationKey: string;

  // Emissions data
  emissionsValue: string | null;
  emissionsYear?: string;
  emissionsUnit?: string;
  emissionsIsAIGenerated?: boolean;

  // Change rate data
  changeRateValue: string | null;
  changeRateIsAIGenerated?: boolean;
  changeRateColor?: string;
  changeRateTooltip?: string;

  //Reporting since (tracking)
  baseYear?: number | null;

  //Biggest emission category
  largestEmission?:
    | {
        key: string | number;
        value: number | null;
        type: "scope1" | "scope2" | "scope3";
      }
    | undefined;

  // Optional features
  isFinancialsSector?: boolean;

  // Climate plan information (municipalities)
  climatePlanHasPlan?: boolean | null;
  climatePlanYear?: number | null;

  variant?: "company" | "municipality" | "region";
}

export function ListCard({
  name,
  description,
  logoUrl,
  linkTo,
  meetsParis,
  meetsParisTranslationKey,
  emissionsValue,
  emissionsYear,
  emissionsUnit,
  emissionsIsAIGenerated,
  changeRateValue,
  changeRateIsAIGenerated,
  changeRateColor,
  changeRateTooltip,
  isFinancialsSector = false,
  largestEmission,
  baseYear,
  climatePlanHasPlan,
  climatePlanYear,
  variant = "company",
}: ListCardProps) {
  const { t } = useTranslation();
  const {
    isMunicipality,
    isRegion,
    climatePlanAdoptedText,
    climatePlanStatusColor,
    climatePlanAdoptedColor,
    categoryName,
  } = useListCardMeta({
    variant,
    climatePlanHasPlan,
    climatePlanYear,
    largestEmission,
  });

  return (
    <div className="relative rounded-level-2 @container">
      <LocalizedLink
        to={linkTo}
        className="block bg-black-2 rounded-level-2 p-8 md:space-y-4 transition-all duration-300 hover:shadow-[0_0_10px_rgba(153,207,255,0.15)] hover:bg-[#1a1a1a]"
      >
        {/* Header section */}
        <div>
          <div className="flex justify-between">
            <div className="flex flex-col">
              <h2 className="text-3xl font-light">{name}</h2>
              <p className="text-grey text-sm line -clamp-2 min-h-[40px]">
                {description}
              </p>
            </div>
            {logoUrl && <img src={logoUrl} alt="logo" className="h-[50px]" />}
          </div>

          {/* Meets Paris section */}
          <div className="flex items-center gap-2 text-grey text-lg ">
            {t(meetsParisTranslationKey)}
          </div>
          <div
            className={cn(
              "text-xl font-light border-b border-black-1 pb-6",
              meetsParis === true ? "text-green-3" : "text-pink-3",
            )}
          >
            {meetsParis === true
              ? t("yes")
              : meetsParis === false
                ? t("no")
                : t("companies.card.notEnoughData")}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4">
            <div>
              {/* Emissions */}
              <CardInfo
                title={
                  emissionsYear
                    ? `${t("companies.card.emissions")} ${emissionsYear}`
                    : t("companies.card.emissions")
                }
                value={emissionsValue}
                textColor="text-orange-2"
                unit={emissionsUnit}
                isAIGenerated={emissionsIsAIGenerated}
                suffix={isFinancialsSector ? <FinancialsTooltip /> : undefined}
              />
            </div>

            <div>
              <CardInfo
                title={
                  isRegion || isMunicipality
                    ? t("municipalities.card.changeRate")
                    : t("companies.card.emissionsChangeRate")
                }
                value={changeRateValue}
                textColor={changeRateColor || "text-orange-2"}
                isAIGenerated={changeRateIsAIGenerated}
                tooltip={changeRateTooltip}
              />
            </div>
          </div>

          {!isRegion && (
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-4 mt-6">
              <div>
                <div className="flex flex-col gap-2 text-nowrap text-grey text-lg">
                  {isMunicipality
                    ? t("municipalities.card.climatePlan")
                    : t("companies.card.reportingSince")}
                </div>
                <div
                  className={cn(
                    "text-xl font-light line-clamp-2",
                    climatePlanStatusColor,
                  )}
                >
                  {isMunicipality
                    ? climatePlanHasPlan === true
                      ? t("yes")
                      : climatePlanHasPlan === false
                        ? t("no")
                        : t("unknown")
                    : (baseYear ?? t("unknown"))}
                </div>
              </div>

              <div>
                <div className="flex flex-col gap-2 text-nowrap text-grey text-lg">
                  {isMunicipality
                    ? t("municipalities.card.climatePlanAdopted")
                    : t("companies.card.largestEmissionSource")}
                </div>
                <div
                  className={cn(
                    "text-xl font-light line-clamp-2",
                    climatePlanAdoptedColor,
                  )}
                >
                  {isMunicipality ? climatePlanAdoptedText : categoryName}
                </div>
              </div>
            </div>
          )}
        </div>
      </LocalizedLink>
    </div>
  );
}
