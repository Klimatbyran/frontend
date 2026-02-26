import { useTranslation, Trans } from "react-i18next";
import { Flame, Lightbulb, MapIcon } from "lucide-react";
import { Text } from "@/components/ui/text";
import {
  calculateAreaBurnt,
  emissionsComparedToCitizen,
  calculateSwedenShareEmissions,
  formatTranslationString,
} from "@/utils/calculations/relatableNumbersCalc";
import { SupportedLanguage } from "@/lib/languageDetection";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import type { RelatableNumbersProps } from "./RelatableNumbers";

type Item = {
  comparisonNumber: string;
  prefix: string;
  translationKey?: string | undefined;
};

export type KpiItem = {
  id: string;
  value: Item | null;
  color: string;
  icon?: React.ReactNode;
};

const RelatableNumbersChangeRate = ({
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

  const formatRelatableNumber = (item: Item, iconColor: string) => {
    let type: string;
    switch (item.translationKey) {
      case "Citizens":
        type = "citizens";
        break;
      case "shareSweden":
        type = "shareSweden";
        break;
      default:
        type = t(`relatableNumbers.entities.${item.translationKey}.type`);
    }

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
  ];

  return (
    <>
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
    </>
  );
};
export default RelatableNumbersChangeRate;
