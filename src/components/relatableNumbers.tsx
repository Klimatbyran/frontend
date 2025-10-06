import { Text } from "@/components/ui/text";
import {
  calculateAreaBurnt,
  emissionsComparedToCitizen,
} from "@/utils/calculations/relatableNumbersCalc";
import { useTranslation } from "react-i18next";
import { Flame, Lightbulb } from "lucide-react";

type RelatableNumbersProps = {
  emissionsChange: number;
  currentLanguage: "sv" | "en";
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
    <div className="bg-black-2 rounded-level-1 px-4 py-8 md:py-16 md:px-8">
      <Text variant={"h3"}>{t("relatableNumbers.title")}</Text>
      <Text
        variant="body"
        className="text-sm md:text-base lg:text-lg max-w-3xl mt-2"
      >
        {t("relatableNumbers.description")}
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
    </div>
  );
};
export default RelatableNumbers;
