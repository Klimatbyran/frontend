import { useRef, useState, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LocalizedLink } from "@/components/LocalizedLink";
import { useChartMotion } from "@/hooks/useChartMotion";
import { useEnteredView } from "@/hooks/useEnteredView";
import { parisDotCompanies } from "@/hooks/companies/parisOverviewUtils";
import { getCompanyDetailPath } from "@/utils/companyRouting";
import type { CompanyWithKPIs } from "@/types/company";
import { cn } from "@/lib/utils";

/**
 * A handful of companies still has to fill the block, so the dots grow as the
 * selection shrinks instead of trailing off as one sparse row.
 */
function dotSize(total: number): number {
  if (total <= 24) return 22;
  if (total <= 60) return 16;
  return 12;
}

/** Each dot pops in; the wave finishes under ~1.6s even for the full Swedish set. */
const DOT_ENTER_DURATION = 0.2;
const DOT_WAVE_SPAN = 1.35;

function dotStaggerStep(count: number): number {
  if (count <= 1) return 0;
  return DOT_WAVE_SPAN / (count - 1);
}

export function ParisCompanyDots({
  companies,
  emphasis,
}: {
  companies: CompanyWithKPIs[];
  /** When set, the other group's dots recede so one verdict reads at a time. */
  emphasis: "on" | "off" | null;
}) {
  const { t } = useTranslation();
  const { reduceMotion, ease } = useChartMotion();
  const { ref, entered } = useEnteredView<HTMLDivElement>({
    enabled: !reduceMotion,
  });
  const play = reduceMotion || entered;
  const dots = parisDotCompanies(companies);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  if (dots.length === 0) return null;

  const size = dotSize(dots.length);
  const staggerStep = dotStaggerStep(dots.length);
  const active = dots.find((dot) => dot.id === activeId) ?? null;
  const activeStatus = active
    ? t(
        active.onTrack
          ? "companiesOverviewPage.paris.badgeOnTrack"
          : "companiesOverviewPage.paris.badgeOffTrack",
      )
    : null;

  const moveCursor = (event: KeyboardEvent<HTMLDivElement>) => {
    const count = dots.length;
    const current = buttonRefs.current.findIndex(
      (node) => node === document.activeElement,
    );
    if (current < 0) return;

    let next = current;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = (current + 1) % count;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = (current - 1 + count) % count;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = count - 1;
    } else {
      return;
    }

    event.preventDefault();
    setCursor(next);
    buttonRefs.current[next]?.focus();
  };

  return (
    <div ref={ref} inert={play ? undefined : true}>
      <p className="text-xs text-white/40">
        {t("companiesOverviewPage.paris.dotNote")}
      </p>
      <motion.div
        role="group"
        aria-label={t("companiesOverviewPage.paris.dotNote")}
        className="mt-2.5 flex flex-wrap"
        style={{ gap: size > 16 ? 9 : 6 }}
        initial={reduceMotion ? false : "hidden"}
        animate={play ? "visible" : "hidden"}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: reduceMotion ? 0 : staggerStep,
            },
          },
        }}
        onKeyDown={moveCursor}
      >
        {dots.map((dot, index) => {
          const status = t(
            dot.onTrack
              ? "companiesOverviewPage.paris.badgeOnTrack"
              : "companiesOverviewPage.paris.badgeOffTrack",
          );
          const dimmed =
            (emphasis === "on" && !dot.onTrack) ||
            (emphasis === "off" && dot.onTrack);

          return (
            <motion.button
              key={dot.id}
              ref={(node) => {
                buttonRefs.current[index] = node;
              }}
              type="button"
              tabIndex={index === cursor ? 0 : -1}
              aria-pressed={activeId === dot.id}
              aria-label={`${dot.name}, ${status}`}
              className={cn(
                "block cursor-pointer rounded-full border-0 p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80",
                activeId === dot.id &&
                  "ring-2 ring-white/80 ring-offset-2 ring-offset-black-2",
              )}
              style={{ width: size, height: size }}
              onMouseEnter={() => setActiveId(dot.id)}
              onClick={() => setActiveId(dot.id)}
              onFocus={() => {
                setCursor(index);
                setActiveId(dot.id);
              }}
              whileHover={reduceMotion ? undefined : { scale: 1.25 }}
              whileFocus={reduceMotion ? undefined : { scale: 1.25 }}
              variants={{
                hidden: { opacity: 0, scale: 0.35 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: reduceMotion ? 0 : DOT_ENTER_DURATION,
                    ease,
                  },
                },
              }}
            >
              <span
                className={cn(
                  "block h-full w-full rounded-full transition-opacity duration-150",
                  dimmed && "opacity-25",
                )}
                style={{
                  backgroundColor: dot.onTrack
                    ? "var(--blue-3)"
                    : "var(--pink-3)",
                }}
              />
            </motion.button>
          );
        })}
      </motion.div>
      <p className="mt-3 min-h-6 text-sm" aria-live="polite">
        {active && activeStatus ? (
          <>
            <LocalizedLink
              to={getCompanyDetailPath(active)}
              className="font-medium text-white underline decoration-white/30 underline-offset-2 transition-colors hover:decoration-white"
            >
              {active.name}
            </LocalizedLink>
            <span className="text-white/40"> · </span>
            <span className={active.onTrack ? "text-blue-2" : "text-pink-3"}>
              {activeStatus}
            </span>
          </>
        ) : (
          <span className="text-white/40">
            {t("companiesOverviewPage.paris.dotHint")}
          </span>
        )}
      </p>
    </div>
  );
}
