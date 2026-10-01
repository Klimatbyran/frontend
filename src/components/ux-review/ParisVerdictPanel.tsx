import { motion } from "framer-motion";
import { Text } from "@/components/ui/text";
import type { ParisBudgetFacts } from "@/components/ux-review/useParisBudget";

const round = (value: number) => Math.round(value).toLocaleString("en-GB");

function BudgetBar({
  label,
  caption,
  widthPercent,
  color,
  delay,
}: {
  label: string;
  caption: string;
  widthPercent: number;
  color: string;
  delay: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm text-white/80">{label}</span>
        <span className="text-sm tabular-nums text-grey">{caption}</span>
      </div>
      <div className="h-10 w-full overflow-hidden rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${widthPercent}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

/**
 * The answer to "is Sweden aligned with Paris?", stated before any chart.
 * Both totals come straight from the Carbon Law maths the site already runs.
 */
export function ParisVerdictPanel({ facts }: { facts: ParisBudgetFacts }) {
  const budgetShare = Math.min(100, (facts.budgetMton / facts.trendMton) * 100);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-grey">
          Sweden · {facts.startYear}–{facts.endYear}
        </p>
        <Text variant="h2" className="font-light">
          Are we on track for the Paris Agreement?
        </Text>
        <p className="text-2xl font-light md:text-3xl">
          <span className="text-pink-3">No.</span> We are on course to emit{" "}
          <span className="text-pink-3">
            {facts.overshootRatio.toFixed(1)} times
          </span>{" "}
          what we have left.
        </p>
      </div>

      <div className="relative space-y-6">
        <BudgetBar
          label="What Sweden can still emit and keep 1.5°C in reach"
          caption={`${round(facts.budgetMton)} Mt CO₂e`}
          widthPercent={budgetShare}
          color="var(--green-3)"
          delay={0}
        />
        <BudgetBar
          label="What we will emit if nothing changes"
          caption={`${round(facts.trendMton)} Mt CO₂e`}
          widthPercent={100}
          color="var(--pink-3)"
          delay={0.25}
        />

        {facts.budgetSpentYear && (
          <div
            className="pointer-events-none absolute inset-y-0 hidden border-l border-dashed border-white/50 md:block"
            style={{ left: `${budgetShare}%` }}
          >
            <span className="absolute -top-1 left-2 whitespace-nowrap text-xs text-white/70">
              budget gone by {facts.budgetSpentYear}
            </span>
          </div>
        )}
      </div>

      <p className="max-w-2xl text-base leading-relaxed text-white/80">
        Sweden is cutting emissions by roughly{" "}
        {facts.trendRatePercent.toFixed(0)}% a year. To stay inside the budget
        we would need to cut about 12% a year, every year, starting now. At
        today&apos;s pace the whole thing is spent by{" "}
        {facts.budgetSpentYear ?? facts.endYear} — and we keep emitting for
        another {facts.endYear - (facts.budgetSpentYear ?? facts.endYear)} years
        after that.
      </p>
    </div>
  );
}
