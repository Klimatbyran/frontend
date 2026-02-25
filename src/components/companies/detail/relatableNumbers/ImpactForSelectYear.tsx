import { Trans } from "react-i18next";
import type { ReactNode } from "react";
import { Text } from "@/components/ui/text";
import { SkullIcon, MapIcon } from "lucide-react";

const ImpactForSelectYear = () => {
  const kpis: {
    id: string;
    value: string | null;
    color?: string;
    icon: ReactNode;
  }[] = [
    {
      id: "deaths",
      value: null, // Replace with calculated value for area burnt
      icon: <SkullIcon stroke={"red"} height={35} width={35} />,
    },
    {
      id: "swedenShare",
      value: null, // Replace with calculated value for area swedens share of emissions
      color: "var(--blue-3)",
      icon: <MapIcon stroke={"var(--blue-3)"} height={35} width={35} />,
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
        />
      </Text>
      <div className="justify-between flex flex-col md:flex-row md:gap-6">
        {kpis.map((kpi) =>
          kpi.value ? (
            <div key={kpi.id} className="mt-6 gap-4 flex flex-col">
              <div className="flex justify-center items-center gap-4">
                {kpi.icon}
                <Text>{kpi.value}</Text>
              </div>
            </div>
          ) : null,
        )}
      </div>
    </>
  );
};

export default ImpactForSelectYear;
