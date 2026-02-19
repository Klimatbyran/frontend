import { useTranslation, Trans } from "react-i18next";
import { Flame, Lightbulb } from "lucide-react";
import { Text } from "@/components/ui/text";
import {
  calculateAreaBurnt,
  emissionsComparedToCitizen,
} from "@/utils/calculations/relatableNumbersCalc";
import { SupportedLanguage } from "@/lib/languageDetection";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { InfoTooltip } from "@/components/layout/InfoTooltip";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";

type RelatableNumbersProps = {
  companyName: string;
  emissionsChange: number;
  emissionsChangeStatus: string;
  currentLanguage: SupportedLanguage;
  yearOverYearChange: number | null;
};

type Item = {
  comparisonNumber: string;
  prefix: string;
  translationKey?: string | undefined;
};

type Values = {
  prefix: string;
  count: string;
  entity: string;
  [key: string]: string;
};

const RelatableNumbers = ({
  emissionsChange,
  currentLanguage,
  companyName,
  emissionsChangeStatus,
  yearOverYearChange,
}: RelatableNumbersProps) => {
  const { t } = useTranslation();
  const areaBurnt = calculateAreaBurnt(emissionsChange, currentLanguage);
  const emissionNumberOfCitizens = emissionsComparedToCitizen(
    emissionsChange,
    currentLanguage,
  );

  const formatTranslationString = (pattern: string, values: Values) => {
    let formatted = pattern;

    for (const key in values) {
      formatted = formatted.split(`{{${key}}}`).join(values[key]);
    }

    return formatted;
  };

  const formatRelatableNumber = (item: Item, iconColor: string) => {
    const type =
      item.translationKey === "Citizens"
        ? "citizens"
        : t(`relatableNumbers.entities.${item.translationKey}.type`);
    const pattern = t(`relatableNumbers.patterns.${type}`);

    const values = {
      prefix: t(`relatableNumbers.${item.prefix}`),
      count: item.comparisonNumber,
      entity: t(`relatableNumbers.entities.${item.translationKey}.name`),
    };

    const formattedString = formatTranslationString(pattern, values);

    const parts = formattedString.split(item.comparisonNumber);

    return (
      <>
        {parts[0]}
        <span style={{ color: iconColor, fontWeight: "bold" }}>
          {item.comparisonNumber}
        </span>
        {parts[1]}
      </>
    );
  };

  const formattedFireString = areaBurnt
    ? formatRelatableNumber(areaBurnt, "var(--pink-3)")
    : null;

  const formattedCitizenString = emissionNumberOfCitizens
    ? formatRelatableNumber(emissionNumberOfCitizens, "yellow")
    : null;

  return (
    <SectionWithHelp
      helpItems={["relatableNumbers", "degsWarming", "forestFires", "citizens"]}
    >
      <div className="flex items-center gap-2">
        <Text variant={"h3"}>{t("relatableNumbers.title")}</Text>
        <InfoTooltip>{t("relatableNumbers.tooltip")}</InfoTooltip>
      </div>
      <Text variant="body" className="text-sm md:text-base lg:text-lg mt-2">
        <Trans
          i18nKey="relatableNumbers.description"
          components={{
            highlightNumber: <span className="text-orange-2" />,
          }}
          values={{
            companyName: companyName,
            emissionsChangeStatus: t(
              `relatableNumbers.${emissionsChangeStatus}`,
            ),
            emissionsInTonnes: formatEmissionsAbsolute(
              emissionsChange,
              currentLanguage,
            ),
            yearOverYearChange:
              yearOverYearChange !== null
                ? formatPercentChange(
                    yearOverYearChange,
                    currentLanguage,
                    false,
                  )
                : "",
          }}
        />
      </Text>
      <div className="justify-between flex flex-col md:flex-row md:gap-6">
        <div className="mt-6 gap-4 flex flex-col">
          <div className="flex items-center gap-4">
            <Flame stroke={"var(--pink-3)"} height={45} width={45} />
            <Text>{formattedFireString}</Text>
          </div>
        </div>
        <div className="mt-6 gap-4 flex flex-col">
          <div className="flex items-center gap-4">
            <Lightbulb stroke={"yellow"} height={35} width={35} />
            <Text>{formattedCitizenString}</Text>
          </div>
        </div>
      </div>
    </SectionWithHelp>
  );
};
export default RelatableNumbers;
