import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { Municipality } from "@/types/municipality";

export function MunicipalitiesOnTrackWaffle({
  municipalities,
}: {
  municipalities: Municipality[];
}) {
  const { t } = useTranslation();

  const { onTrack, total, names } = useMemo(() => {
    const passing = municipalities.filter((item) => item.meetsParisGoal);
    return {
      onTrack: passing.length,
      total: municipalities.length,
      names: passing
        .map((item) => item.name)
        .sort((a, b) => a.localeCompare(b, "sv")),
    };
  }, [municipalities]);

  if (total === 0) return null;

  const onTrackSet = new Set(names);
  const ordered = [...municipalities].sort((a, b) => {
    const diff = Number(b.meetsParisGoal) - Number(a.meetsParisGoal);
    return diff !== 0 ? diff : a.name.localeCompare(b.name, "sv");
  });

  return (
    <section
      className="rounded-level-2 border border-white/10 bg-black-2 p-6 md:p-8"
      aria-labelledby="municipality-paris-waffle-heading"
    >
      <div className="space-y-7">
        <div className="space-y-3">
          <p
            id="municipality-paris-waffle-heading"
            className="text-4xl font-light md:text-5xl"
          >
            <span className="text-green-2">{onTrack}</span>
            <span className="text-grey">
              {t("municipalities.onTrackWaffle.ofTotal", { total })}
            </span>
          </p>
          <p className="max-w-2xl text-xl font-light md:text-2xl">
            {t("municipalities.onTrackWaffle.headline")}
          </p>
        </div>

        <div
          className="flex flex-wrap gap-[3px]"
          role="img"
          aria-label={t("municipalities.onTrackWaffle.chartAria", {
            onTrack,
            total,
          })}
        >
          {ordered.map((item, index) => (
            <motion.span
              key={item.name}
              title={`${item.name} — ${
                item.meetsParisGoal
                  ? t("municipalities.onTrackWaffle.dotOnTrack")
                  : t("municipalities.onTrackWaffle.dotOffTrack")
              }`}
              className="h-3 w-3 rounded-[2px]"
              style={{
                background: onTrackSet.has(item.name)
                  ? "var(--green-2)"
                  : "rgba(255,255,255,0.12)",
              }}
              initial={{ opacity: 0, scale: 0.4 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.3,
                delay: Math.min(index * 0.004, 1.2),
              }}
            />
          ))}
        </div>

        {names.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.15em] text-grey">
              {t("municipalities.onTrackWaffle.onTrackListLabel")}
            </p>
            <div className="flex flex-wrap gap-2">
              {names.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-green-5/40 px-3 py-1 text-sm text-green-2"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
