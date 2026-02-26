import { Trans } from "react-i18next";
import type { ReactNode } from "react";
import { Text } from "@/components/ui/text";
import { SkullIcon, MapIcon } from "lucide-react";
import { RelatableNumbersProps } from "./RelatableNumbers";
import { yearFromIsoDate } from "@/utils/date";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import {
  calculateSwedenShareEmissions,
  calculatedNumberOfdeaths,
} from "@/utils/calculations/relatableNumbersCalc";

const ImpactForSelectYear = ({
  currentLanguage,
  companyName,
  reportingPeriods,
  impactPeriod,
}: RelatableNumbersProps) => {
  const selectedYear = impactPeriod
    ? yearFromIsoDate(impactPeriod.endDate)
    : "";
  const selectedYearEmissions =
    impactPeriod?.emissions?.calculatedTotalEmissions ?? 0;

  const swedenEmissionsShare = calculateSwedenShareEmissions(
    reportingPeriods,
    currentLanguage,
  );

  const calculatedDeaths = calculatedNumberOfdeaths(
    selectedYearEmissions,
    currentLanguage,
  );

  const kpis: {
    id: string;
    value: string | undefined;
    color?: string;
    icon: ReactNode;
    translationKey?: string;
  }[] = [
    {
      id: "deaths",
      value: calculatedDeaths?.comparisonNumber,
      color: "var(--pink-3)",
      icon: <SkullIcon stroke={"var(--pink-3)"} height={35} width={35} />,
      translationKey: "relatableNumbers.calculatedDeaths",
    },
    {
      id: "swedenShare",
      value: swedenEmissionsShare?.comparisonNumber,
      color: "var(--blue-3)",
      icon: <MapIcon stroke={"var(--blue-3)"} height={35} width={35} />,
      translationKey: "relatableNumbers.shareSweden",
    },
  ];

  return (
    <>
      <Text variant="body" className="text-sm md:text-base lg:text-lg mt-2">
        <Trans
          i18nKey="relatableNumbers.impactDescription"
          components={{
            highlightNumber: <span className="text-orange-2" />,
          }}
          values={{
            companyName,
            selectedYear,
            emissionsInTonnes: formatEmissionsAbsolute(
              selectedYearEmissions,
              currentLanguage,
            ),
          }}
        />
      </Text>
      <div className="justify-between flex flex-col md:flex-row md:gap-6">
        {kpis.map((kpi) =>
          kpi.value ? (
            <div key={kpi.id} className="mt-6 gap-4 flex flex-col">
              <div className="flex items-start gap-2 max-w-full">
                <span className="flex-shrink-0 mt-0.5">{kpi.icon}</span>
                <span className="min-w-0 break-words">
                  <Trans
                    i18nKey={kpi.translationKey}
                    components={{
                      highlightNumber: (
                        <span
                          style={{
                            color: kpi.color,
                            marginRight: "0.25em",
                          }}
                        />
                      ),
                    }}
                    values={{
                      count: kpi.value,
                    }}
                  />
                </span>
              </div>
            </div>
          ) : null,
        )}
      </div>
    </>
  );
};

export default ImpactForSelectYear;
