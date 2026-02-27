import { useTranslation, Trans } from "react-i18next";
import { Lightbulb, Plane } from "lucide-react";
import { Text } from "@/components/ui/text";
import {
  calculateFlightsAroundGlobe,
  emissionsComparedToCitizen,
} from "@/utils/calculations/relatableNumbersCalc";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import type { RelatableNumbersProps } from "./RelatableNumbers";

type Item = {
  comparisonNumber: string;
  translationKey: string;
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
}: RelatableNumbersProps) => {
  const { t } = useTranslation();
  const flightsAroundGlobe = calculateFlightsAroundGlobe(
    emissionsChange,
    currentLanguage,
  );
  const emissionNumberOfCitizens = emissionsComparedToCitizen(
    emissionsChange,
    currentLanguage,
  );

  const kpis: KpiItem[] = [
    {
      id: "flights",
      value: flightsAroundGlobe,
      color: "var(--blue-3)",
      icon: <Plane stroke={"var(--blue-3)"} height={35} width={35} />,
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
              <div className="flex items-center gap-4">
                {kpi.icon}
                <Text>
                  <Trans
                    i18nKey={`relatableNumbers.${kpi.value.translationKey}`}
                    components={{
                      highlightNumber: (
                        <span
                          style={{
                            color: kpi.color,
                            fontWeight: "bold",
                          }}
                        />
                      ),
                    }}
                    values={{
                      count: kpi.value.comparisonNumber,
                    }}
                  />
                </Text>
              </div>
            </div>
          ) : null,
        )}
      </div>
    </>
  );
};
export default RelatableNumbersChangeRate;
