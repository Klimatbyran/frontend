import { motion } from "framer-motion";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useChartMotion } from "@/hooks/useChartMotion";
import {
  buildReportingPyramid,
  LONG_RECORD_YEARS,
  TREND_MIN_YEARS,
  type ReportingPyramid,
} from "@/hooks/companies/parisOverviewUtils";
import type { CompanyWithKPIs } from "@/types/company";

const yearCopy = {
  min: TREND_MIN_YEARS,
  long: LONG_RECORD_YEARS,
  almostLong: LONG_RECORD_YEARS - 1,
};

function share(part: number, total: number): number {
  if (total === 0 || part === 0) return 0;
  return Math.round((part / total) * 100);
}

export function ReportingCoverage({
  companies,
}: {
  companies: CompanyWithKPIs[];
}) {
  const { t } = useTranslation();
  const { reduceMotion, barDuration, ease } = useChartMotion();
  const pyramid = useMemo(() => buildReportingPyramid(companies), [companies]);

  if (pyramid.total === 0) return null;

  const tiers = tiersFrom(pyramid);
  const widest = Math.max(...tiers.map((tier) => tier.count), 1);

  return (
    <section className="rounded-level-2 bg-black-2 p-6 md:p-7">
      <h2 className="text-xl font-light md:text-[21px]">
        {t("companiesOverviewPage.paris.reportingTitle")}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-white/60">
        {t("companiesOverviewPage.paris.reportingDescription", yearCopy)}
      </p>

      <div
        className="mx-auto mt-8 flex w-full max-w-3xl flex-col items-center gap-6"
        role="img"
        aria-label={t("companiesOverviewPage.paris.reportingAria", {
          ...yearCopy,
          longCount: pyramid.longRecord,
          enough: pyramid.enough,
          thin: pyramid.tooLittle,
        })}
      >
        {tiers.map((tier, index) => {
          const width =
            tier.count === 0 ? 0 : Math.max(18, (tier.count / widest) * 100);

          return (
            <div key={tier.id} className="flex w-full flex-col items-center">
              {width > 0 && (
                <motion.div
                  className="h-11 origin-center rounded-md"
                  style={{
                    width: `${width}%`,
                    backgroundColor: tier.color,
                  }}
                  initial={reduceMotion ? false : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: reduceMotion ? 0 : barDuration,
                    delay: reduceMotion ? 0 : index * 0.08,
                    ease,
                  }}
                />
              )}
              <p className="mt-2 text-center text-sm leading-snug">
                <span className="font-medium tabular-nums">{tier.count}</span>
                <span className="ml-2 tabular-nums text-white/40">
                  {share(tier.count, pyramid.total)}%
                </span>
              </p>
              <p className="text-center text-sm text-white/80">
                {t(tier.labelKey, yearCopy)}
              </p>
              <p className="max-w-md text-center text-xs leading-relaxed text-white/45">
                {t(tier.detailKey, yearCopy)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function tiersFrom(pyramid: ReportingPyramid) {
  return [
    {
      id: "long",
      count: pyramid.longRecord,
      color: "var(--blue-3)",
      labelKey: "companiesOverviewPage.paris.reportingLong",
      detailKey: "companiesOverviewPage.paris.reportingLongDetail",
    },
    {
      id: "enough",
      count: pyramid.enough,
      color: "var(--blue-2)",
      labelKey: "companiesOverviewPage.paris.reportingEnough",
      detailKey: "companiesOverviewPage.paris.reportingEnoughDetail",
    },
    {
      id: "thin",
      count: pyramid.tooLittle,
      color: "rgba(255,255,255,0.22)",
      labelKey: "companiesOverviewPage.paris.reportingTooLittle",
      detailKey: "companiesOverviewPage.paris.reportingTooLittleDetail",
    },
  ];
}
