import { useId, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Text } from "@/components/ui/text";
import type { ParisBudgetFacts } from "@/components/ux-review/useParisBudget";

/** Basin geometry (viewBox 440×270). The rim doubles as the budget line. */
const RIM_Y = 74;
const FLOOR_Y = 206;
const BASIN_LEFT = 54;
const BASIN_RIGHT = 386;
const BASIN_CLIP =
  "M54 74 C54 150 84 196 142 202 L298 202 C356 196 386 150 386 74 Z";
const BASIN_WALL =
  "M38 68 C38 152 72 204 138 214 L302 214 C368 204 402 152 402 68";
const STROKE = "rgba(255,255,255,0.4)";

type YearPoint = { year: number; cumulativeMton: number };

function buildCumulative(facts: ParisBudgetFacts): YearPoint[] {
  let cumulative = 0;
  return facts.path.map((point) => {
    cumulative += point.trendMton;
    return { year: point.year, cumulativeMton: cumulative };
  });
}

function Spill({ x, delay }: { x: number; delay: number }) {
  return (
    <motion.path
      d={`M${x} ${RIM_Y + 4} q4 26 -2 52`}
      fill="none"
      stroke="var(--pink-3)"
      strokeWidth="5"
      strokeLinecap="round"
      initial={{ opacity: 0, pathLength: 0 }}
      animate={{ opacity: [0, 0.9, 0], pathLength: 1 }}
      transition={{ duration: 1.6, delay, repeat: Infinity, ease: "easeIn" }}
    />
  );
}

/**
 * The story already uses a bathtub for accumulated emissions, but the tub has
 * no sides — the number it shows has nothing to be large *relative to*. Here
 * the tub is the remaining 1.5°C budget, so filling it past the rim is the
 * answer to the Paris question rather than a metaphor that stops early.
 */
export function BudgetBathtub({ facts }: { facts: ParisBudgetFacts }) {
  const reducedMotion = useReducedMotion();
  const clipId = `budget-tub-${useId().replace(/:/g, "")}`;
  const years = useMemo(() => buildCumulative(facts), [facts]);
  const [index, setIndex] = useState(() => {
    const spent = years.findIndex(
      (point) => point.year === facts.budgetSpentYear,
    );
    return spent >= 0 ? spent : years.length - 1;
  });

  const current = years[Math.min(index, years.length - 1)];
  const ratio = current.cumulativeMton / facts.budgetMton;
  const waterTop = FLOOR_Y - Math.min(ratio, 1) * (FLOOR_Y - RIM_Y);
  const overflowing = ratio > 1;
  const waterColor = overflowing ? "var(--pink-4)" : "var(--blue-4)";
  const surfaceColor = overflowing ? "var(--pink-2)" : "var(--blue-2)";

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Text variant="h3" className="font-light">
          This tub holds everything Sweden has left
        </Text>
        <p className="mx-auto max-w-xl text-base text-white/70">
          {Math.round(facts.budgetMton).toLocaleString("en-GB")} Mt CO₂e — our
          share of what the world can still emit and keep 1.5°C alive. Drag the
          year to pour in what we are on track to emit.
        </p>
      </div>

      <svg
        viewBox="0 0 440 272"
        className="mx-auto h-auto w-full max-w-lg"
        role="img"
        aria-label={`By ${current.year}, Sweden's trajectory has used ${Math.round(
          ratio * 100,
        )} percent of its remaining Paris budget.`}
      >
        <defs>
          <clipPath id={clipId}>
            <path d={BASIN_CLIP} />
          </clipPath>
        </defs>

        {/* Faucet, still running */}
        <path
          d={`M348 ${RIM_Y - 6} V34 Q348 20 334 20 H326 V24`}
          fill="none"
          stroke={STROKE}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path d="M322 24 h8 v4 h-8 z" fill={STROKE} />
        {!reducedMotion && (
          <motion.circle
            cx={326}
            r={3.2}
            fill={surfaceColor}
            animate={{ cy: [32, 66], opacity: [0, 1, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.3, ease: "easeIn" }}
          />
        )}

        <g clipPath={`url(#${clipId})`}>
          <motion.rect
            x={BASIN_LEFT}
            width={BASIN_RIGHT - BASIN_LEFT}
            initial={false}
            animate={{
              y: waterTop,
              height: FLOOR_Y - waterTop,
              fill: waterColor,
            }}
            transition={{ duration: reducedMotion ? 0 : 0.5 }}
            fillOpacity={0.9}
          />
        </g>
        <motion.line
          x1={BASIN_LEFT + 4}
          x2={BASIN_RIGHT - 4}
          initial={false}
          animate={{ y1: waterTop, y2: waterTop, stroke: surfaceColor }}
          transition={{ duration: reducedMotion ? 0 : 0.5 }}
          strokeWidth="3"
        />

        {overflowing && !reducedMotion && (
          <>
            <Spill x={56} delay={0} />
            <Spill x={384} delay={0.5} />
          </>
        )}

        {/* Tub outline and rim */}
        <path
          d={BASIN_WALL}
          fill="none"
          stroke={STROKE}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <ellipse
          cx="220"
          cy="68"
          rx="182"
          ry="13"
          fill="none"
          stroke={STROKE}
          strokeWidth="2"
        />
        <path
          d="M140 214 Q140 230 128 238"
          fill="none"
          stroke={STROKE}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M300 214 Q300 230 312 238"
          fill="none"
          stroke={STROKE}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* The budget line — the piece the live story is missing */}
        <line
          x1="20"
          x2="420"
          y1={RIM_Y}
          y2={RIM_Y}
          stroke={overflowing ? "var(--pink-2)" : "var(--green-2)"}
          strokeWidth="2"
          strokeDasharray="6 5"
        />
        <text
          x="20"
          y={RIM_Y - 10}
          fill={overflowing ? "var(--pink-2)" : "var(--green-2)"}
          fontSize="13"
        >
          Paris limit
        </text>

        <text
          x="220"
          y="150"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="34"
          fontWeight={500}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {Math.round(ratio * 100)}%
        </text>
        <text
          x="220"
          y="172"
          textAnchor="middle"
          fill="rgba(255,255,255,0.75)"
          fontSize="13"
        >
          of the budget used
        </text>
      </svg>

      <div className="mx-auto max-w-lg space-y-3">
        <input
          type="range"
          min={0}
          max={years.length - 1}
          value={index}
          onChange={(event) => setIndex(Number(event.target.value))}
          aria-label="Year"
          className="w-full accent-[#E2FF8D]"
        />
        <div className="flex items-baseline justify-between text-sm text-grey">
          <span>{years[0].year}</span>
          <span className="text-2xl font-light text-white tabular-nums">
            {current.year}
          </span>
          <span>{years.at(-1)!.year}</span>
        </div>
      </div>

      <p className="mx-auto max-w-xl text-center text-lg font-light">
        {overflowing ? (
          <>
            It overflowed in{" "}
            <span className="text-pink-3">{facts.budgetSpentYear}</span>. The
            tap stays on until 2050.
          </>
        ) : (
          <>
            Still inside the budget — but only until{" "}
            <span className="text-pink-3">{facts.budgetSpentYear}</span>.
          </>
        )}
      </p>
    </div>
  );
}
