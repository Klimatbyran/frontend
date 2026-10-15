import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LocalizedLink } from "@/components/LocalizedLink";

/** Mobile min height when copy wraps to two lines; desktop stays one row. */
export const VALET_BANNER_MOBILE_MIN_HEIGHT = "4.25rem";
export const VALET_BANNER_DESKTOP_HEIGHT = "3rem";

/** Header (3rem) + banner – use for scroll-margin on landing scroll targets. */
export const VALET_BANNER_SCROLL_MARGIN_CLASS =
  "scroll-mt-[7.25rem] md:scroll-mt-[6rem]";

/** Landing hero top padding – keep in sync with banner heights above. */
export const VALET_BANNER_LANDING_HERO_PAD_CLASS =
  "pt-[calc(8rem_+_4.25rem)] story-short:pt-[calc(7rem_+_4.25rem)] md:pt-[calc(12rem_+_3rem)]";

/**
 * Full-width news strip fixed directly below the site header on the landing page.
 */
export function Valet2026HeroBanner() {
  const { t } = useTranslation();
  const label = `${t("landingPage.valet2026Banner.badge")} ${t("landingPage.valet2026Banner.title")}`;

  return (
    <LocalizedLink
      to="/nation"
      aria-label={label}
      className="group fixed inset-x-0 top-12 z-40 flex min-h-[4.25rem] items-center border-b border-black/10 bg-[#E2FF8D] py-2 transition-colors hover:bg-[#daf585] md:h-12 md:min-h-0 md:py-0"
    >
      <div className="container mx-auto flex w-full items-center gap-2.5 px-4 md:justify-center md:gap-3">
        <p className="min-w-0 flex-1 text-[0.9375rem] leading-snug font-medium text-black md:flex-none md:truncate md:text-base md:leading-normal">
          {t("landingPage.valet2026Banner.badge")}{" "}
          {t("landingPage.valet2026Banner.title")}
        </p>
        <ArrowRight
          className="h-4 w-4 shrink-0 text-black transition-transform duration-300 group-hover:translate-x-0.5 md:h-5 md:w-5"
          aria-hidden
        />
      </div>
    </LocalizedLink>
  );
}
