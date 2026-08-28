import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { CompanyStoryMetrics } from "@/utils/data/companyStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
import {
  NATION_STORY_TEXT,
  NATION_STORY_TYPE,
} from "@/components/nation/story/nationStoryColors";
import { COMPANY_STORY_TEXT_CLASSES } from "@/components/companies/story/companyStoryTheme";
import { StoryPreviousSectionButton } from "@/components/nation/story/StoryNavChrome";
import { StoryShareLinks } from "@/components/nation/story/StoryShareLinks";

type CompanyConclusionProps = {
  metrics: CompanyStoryMetrics;
};

function RecapStat({
  label,
  value,
  colorClass,
  delay,
}: {
  label: string;
  value: string;
  colorClass: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.45, delay }}
      className="flex flex-col items-center text-center gap-1.5 story-short:gap-1"
    >
      <p className={`${NATION_STORY_TYPE.display} ${colorClass}`}>{value}</p>
      <p
        className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary} leading-snug max-w-[15rem]`}
      >
        {label}
      </p>
    </motion.div>
  );
}

const ctaButtonClass =
  "inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm md:text-base text-white transition-colors hover:border-white/40 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40";

export function CompanyConclusion({ metrics }: CompanyConclusionProps) {
  const { t } = useTranslation();
  const { currentLanguage, getLocalizedPath } = useLanguage();

  const numberFormat = new Intl.NumberFormat(
    currentLanguage === "sv" ? "sv-SE" : "en-GB",
  );
  const alignedShare = Math.round(metrics.alignedCompanyShare);
  const misalignedEmissionsShare = Math.round(
    100 - metrics.alignedEmissionsShare,
  );

  return (
    <>
      <div className="max-w-3xl mx-auto text-center space-y-4 story-short:space-y-2.5 md:space-y-8 pt-6 story-short:pt-5 md:pt-0">
        <div className="md:hidden">
          <StoryPreviousSectionButton className="mx-auto mb-1 story-short:mb-0.5" />
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className={NATION_STORY_TYPE.title}
        >
          {t("companies.story.conclusion.title")}
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 story-short:gap-5 md:gap-6 max-w-4xl mx-auto pt-10 story-short:pt-7 md:pt-14">
        <RecapStat
          value={`${numberFormat.format(metrics.alignedCount)} / ${numberFormat.format(metrics.companyCount)}`}
          label={t("companies.story.conclusion.alignedLabel")}
          colorClass={COMPANY_STORY_TEXT_CLASSES.aligned}
          delay={0.1}
        />
        <RecapStat
          value={`${alignedShare} %`}
          label={t("companies.story.conclusion.companyShareLabel")}
          colorClass={COMPANY_STORY_TEXT_CLASSES.aligned}
          delay={0.18}
        />
        <RecapStat
          value={`${misalignedEmissionsShare} %`}
          label={t("companies.story.conclusion.emissionsShareLabel")}
          colorClass={COMPANY_STORY_TEXT_CLASSES.notAligned}
          delay={0.26}
        />
      </div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={`max-w-3xl mx-auto text-center ${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body} mt-8 story-short:mt-6 md:mt-10 px-4 md:px-0`}
      >
        {t("companies.story.conclusion.body")}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4, delay: 0.24 }}
        className="mt-7 story-short:mt-5 md:mt-8 flex flex-wrap items-center justify-center gap-3 px-4 md:px-0"
      >
        <Link
          to={getLocalizedPath("/companies?kpi=meetsParis")}
          className={ctaButtonClass}
        >
          {t("companies.story.conclusion.ctaCompanies")}
        </Link>
        <Link
          to={getLocalizedPath("/companies?tab=sectors")}
          className={ctaButtonClass}
        >
          {t("companies.story.conclusion.ctaSectors")}
        </Link>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={`max-w-3xl mx-auto text-center ${NATION_STORY_TYPE.body} text-white mt-9 story-short:mt-7 md:mt-11 px-4 md:px-0`}
      >
        {t("companies.story.conclusion.shareCta")}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4, delay: 0.24 }}
        className="mt-5 story-short:mt-4 md:mt-6"
      >
        <StoryShareLinks
          shareTextKey="companies.story.conclusion.shareText"
          shareTitleKey="companies.story.intro.title"
        />
      </motion.div>

      <div className="max-w-3xl mx-auto text-center space-y-4 story-short:space-y-2.5 md:space-y-5 border-t border-white/10 mt-8 md:mt-10 lg:mt-12 pt-8 md:pt-9 lg:pt-10">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className={`${NATION_STORY_TYPE.meta} text-white`}
        >
          <Link
            to={getLocalizedPath("/methodology?view=parisAgreement")}
            className="text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition-colors"
          >
            {t("companies.story.conclusion.methodologyLink")}
          </Link>
        </motion.p>
      </div>
    </>
  );
}
