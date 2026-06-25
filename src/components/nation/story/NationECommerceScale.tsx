import { useTranslation } from "react-i18next";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { formatTonnes } from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";

// 3 bars spread across the full 0–1 range
const BAR_RANGES: [number, number][] = [
  [0.03, 0.37],
  [0.33, 0.67],
  [0.63, 0.97],
];

function ScaleBar({
  label: barLabel,
  tonnes,
  color,
  maxTonnes,
  barHeight,
  scrollYProgress,
  range,
}: {
  label: string;
  tonnes: number;
  color: string;
  maxTonnes: number;
  barHeight: number;
  scrollYProgress: MotionValue<number>;
  range: [number, number];
}) {
  const { currentLanguage } = useLanguage();
  // Only the bar height animates
  const barScale = useTransform(scrollYProgress, range, [0, 1]);

  return (
    <div className="flex flex-col items-center gap-3 flex-1 max-w-[160px]">
      <motion.div
        className="w-full rounded-t-lg"
        style={{
          height: (tonnes / maxTonnes) * barHeight,
          backgroundColor: color,
          scaleY: barScale,
          transformOrigin: "bottom",
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
  smallMunicipalityName: string | null;
  smallMunicipalityTonnes: number | null;
  gavleTonnes: number | null;
  scrollYProgress: MotionValue<number>;
};

export function NationECommerceScale({
  eCommerceTonnes,
  eCommerceYear,
  smallMunicipalityName,
  smallMunicipalityTonnes,
  gavleTonnes,
  scrollYProgress,
}: NationECommerceScaleProps) {
  const { t } = useTranslation();

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
    <div className="w-full max-w-4xl mx-auto">
      {/* Header always visible */}
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-light text-white mb-3">
          {t("nation.story.ecommerce.title")}
        </h2>
        <p className="text-grey text-lg max-w-2xl">
          {t("nation.story.ecommerce.description")}
        </p>
      </div>

      {/* Bars animate */}
      <div className="flex items-end justify-center gap-6 md:gap-12 min-h-[280px]">
        {bars.map((bar, index) => (
          <ScaleBar
            key={bar.id}
            label={bar.label}
            tonnes={bar.tonnes}
            color={bar.color}
            maxTonnes={maxTonnes}
            barHeight={barHeight}
            scrollYProgress={scrollYProgress}
            range={BAR_RANGES[index] ?? [0.05, 0.38]}
          />
        ))}
      </div>

      {/* Footer always visible */}
      <p className="mt-10 text-grey text-center text-base md:text-lg">
        {t("nation.story.ecommerce.footer")}
      </p>
    </div>
  );
}
