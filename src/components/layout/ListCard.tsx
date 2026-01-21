import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { LocalizedLink } from "@/components/LocalizedLink";
import { FinancialsTooltip } from "@/components/companies/detail/overview/FinancialsTooltip";
import { CardInfo } from "@/components/layout/CardInfo";
import { useCategoryMetadata } from "@/hooks/companies/useCategories";

interface ListCardProps {
  // Basic info
  name: string;
  description: string; // For municipalities: region, For companies: sector
  linkTo: string;
  logoUrl?: string | null;

  // Meets Paris
  meetsParis: boolean | null; // true = Yes, false = No, null = Unknown
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

  // Latest report
  latestReportContainEmissions?: boolean | string;
  latestReportTranslationKey: string;
  latestReportYearColor?: string;

  //Emission tracking
  emissionTrackingTranslationKey: string;
  companyBaseYear: number | null;

  //Biggest emission category
  largestEmission:
    | {
        key: string | number;
        value: number | null;
        type: "scope1" | "scope2" | "scope3";
      }
    | undefined;
  largestEmissionTranslationKey: string;

  // Optional features
  isFinancialsSector?: boolean;
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
  latestReportTranslationKey,
  latestReportContainEmissions,
  isFinancialsSector = false,
  largestEmission,
  largestEmissionTranslationKey,
  emissionTrackingTranslationKey,
  companyBaseYear,
}: ListCardProps) {
  const { t } = useTranslation();
  const category = useCategoryMetadata();
  console.log(largestEmission);

  let categoryName;

  if (largestEmission?.type === "scope3" && largestEmission.key !== null) {
    categoryName = category.getCategoryName(largestEmission?.key as number);
  }

  console.log(categoryName);
  return (
    <div className="relative rounded-level-2 @container">
      <LocalizedLink
        to={linkTo}
        className="block bg-black-2 rounded-level-2 p-8 space-y-4 transition-all duration-300 hover:shadow-[0_0_10px_rgba(153,207,255,0.15)] hover:bg-[#1a1a1a]"
      >
        {/* Header section */}
        <div>
          <div className="flex">
            <div className="flex flex-col">
              <h2 className="text-3xl font-light">{name}</h2>
              <p className="text-grey text-sm line-clamp-2 min-h-[40px]">
                {description}
              </p>
            </div>
            {logoUrl && <img src={logoUrl} alt="logo" className="h-[50px]" />}
          </div>

          {/* Meets Paris section */}
          <div className="flex items-center gap-2 text-grey text-lg ">
            {t(meetsParisTranslationKey, { name })}
          </div>
          <div
            className={cn(
              "text-xl font-light border-b border-black-1 pb-6",
              meetsParis === true
                ? "text-green-3"
                : meetsParis === false
                  ? "text-pink-3"
                  : "text-grey",
            )}
          >
            {meetsParis === true
              ? t("yes")
              : meetsParis === false
                ? t("no")
                : t("unknown")}
          </div>

          {/* Sustainability report / Climate plan section */}
          <div className="flex gap-40 mt-2">
            <div>
              <div className="flex flex-col gap-2 text-nowrap text-grey mt-2 text-lg">
                {t(emissionTrackingTranslationKey)}
              </div>
              <div className={cn("text-lg font-light", "text-white")}>
                {latestReportContainEmissions ? companyBaseYear : t("unknown")}
              </div>
            </div>

            <div>
              <div className="flex flex-col gap-2 text-nowrap text-grey mt-2 text-lg">
                {t(largestEmissionTranslationKey)}
              </div>
              <div className={cn("text-lg font-light", "text-white")}>
                {categoryName
                  ? categoryName
                  : largestEmission?.key !== null
                    ? largestEmission?.key
                    : t("unknown")}
              </div>
            </div>
          </div>
        </div>

        {/* Emissions and largest emissions section */}
        <div className="flex gap-52 mt-2">
          {/* Change Rate */}
          <CardInfo
            title={t("companies.card.emissionsChangeRate")}
            value={changeRateValue}
            textColor={changeRateColor || "text-orange-2"}
            isAIGenerated={changeRateIsAIGenerated}
            tooltip={changeRateTooltip}
          />
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
      </LocalizedLink>
    </div>
  );
}
