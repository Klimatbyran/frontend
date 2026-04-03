import { cn } from "@/lib/utils";
import { LocalizedLink } from "@/components/LocalizedLink";
import { useListCardMeta } from "@/hooks/useListCardMeta";
import { ListCardEmissionsBlock } from "./ListCardEmissionsBlock";
import { ListCardFooterBlock } from "./ListCardFooterBlock";
import { ListCardHeader } from "./ListCardHeader";

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

  const linkHeightClass = isRegion
    ? "h-[320px] sm:h-[340px] md:h-[400px] lg:h-[380px] xl:h-[400px]"
    : "h-[470px] sm:h-[490px] md:h-[560px] lg:h-[540px] xl:h-[520px]";

  return (
    <div className="relative rounded-level-2">
      <LocalizedLink
        to={linkTo}
        className={cn(
          "flex flex-col overflow-hidden bg-black-2 rounded-level-2 p-8 md:space-y-4 transition-all duration-300 hover:shadow-[0_0_10px_rgba(153,207,255,0.15)] hover:bg-[#1a1a1a]",
          linkHeightClass,
        )}
      >
        <div>
          <ListCardHeader
            name={name}
            description={description}
            meetsParis={meetsParis}
            meetsParisTranslationKey={meetsParisTranslationKey}
            logoUrl={logoUrl}
            isMunicipality={isMunicipality}
            isRegion={isRegion}
          />
          <ListCardEmissionsBlock
            emissionsYear={emissionsYear}
            emissionsValue={emissionsValue}
            emissionsUnit={emissionsUnit}
            emissionsIsAIGenerated={emissionsIsAIGenerated}
            isFinancialsSector={isFinancialsSector}
            changeRateValue={changeRateValue}
            changeRateIsAIGenerated={changeRateIsAIGenerated}
            changeRateColor={changeRateColor}
            changeRateTooltip={changeRateTooltip}
            isRegion={isRegion}
            isMunicipality={isMunicipality}
          />
          {!isRegion && (
            <ListCardFooterBlock
              isMunicipality={isMunicipality}
              climatePlanHasPlan={climatePlanHasPlan}
              climatePlanAdoptedText={climatePlanAdoptedText}
              climatePlanStatusColor={climatePlanStatusColor}
              climatePlanAdoptedColor={climatePlanAdoptedColor}
              categoryName={categoryName}
              baseYear={baseYear}
            />
          )}
        </div>
      </LocalizedLink>
    </div>
  );
}
