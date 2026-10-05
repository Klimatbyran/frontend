import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";
import { useLanguage } from "@/components/LanguageProvider";
import type { Municipality } from "@/types/municipality";
import { localizeUnit } from "@/utils/formatting/localization";

const CONSUMPTION_TARGET_TONNES = 1;
const TONNES_PER_MTON = 1_000_000;

function finiteNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

function BenchmarkBar({
  label,
  value,
  reference,
  valueLabel,
  referenceLabel,
}: {
  label: string;
  value: number;
  reference: number;
  valueLabel: string;
  referenceLabel: string;
}) {
  const safeValue = finiteNumber(value);
  const safeReference = finiteNumber(reference);
  const scale = Math.max(safeValue, safeReference, 1);
  const good = safeValue <= safeReference;

  return (
    <div className="space-y-2">
      <p className="text-sm text-white/80">{label}</p>
      <div className="relative h-7 w-full rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full"
          style={{ background: good ? "var(--green-3)" : "var(--pink-3)" }}
          initial={{ width: 0 }}
          whileInView={{ width: `${(safeValue / scale) * 100}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
        <div
          className="absolute inset-y-0 border-l-2 border-dashed border-white/60"
          style={{ left: `${(safeReference / scale) * 100}%` }}
        />
      </div>
      <div className="flex justify-between gap-4 text-xs text-grey">
        <span className={good ? "text-green-3" : "text-pink-3"}>
          {valueLabel}
        </span>
        <span className="text-right">{referenceLabel}</span>
      </div>
    </div>
  );
}

export function MunicipalityParisBudgetPanel({
  municipality,
}: {
  municipality: Municipality;
}) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const onTrack = municipality.meetsParisGoal;
  const trendMton = finiteNumber(municipality.totalTrend) / TONNES_PER_MTON;
  const budgetMton =
    finiteNumber(municipality.totalCarbonLaw) / TONNES_PER_MTON;
  const ratio =
    budgetMton > 0 ? (trendMton / budgetMton).toFixed(1) : undefined;
  const consumption = finiteNumber(municipality.totalConsumptionEmission);

  const formatMt = (value: number) => localizeUnit(value, currentLanguage);

  return (
    <section
      className="mt-8 space-y-5"
      aria-labelledby="municipality-paris-budget-heading"
    >
      <div className="space-y-3">
        <h2
          id="municipality-paris-budget-heading"
          className="text-2xl font-light text-white md:text-3xl"
        >
          {t("municipalityDetailPage.parisBudgetPanel.title")}
        </h2>
        <p
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-base ${
            onTrack ? "bg-green-5/40 text-green-2" : "bg-pink-5/40 text-pink-2"
          }`}
        >
          {onTrack ? (
            <Check size={18} aria-hidden />
          ) : (
            <X size={18} aria-hidden />
          )}
          {onTrack
            ? t("municipalityDetailPage.parisBudgetPanel.onTrack")
            : t("municipalityDetailPage.parisBudgetPanel.offTrack")}
        </p>
        <p className="max-w-2xl text-base font-light leading-relaxed text-white/90 md:text-lg">
          {onTrack ? (
            <Trans
              i18nKey="municipalityDetailPage.parisBudgetPanel.narrativeOnTrack"
              values={{
                name: municipality.name,
                trendMt: formatMt(trendMton),
                budgetMt: formatMt(budgetMton),
              }}
              components={[<span key="trend" className="text-green-2" />]}
            />
          ) : (
            <Trans
              i18nKey="municipalityDetailPage.parisBudgetPanel.narrativeOffTrack"
              values={{
                name: municipality.name,
                trendMt: formatMt(trendMton),
                budgetMt: formatMt(budgetMton),
                ratio,
              }}
              components={[
                <span key="trend" className="text-pink-3" />,
                <span key="ratio" className="text-pink-3" />,
              ]}
            />
          )}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <BenchmarkBar
          label={t(
            "municipalityDetailPage.parisBudgetPanel.cumulativeEmissionsLabel",
          )}
          value={trendMton}
          reference={budgetMton}
          valueLabel={t(
            "municipalityDetailPage.parisBudgetPanel.trendValueLabel",
            { value: formatMt(trendMton) },
          )}
          referenceLabel={t(
            "municipalityDetailPage.parisBudgetPanel.budgetValueLabel",
            { value: formatMt(budgetMton) },
          )}
        />
        <BenchmarkBar
          label={t("municipalityDetailPage.parisBudgetPanel.consumptionLabel")}
          value={consumption}
          reference={CONSUMPTION_TARGET_TONNES}
          valueLabel={t(
            "municipalityDetailPage.parisBudgetPanel.consumptionToday",
            { value: consumption.toFixed(1) },
          )}
          referenceLabel={t(
            "municipalityDetailPage.parisBudgetPanel.consumptionTarget",
          )}
        />
      </div>
    </section>
  );
}
