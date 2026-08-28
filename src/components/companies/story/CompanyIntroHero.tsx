import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import { formatMton } from "@/utils/data/nationStoryMetrics";
import type { CompanyStoryMetrics } from "@/utils/data/companyStoryMetrics";
import { useLanguage } from "@/components/LanguageProvider";
import {
  NATION_STORY_TEXT,
  NATION_STORY_TYPE,
} from "@/components/nation/story/nationStoryColors";
import {
  COMPANY_STORY_COLORS,
  COMPANY_STORY_TEXT_CLASSES,
  phyllotaxis,
  swarmSpread,
  uniformDotRadius,
} from "@/components/companies/story/companyStoryTheme";

const SWARM_RADIUS = 210;
const VIEWBOX = "-240 -240 480 480";

type HeroDot = {
  id: string;
  x: number;
  y: number;
  r: number;
};

/**
 * Layout: sunflower spiral with the biggest emitters at the center. Sizes
 * vary mildly with emissions – the dramatic emissions-weighted reveal is
 * saved for the verdict chapter.
 */
function useHeroDots(metrics: CompanyStoryMetrics): HeroDot[] {
  return useMemo(() => {
    const dots = metrics.dots;
    const spread = swarmSpread(dots.length, SWARM_RADIUS);
    const base = uniformDotRadius(spread);
    const positions = phyllotaxis(dots.length, spread);
    const maxEmissions = dots[0]?.emissionsTonnes ?? 1;

    return dots.map((dot, i) => {
      const relative = Math.sqrt(dot.emissionsTonnes / maxEmissions);
      const r = base * (0.55 + 0.9 * relative);
      return { id: dot.id, x: positions[i].x, y: positions[i].y, r };
    });
  }, [metrics]);
}

function HeroSwarm({
  dots,
  ariaLabel,
}: {
  dots: HeroDot[];
  ariaLabel: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="relative h-[clamp(190px,30svh,320px)] story-short:h-[clamp(150px,24svh,240px)] md:h-[clamp(260px,40svh,400px)] aspect-square shrink-0"
    >
      <svg viewBox={VIEWBOX} className="h-full w-full block" overflow="visible">
        {dots.map((dot, i) => (
          <motion.circle
            key={dot.id}
            cx={dot.x}
            cy={dot.y}
            fill={COMPANY_STORY_COLORS.field}
            initial={reducedMotion ? false : { r: 0, opacity: 0 }}
            animate={{ r: dot.r, opacity: 0.92 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : {
                    delay: 0.25 + i * 0.004,
                    type: "spring",
                    stiffness: 120,
                    damping: 16,
                  }
            }
          />
        ))}
      </svg>
    </div>
  );
}

function HeroStat({
  value,
  label,
  colorClass,
  delay,
}: {
  value: string;
  label: string;
  colorClass: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center md:items-start text-center md:text-left"
    >
      <p className={`${NATION_STORY_TYPE.display} ${colorClass}`}>{value}</p>
      <p
        className={`${NATION_STORY_TYPE.meta} ${NATION_STORY_TEXT.secondary} mt-1.5 leading-snug max-w-[13rem]`}
      >
        {label}
      </p>
    </motion.div>
  );
}

type CompanyIntroHeroProps = {
  metrics: CompanyStoryMetrics;
};

/**
 * Hero: the starting field. Every assessed company is a dot in a sunflower
 * swarm – the question the story answers is whether they keep the Paris pace.
 */
export function CompanyIntroHero({ metrics }: CompanyIntroHeroProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const dots = useHeroDots(metrics);

  const companyCountText = new Intl.NumberFormat(
    currentLanguage === "sv" ? "sv-SE" : "en-GB",
  ).format(metrics.companyCount);
  const totalText = formatMton(metrics.totalMton, currentLanguage, 0);

  return (
    <div className="relative w-full max-w-5xl mx-auto shrink-0 md:max-w-6xl">
      <div className="text-center space-y-1.5 max-md:space-y-1 story-short:space-y-0.5 md:space-y-3 story-compact:space-y-2 lg:space-y-4">
        <h1 className={`${NATION_STORY_TYPE.heroTitle} text-white`}>
          {t("companies.story.intro.title")}
        </h1>
        <p
          className={`${NATION_STORY_TYPE.body} ${NATION_STORY_TEXT.body} max-w-2xl mx-auto`}
        >
          {t("companies.story.intro.paragraph1")}
        </p>
        <div className="pt-2 max-md:pt-1.5 story-short:pt-1 md:pt-4 story-compact:pt-3 lg:pt-6">
          <div className="mx-auto grid max-w-full grid-cols-1 justify-items-center gap-3 max-md:gap-2 story-short:gap-1.5 md:flex md:w-fit md:max-w-full md:items-center md:justify-center md:gap-10 lg:gap-14">
            <HeroSwarm
              dots={dots}
              ariaLabel={t("companies.story.intro.swarmAria", {
                companyCount: companyCountText,
              })}
            />
            <div className="grid w-full max-w-[22rem] grid-cols-2 gap-x-4 md:flex md:w-auto md:max-w-none md:flex-col md:items-start md:gap-6">
              <HeroStat
                value={companyCountText}
                label={t("companies.story.intro.companiesLabel")}
                colorClass={COMPANY_STORY_TEXT_CLASSES.field}
                delay={0.5}
              />
              <HeroStat
                value={totalText}
                label={t("companies.story.intro.emissionsLabel")}
                colorClass="text-white"
                delay={0.65}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
