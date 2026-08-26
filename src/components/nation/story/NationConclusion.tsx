import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { NationStoryMetrics } from "@/utils/data/nationStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
import { NATION_STORY_TYPE } from "@/components/nation/story/nationStoryColors";
import { StoryPreviousSectionButton } from "@/components/nation/story/StoryNavChrome";
import { StoryShareLinks } from "@/components/nation/story/StoryShareLinks";
import { ConclusionStoryRecap } from "@/components/nation/story/ConclusionStoryRecap";

type NationConclusionProps = {
  metrics: NationStoryMetrics;
};

export function NationConclusion({ metrics }: NationConclusionProps) {
  const { t } = useTranslation();
  const { getLocalizedPath } = useLanguage();

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
          {t("nation.story.conclusion.title")}
        </motion.h2>
      </div>

      <div className="w-full pt-8 pb-4 story-short:pt-7 story-short:pb-4 md:pt-12 md:pb-2 lg:pt-24">
        <ConclusionStoryRecap metrics={metrics} />
      </div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={`max-w-3xl mx-auto text-center ${NATION_STORY_TYPE.body} text-white mt-8 story-short:mt-8 md:mt-6 lg:mt-8 px-4 md:px-0`}
      >
        {t("nation.story.conclusion.shareCta")}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4, delay: 0.24 }}
        className="mt-5 story-short:mt-4 md:mt-6"
      >
        <StoryShareLinks />
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
            to={getLocalizedPath("/methodology?view=nationEmissionsLayers")}
            className="text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition-colors"
          >
            {t("nation.story.conclusion.methodologyLink")}
          </Link>
        </motion.p>
      </div>
    </>
  );
}
