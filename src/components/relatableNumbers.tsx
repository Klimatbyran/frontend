import { useTranslation, Trans } from "react-i18next";
import { Flame, Lightbulb, MapIcon } from "lucide-react";
import { Text } from "@/components/ui/text";
import {
  calculateAreaBurnt,
  emissionsComparedToCitizen,
  calculateSwedenShareEmissions,
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
  reportingPeriods: any;
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

type KpiItem = {
  id: string;
  value: Item | null;
  color: string;
  icon?: React.ReactNode;
};

const RelatableNumbers = ({
  emissionsChange,
  currentLanguage,
  companyName,
  emissionsChangeStatus,
  yearOverYearChange,
  reportingPeriods,
}: RelatableNumbersProps) => {
  const { t } = useTranslation();
  const areaBurnt = calculateAreaBurnt(emissionsChange, currentLanguage);
  const emissionNumberOfCitizens = emissionsComparedToCitizen(
    emissionsChange,
    currentLanguage,
  );

  const swedenEmissionsShare = calculateSwedenShareEmissions(
    reportingPeriods,
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
        : item.translationKey === "shareSweden"
          ? "shareSweden"
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

  const kpis: KpiItem[] = [
    {
      id: "fire",
      value: areaBurnt,
      color: "var(--pink-3)",
      icon: <Flame stroke={"var(--pink-3)"} height={45} width={45} />,
    },
    {
      id: "citizens",
      value: emissionNumberOfCitizens,
      color: "yellow",
      icon: <Lightbulb stroke={"yellow"} height={35} width={35} />,
    },
    {
      id: "swedenShare",
      value: swedenEmissionsShare,
      color: "var(--blue-3",
      icon: <MapIcon stroke={"var(--blue-3"} height={35} width={35} />,
    },
  ];

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
        {kpis.map((kpi) =>
          kpi.value ? (
            <div key={kpi.id} className="mt-6 gap-4 flex flex-col">
              <div className="flex justify-center items-center gap-4">
                {kpi.icon}
                <Text>{formatRelatableNumber(kpi.value, kpi.color)}</Text>
              </div>
            </div>
          ) : null,
        )}
      </div>
    </SectionWithHelp>
  );
};
export default RelatableNumbers;
