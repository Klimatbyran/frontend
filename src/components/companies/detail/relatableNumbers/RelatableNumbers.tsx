import { useTranslation } from "react-i18next";
import RelatableNumbersChangeRate from "@/components/companies/detail/relatableNumbers/RelatableNumbersChangeRate";
import ImpactForSelectYear from "./ImpactForSelectYear";
import { SupportedLanguage } from "@/lib/languageDetection";
import { Text } from "@/components/ui/text";
import { InfoTooltip } from "@/components/layout/InfoTooltip";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DataGuideItemId } from "@/data-guide/items";

const HELP_ITEMS: DataGuideItemId[] = [
  "relatableNumbers",
  "degsWarming",
  "forestFires",
  "citizens",
];

export type RelatableNumbersProps = {
  companyName: string;
  emissionsChange: number;
  emissionsChangeStatus: string;
  currentLanguage: SupportedLanguage;
  yearOverYearChange: number | null;
  reportingPeriods: any;
  impactYearValue: number | null;
};

const RelatableNumbers = (props: RelatableNumbersProps) => {
  const { t } = useTranslation();

  return (
    <SectionWithHelp helpItems={HELP_ITEMS}>
      <div className="flex items-center gap-2">
        <Text variant="h3">{t("relatableNumbers.title")}</Text>
        <InfoTooltip>{t("relatableNumbers.tooltip")}</InfoTooltip>
      </div>
      <section aria-label="Change rate impact">
        <RelatableNumbersChangeRate {...props} />
      </section>
      <section
        aria-label="Impact for the select year"
        className="mt-8 pt-8 border-t border-gray-500"
      >
        <ImpactForSelectYear {...props} />
      </section>
    </SectionWithHelp>
  );
};

export default RelatableNumbers;
