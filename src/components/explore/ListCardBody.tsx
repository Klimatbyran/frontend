import { useListCardMeta } from "@/hooks/useListCardMeta";
import type { ListCardProps } from "./ListCard";
import { ListCardEmissionsBlock } from "./ListCardEmissionsBlock";
import { ListCardFooterBlock } from "./ListCardFooterBlock";
import { ListCardHeader } from "./ListCardHeader";

export function ListCardBody({
  name,
  description,
  logoUrl,
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
  hasScope3Coverage,
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
    climatePlanStatusLabel,
    climatePlanAdoptedColor,
  } = useListCardMeta({
    variant,
    climatePlanHasPlan,
    climatePlanYear,
  });

  return (
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
          climatePlanAdoptedText={climatePlanAdoptedText}
          climatePlanStatusColor={climatePlanStatusColor}
          climatePlanStatusLabel={climatePlanStatusLabel}
          climatePlanAdoptedColor={climatePlanAdoptedColor}
          hasScope3Coverage={hasScope3Coverage}
          baseYear={baseYear}
        />
      )}
    </div>
  );
}
