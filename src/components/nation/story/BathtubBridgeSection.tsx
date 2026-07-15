import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { NATION_STORY_TEXT } from "@/components/nation/story/nationStoryColors";

function BathtubIcon() {
  return (
    <svg
      viewBox="0 0 120 80"
      className="w-28 h-20 md:w-36 md:h-24 text-blue-2 shrink-0"
      aria-hidden
    >
      <path
        d="M8 44 Q8 28 24 28 L96 28 Q112 28 112 44 L112 56 Q112 68 96 68 L24 68 Q8 68 8 56 Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <path
        d="M20 28 L20 18 Q20 10 28 10 L40 10"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="40" cy="10" r="4" fill="currentColor" />
      <path
        d="M30 48 Q45 38 60 48 T90 48"
        fill="none"
        stroke="var(--orange-3)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  );
}

export function BathtubBridgeSection() {
  const { t } = useTranslation();

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-6 md:gap-8 px-2">
      <BathtubIcon />
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className={`text-lg md:text-xl ${NATION_STORY_TEXT.body} leading-relaxed`}
      >
        {t("nation.story.bathtub.text")}
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="text-xl md:text-2xl text-white font-light leading-snug"
      >
        {t("nation.story.bathtub.question")}
      </motion.p>
    </div>
  );
}
