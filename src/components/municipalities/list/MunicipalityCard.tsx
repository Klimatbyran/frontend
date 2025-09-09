import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { Municipality } from "@/types/municipality";
import { CardInfo } from "./MunicipalityCardInfo";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
} from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";
import { LinkCard } from "@/components/ui/link-card";

interface MunicipalityCardProps {
  municipality: Municipality;
}

export function MunicipalityCard({ municipality }: MunicipalityCardProps) {
  const { t } = useTranslation();
  const { meetsParisGoal } = municipality;
  const { currentLanguage } = useLanguage();

  const lastYearEmission = municipality.emissions.at(-1);
  const lastYearEmissions = lastYearEmission
    ? formatEmissionsAbsolute(lastYearEmission.value, currentLanguage)
    : t("municipalities.card.noData");
  const lastYear = lastYearEmission?.year.toString() || "";

  const emissionsChangeExists = municipality.historicalEmissionChangePercent;
  const emissionsChange = emissionsChangeExists
    ? formatPercentChange(emissionsChangeExists, currentLanguage)
    : t("municipalities.card.noData");

  const noClimatePlan = !municipality.climatePlanLink;

  return (
    <Link
      to={`/municipalities/${municipality.name}`}
      className="block bg-black-2 rounded-level-2 p-8 space-y-8 transition-all duration-300 hover:shadow-[0_0_10px_rgba(153,207,255,0.15)] hover:bg-[#1a1a1a]"
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-light">{municipality.name}</h2>
        <p className="text-grey text-sm line-clamp-2 min-h-[40px]">
          {municipality.region}
        </p>

        <div className="flex items-center gap-2 text-grey mb-2 text-lg">
          {t("municipalities.card.meetsParis", { name: municipality.name })}
        </div>
        <div
          className={cn(
            "text-3xl font-light",
            meetsParisGoal ? "text-green-3" : "text-pink-3",
          )}
        >
          {meetsParisGoal ? t("yes") : t("no")}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-4 border-t border-black-1">
        <CardInfo
          title={t("municipalities.card.emission", { year: lastYear })}
          tooltip={t("municipalities.card.emissionInfo", { year: lastYear })}
          value={lastYearEmissions}
          textColor="text-orange-2"
          unit={t("emissionsUnitCO2")}
        />
        <CardInfo
          title={t("municipalities.card.changeRate")}
          tooltip={t("municipalities.card.changeRateInfo")}
          value={emissionsChange}
          textColor={cn(
            emissionsChangeExists > 0 ? "text-pink-3" : "text-orange-2",
          )}
        />
      </div>
      <LinkCard
        link={
          municipality.climatePlanLink &&
          municipality.climatePlanLink !== "Saknar plan"
            ? municipality.climatePlanLink
            : undefined
        }
        title={t("municipalities.card.climatePlan")}
        description={
          noClimatePlan
            ? t("municipalities.card.noPlan")
            : t("municipalities.card.adopted", {
                year: municipality.climatePlanYear,
              })
        }
        descriptionColor={noClimatePlan ? "text-pink-3" : "text-green-3"}
      />
    </Link>
  );
}
