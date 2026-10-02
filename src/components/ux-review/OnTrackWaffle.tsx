import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Municipality } from "@/types/municipality";

/**
 * The site already knows that only a handful of municipalities are on track,
 * but states it as "7% / 93%" inside a donut behind a filter chip. One dot per
 * municipality makes the same number land without reading a legend.
 */
export function OnTrackWaffle({
  municipalities,
}: {
  municipalities: Municipality[];
}) {
  const { onTrack, total, names } = useMemo(() => {
    const passing = municipalities.filter((item) => item.meetsParisGoal);
    return {
      onTrack: passing.length,
      total: municipalities.length,
      names: passing
        .map((item) => item.name)
        .sort((a, b) => a.localeCompare(b)),
    };
  }, [municipalities]);

  if (total === 0) return null;

  const onTrackSet = new Set(names);
  const ordered = [...municipalities].sort((a, b) => {
    const diff = Number(b.meetsParisGoal) - Number(a.meetsParisGoal);
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <p className="text-5xl font-light md:text-6xl">
          <span className="text-green-2">{onTrack}</span>
          <span className="text-grey"> of {total}</span>
        </p>
        <p className="max-w-2xl text-2xl font-light md:text-3xl">
          Swedish municipalities are cutting emissions fast enough to stay
          inside their share of the Paris Agreement.
        </p>
      </div>

      <div
        className="flex flex-wrap gap-[3px]"
        role="img"
        aria-label={`${onTrack} of ${total} municipalities are on track for the Paris Agreement.`}
      >
        {ordered.map((item, index) => (
          <motion.span
            key={item.name}
            title={`${item.name} — ${item.meetsParisGoal ? "on track" : "not on track"}`}
            className="h-3 w-3 rounded-[2px]"
            style={{
              background: onTrackSet.has(item.name)
                ? "var(--green-2)"
                : "rgba(255,255,255,0.12)",
            }}
            initial={{ opacity: 0, scale: 0.4 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.004, 1.2) }}
          />
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.15em] text-grey">
          The ones that are
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
    </div>
  );
}
