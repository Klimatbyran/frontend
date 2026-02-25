import RelatableNumbersChangeRate from "@/components/relatableNumbers";
import ImpactForSelectYear from "./ImpactForSelectYear";
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
    <div className="flex flex-col gap-8">
      <section aria-label="Change rate impact">
        <RelatableNumbersChangeRate {...props} />
      </section>

      <section aria-label="Impact for the select year">
        <ImpactForSelectYear />
      </section>
    </div>
  );
};

export default RelatableNumbers;
