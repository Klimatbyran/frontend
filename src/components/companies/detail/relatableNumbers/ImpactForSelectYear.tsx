import { Trans } from "react-i18next";
import type { ReactNode } from "react";
import { Text } from "@/components/ui/text";
import { SkullIcon, MapIcon } from "lucide-react";
import { RelatableNumbersProps } from "./RelatableNumbers";
import { yearFromIsoDate } from "@/utils/date";
import { formatEmissionsAbsolute } from "@/utils/formatting/localization";
import { calculateSwedenShareEmissions } from "@/utils/calculations/relatableNumbersCalc";

const ImpactForSelectYear = ({
  currentLanguage,
  companyName,
  reportingPeriods,
  impactPeriod,
}: RelatableNumbersProps) => {
  const impactYearValue = impactPeriod
    ? Number(yearFromIsoDate(impactPeriod.endDate))
    : null;

  const impactYearEmissionsValue =
    impactPeriod?.emissions?.calculatedTotalEmissions || 0;

  const swedenEmissionsShare = calculateSwedenShareEmissions(
    reportingPeriods,
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
      value: "123123", // Replace with calculated value deaths
      icon: <SkullIcon stroke={"white"} height={35} width={35} />,
      translationKey: "deaths",
    },
    {
      id: "swedenShare",
      value: swedenEmissionsShare?.comparisonNumber, // Replace with calculated value for area swedens share of emissions
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
            companyName: companyName,
            impactYear: impactYearValue,
            impactYearEmissions: formatEmissionsAbsolute(
              impactYearEmissionsValue,
              currentLanguage,
            ),
          }}
        />
      </Text>
      <div className="justify-between flex flex-col md:flex-row md:gap-6">
        {kpis.map((kpi) =>
          kpi.value ? (
            <div key={kpi.id} className="mt-6 gap-4 flex flex-col">
              <div className="flex justify-center items-center gap-4">
                {kpi.icon}
                <Trans
                  i18nKey={kpi.translationKey}
                  components={{
                    highlightNumber: <span style={{ color: kpi.color }} />,
                  }}
                  values={{
                    count: kpi.value,
                  }}
                />
              </div>
            </div>
          ) : null,
        )}
      </div>
    </>
  );
};

export default ImpactForSelectYear;
