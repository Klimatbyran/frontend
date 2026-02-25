import { useTranslation } from "react-i18next";
import { Text } from "@/components/ui/text";
import { InfoTooltip } from "@/components/layout/InfoTooltip";
import { SectionWithHelp } from "@/data-guide/SectionWithHelp";

const ImpactForSelectYear = () => {
  const { t } = useTranslation();

  // TODO: Add KPI calculations for selected year impact (e.g. areaBurnt, citizens, swedenShare equivalents)
  const kpis: { id: string; value: string | null; color: string }[] = [];

  return (
    <SectionWithHelp
      helpItems={["relatableNumbers", "degsWarming", "forestFires", "citizens"]}
    >
      <div className="flex items-center gap-2">
        <Text variant={"h3"}>
          {t("relatableNumbers.title")}
        </Text>
        <InfoTooltip>{t("relatableNumbers.tooltip")}</InfoTooltip>
      </div>
      <Text variant="body" className="text-sm md:text-base lg:text-lg mt-2">
        {/* TODO: Add description Trans for impact for selected year */}
        Impact for the select year — coming soon.
      </Text>
      <div className="justify-between flex flex-col md:flex-row md:gap-6">
        {kpis.map((kpi) =>
          kpi.value ? (
            <div key={kpi.id} className="mt-6 gap-4 flex flex-col">
              <div className="flex justify-center items-center gap-4">
                {/* TODO: Add icon */}
                <Text>{kpi.value}</Text>
              </div>
            </div>
          ) : null,
        )}
      </div>
    </SectionWithHelp>
  );
};

export default ImpactForSelectYear;
