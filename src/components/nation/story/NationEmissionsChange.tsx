import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { NationStackDataPoint } from "@/utils/data/nationStoryMetrics";
import { formatMton } from "@/utils/data/nationStoryMetrics";
import { formatPercentChange } from "@/utils/formatting/localization";
import { useLanguage } from "@/components/LanguageProvider";

interface NationEmissionsChangeProps {
  data: NationStackDataPoint[];
}

export const NationEmissionsChange: FC<NationEmissionsChangeProps> = ({
  data,
}) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const point1990 = useMemo(() => data.find((d) => d.year === 1990), [data]);
  const pointLatest = useMemo(
    () => [...data].sort((a, b) => b.year - a.year)[0],
    [data],
  );

  const territorialChangePct = useMemo(() => {
    if (!point1990 || !pointLatest || point1990.territorialFossil === 0)
      return null;
    return (
      ((pointLatest.territorialFossil - point1990.territorialFossil) /
        point1990.territorialFossil) *
      100
    );
  }, [point1990, pointLatest]);

  const combinedChangePct = useMemo(() => {
    if (!point1990 || !pointLatest || point1990.combined === 0) return null;
    return (
      ((pointLatest.combined - point1990.combined) / point1990.combined) * 100
    );
  }, [point1990, pointLatest]);

  if (!point1990 || !pointLatest) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Big-number totals */}
      <div>
        <p className="text-sm text-grey mb-6">
          {t("nation.story.stacked.totalsDescription")}
        </p>
        <div className="grid grid-cols-2 gap-8 md:gap-12">
          <div>
            <p className="text-sm text-grey mb-3">{1990}</p>
            <p className="text-4xl md:text-6xl font-light text-orange-2 tabular-nums leading-none">
              {formatMton(point1990.combined, currentLanguage, 0)}
            </p>
            <p className="text-sm text-grey mt-3">
              {t("nation.story.unit.millionTco2e")}
            </p>
          </div>
          <div>
            <p className="text-sm text-grey mb-3">{pointLatest.year}</p>
            <p className="text-4xl md:text-6xl font-light text-orange-2 tabular-nums leading-none">
              {formatMton(pointLatest.combined, currentLanguage, 0)}
            </p>
            <p className="text-sm text-grey mt-3">
              {t("nation.story.unit.millionTco2e")}
            </p>
          </div>
        </div>
      </div>

      {/* Change comparison */}
      {territorialChangePct !== null && combinedChangePct !== null && (
        <div className="mt-10 border-t border-white/10 pt-8">
          <p className="text-sm text-grey mb-6">
            {t("nation.story.stacked.changeContext")}
          </p>
          <div className="grid grid-cols-2 gap-8 md:gap-12">
            <div>
              <p className="text-sm text-grey mb-3 leading-snug">
                {t("nation.story.stacked.changeTerritorialLabel")}
              </p>
              <p className="text-4xl md:text-6xl font-light text-blue-3 tabular-nums leading-none">
                {formatPercentChange(territorialChangePct, currentLanguage)}
              </p>
            </div>
            <div>
              <p className="text-sm text-grey mb-3 leading-snug">
                {t("nation.story.stacked.changeCombinedLabel")}
              </p>
              <p className="text-4xl md:text-6xl font-light text-pink-3 tabular-nums leading-none">
                {formatPercentChange(combinedChangePct, currentLanguage)}
              </p>
            </div>
          </div>
          <div className="text-base md:text-lg text-white mt-8 space-y-2 leading-relaxed">
            <p>{t("nation.story.stacked.changeFooterLine1")}</p>
            <p>{t("nation.story.stacked.changeFooterLine2")}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
