import { useTranslation } from "react-i18next";
import RelatableNumbersChangeRate from "@/components/companies/detail/relatableNumbers/RelatableNumbersChangeRate";
import ImpactForSelectYear from "./ImpactForSelectYear";
import { SupportedLanguage } from "@/lib/languageDetection";
import { Text } from "@/components/ui/text";
import { InfoTooltip } from "@/components/layout/InfoTooltip";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";
import { DataGuideItemId } from "@/data-guide/items";
import { ReportingPeriod } from "@/types/company";

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
  impactPeriod: ReportingPeriod;
};

const RelatableNumbers = (props: RelatableNumbersProps) => {
  const { t } = useTranslation();

  return (
    <SectionWithHelp helpItems={HELP_ITEMS}>
      <div className="flex items-center gap-2">
        <Text variant="h3">{t("relatableNumbers.title")}</Text>
        <InfoTooltip>{t("relatableNumbers.tooltip")}</InfoTooltip>
      </div>
      <Text
        variant="body"
        className=" text-grey mt-6 mb-4 text-sm md:text-base lg:text-lg"
      >
        {t("relatableNumbers.changeRateSubtitle")}
      </Text>
      <section
        aria-label="Change rate impact"
        className="rounded-xl bg-black-1 p-4 md:p-6"
      >
        <RelatableNumbersChangeRate {...props} />
      </section>
      <Text
        variant="body"
        className=" text-grey mt-6 mb-4 text-sm md:text-base lg:text-lg"
      >
        {t("relatableNumbers.impactSubtitle")}
      </Text>
      <section
        aria-label="Impact for the select year"
        className="rounded-xl bg-black-1 p-4 md:p-6"
      >
        <ImpactForSelectYear {...props} />
      </section>
    </SectionWithHelp>
  );
};

export default RelatableNumbers;
