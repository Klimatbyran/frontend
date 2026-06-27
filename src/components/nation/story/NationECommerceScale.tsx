import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { formatTonnes } from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";

// Hardcoded reference municipality values for perspective
const GAVLE_TONNES = 328_161;
const TRELLEBORG_TONNES = 129_769;

function ScaleBar({
  label: barLabel,
  tonnes,
  color,
  maxTonnes,
  barHeight,
  staggerIndex,
  highlight = false,
}: {
  label: string;
  tonnes: number;
  color: string;
  maxTonnes: number;
  barHeight: number;
  staggerIndex: number;
  highlight?: boolean;
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
        <p
          className={`text-sm font-medium ${highlight ? "text-orange-2" : "text-white"}`}
        >
          {formatTonnes(tonnes, currentLanguage, 0)}
        </p>
        <p
          className={`text-xs leading-snug ${highlight ? "text-white" : "text-grey"}`}
        >
          {barLabel}
        </p>
      </div>
    </div>
  );
}

type NationECommerceScaleProps = {
  eCommerceTonnes: number;
  eCommerceYear: number;
};

export function NationECommerceScale({
  eCommerceTonnes,
  eCommerceYear,
}: NationECommerceScaleProps) {
  const { t } = useTranslation();

  const maxTonnes = Math.max(eCommerceTonnes, GAVLE_TONNES, 1);
  const barHeight = 220;

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
        <ScaleBar
          label="Trelleborg"
          tonnes={TRELLEBORG_TONNES}
          color="var(--green-4)"
          maxTonnes={maxTonnes}
          barHeight={barHeight}
          staggerIndex={0}
        />
        <ScaleBar
          label="Gävle"
          tonnes={GAVLE_TONNES}
          color="var(--orange-3)"
          maxTonnes={maxTonnes}
          barHeight={barHeight}
          staggerIndex={1}
        />
        <ScaleBar
          label={t("nation.story.ecommerce.ecommerceLabel")}
          tonnes={eCommerceTonnes}
          color="var(--pink-3)"
          maxTonnes={maxTonnes}
          barHeight={barHeight}
          staggerIndex={2}
          highlight
        />
      </div>

      <p className="mt-8 text-grey text-center text-base md:text-lg max-w-2xl mx-auto">
        {t("nation.story.ecommerce.comparisonFooter", {
          ecommerceYear: eCommerceYear,
          ecommerceTonnes: formatTonnes(eCommerceTonnes, "sv", 0),
        })}
      </p>
    </div>
  );
}
