import { useTranslation } from "react-i18next";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { formatTonnes } from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";

// Section is 200vh → 100vh scrollable.
// Bar ranges spread across 0.1–0.75 so nothing finishes too early.
const BAR_RANGES: [number, number][] = [
  [0.08, 0.38],
  [0.3, 0.6],
  [0.52, 0.8],
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
  const itemProgress = useTransform(scrollYProgress, range, [0, 1]);
  const barScale = useTransform(itemProgress, [0, 0.8], [0, 1]);
  const labelOpacity = useTransform(itemProgress, [0.3, 1], [0, 1]);

  return (
    <motion.div
      className="flex flex-col items-center gap-3 flex-1 max-w-[160px]"
      style={{ opacity: labelOpacity }}
    >
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
    </motion.div>
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

  const headerOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0, 0.1], [20, 0]);
  const footerOpacity = useTransform(scrollYProgress, [0.75, 0.95], [0, 1]);

  const maxTonnes = Math.max(
    eCommerceTonnes,
    gavleTonnes ?? 0,
    smallMunicipalityTonnes ?? 0,
    1,
  );
  const barHeight = 220;

  // Bars available: small (optional), ecommerce, gavle (optional)
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
      <motion.div
        style={{ opacity: headerOpacity, y: headerY }}
        className="mb-10 text-center md:text-left"
      >
        <h2 className="text-3xl md:text-4xl font-light text-white mb-3">
          {t("nation.story.ecommerce.title")}
        </h2>
        <p className="text-grey text-lg max-w-2xl">
          {t("nation.story.ecommerce.description")}
        </p>
      </motion.div>

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
            range={BAR_RANGES[index] ?? [0.08, 0.38]}
          />
        ))}
      </div>

      <motion.p
        style={{ opacity: footerOpacity }}
        className="mt-10 text-grey text-center text-base md:text-lg"
      >
        {t("nation.story.ecommerce.footer")}
      </motion.p>
    </div>
  );
}
