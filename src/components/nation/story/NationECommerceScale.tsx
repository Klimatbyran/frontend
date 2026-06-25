import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { formatTonnes } from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
import { NATION_STORY_STAGGER_RANGES } from "@/components/nation/story/nationStoryScrollAnimation";

function ScaleBar({
  label: barLabel,
  tonnes,
  color,
  maxTonnes,
  barHeight,
  staggerIndex,
}: {
  label: string;
  tonnes: number;
  color: string;
  maxTonnes: number;
  barHeight: number;
  staggerIndex: number;
}) {
  const { currentLanguage } = useLanguage();
  const finalHeight = (tonnes / maxTonnes) * barHeight;

  return (
    <div className="flex flex-col items-center gap-3 flex-1 max-w-[160px]">
      <motion.div
        className="w-full rounded-t-lg"
        style={{ backgroundColor: color, transformOrigin: "bottom" }}
        initial={{ height: 0 }}
        whileInView={{ height: finalHeight }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{
          duration: 0.7,
          delay: staggerIndex * 0.18,
          ease: [0.16, 1, 0.3, 1],
        }}
      />
      <div className="text-center space-y-1">
        <p className="text-white text-sm font-medium">
          {formatTonnes(tonnes, currentLanguage, 0)}
        </p>
        <p className="text-xs text-grey leading-snug">{barLabel}</p>
      </div>
    </div>
  );
}

type NationECommerceScaleProps = {
  eCommerceTonnes: number;
  eCommerceYear: number;
  territorialEmissionsTonnes: number;
  smallMunicipalityName: string | null;
  smallMunicipalityTonnes: number | null;
  gavleTonnes: number | null;
};

export function NationECommerceScale({
  eCommerceTonnes,
  eCommerceYear,
  territorialEmissionsTonnes,
  smallMunicipalityName,
  smallMunicipalityTonnes,
  gavleTonnes,
}: NationECommerceScaleProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const proportionPercent =
    territorialEmissionsTonnes > 0
      ? (eCommerceTonnes / territorialEmissionsTonnes) * 100
      : null;
  const proportionFormatted =
    proportionPercent != null
      ? proportionPercent.toLocaleString(
          currentLanguage === "sv" ? "sv-SE" : "en-GB",
          { minimumFractionDigits: 1, maximumFractionDigits: 1 },
        )
      : null;

  const maxTonnes = Math.max(
    eCommerceTonnes,
    gavleTonnes ?? 0,
    smallMunicipalityTonnes ?? 0,
    1,
  );
  const barHeight = 220;

  const bars = [
    smallMunicipalityTonnes != null && smallMunicipalityName
      ? {
          id: "small",
          label: t("nation.story.ecommerce.smallLabel", {
            municipality: smallMunicipalityName,
            year: eCommerceYear,
          }),
          tonnes: smallMunicipalityTonnes,
          color: "var(--grey)",
        }
      : null,
    {
      id: "ecommerce",
      label: t("nation.story.ecommerce.ecommerceLabel", {
        year: eCommerceYear,
      }),
      tonnes: eCommerceTonnes,
      color: "var(--orange-2)",
    },
    gavleTonnes != null
      ? {
          id: "gavle",
          label: t("nation.story.ecommerce.gavleLabel", {
            year: eCommerceYear,
          }),
          tonnes: gavleTonnes,
          color: "var(--blue-2)",
        }
      : null,
  ].filter(Boolean) as Array<{
    id: string;
    label: string;
    tonnes: number;
    color: string;
  }>;

  return (
    <div>
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-light text-white mb-3">
          {t("nation.story.ecommerce.title")}
        </h2>
        <p className="text-grey text-lg max-w-2xl">
          {t("nation.story.ecommerce.description")}
        </p>
      </div>

      <div className="flex items-end justify-center gap-6 md:gap-12 min-h-[260px]">
        {bars.map((bar, index) => (
          <ScaleBar
            key={bar.id}
            label={bar.label}
            tonnes={bar.tonnes}
            color={bar.color}
            maxTonnes={maxTonnes}
            barHeight={barHeight}
            staggerIndex={index}
          />
        ))}
      </div>

      {proportionFormatted != null && (
        <p className="mt-6 text-center text-sm text-grey">
          {t("nation.story.ecommerce.proportionLabel", {
            percent: proportionFormatted,
            year: eCommerceYear,
          })}
        </p>
      )}

      <p className="mt-4 text-grey text-center text-base md:text-lg">
        {t("nation.story.ecommerce.footer")}
      </p>
    </div>
  );
}
