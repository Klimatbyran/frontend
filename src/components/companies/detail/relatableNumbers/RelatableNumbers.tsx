import RelatableNumbersChangeRate from "@/components/relatableNumbers";
import ImpactForSelectYear from "./ImpactForSelectYear";
import { Text } from "@/components/ui/text";
import { SupportedLanguage } from "@/lib/languageDetection";

type RelatableNumbersProps = {
  companyName: string;
  emissionsChange: number;
  emissionsChangeStatus: string;
  currentLanguage: SupportedLanguage;
  yearOverYearChange: number | null;
  reportingPeriods: any;
};

const RelatableNumbers = (props: RelatableNumbersProps) => {
  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="change-rate-impact-heading">
        <Text id="change-rate-impact-heading" variant="h2" className="mb-4">
          Change rate impact
        </Text>
        <RelatableNumbersChangeRate {...props} />
      </section>

      <section aria-labelledby="impact-select-year-heading">
        <Text id="impact-select-year-heading" variant="h2" className="mb-4">
          Impact for the select year
        </Text>
        <ImpactForSelectYear />
      </section>
    </div>
  );
};

export default RelatableNumbers;
