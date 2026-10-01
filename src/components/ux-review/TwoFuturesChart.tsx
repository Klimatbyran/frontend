import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Text } from "@/components/ui/text";
import type { ParisBudgetFacts } from "@/components/ux-review/useParisBudget";

type Row = {
  year: number;
  history?: number;
  trend?: number;
  paris?: number;
  parisBase?: number;
  gap?: number;
};

function buildRows(facts: ParisBudgetFacts): Row[] {
  const futureByYear = new Map(facts.path.map((point) => [point.year, point]));
  const years = new Set<number>([
    ...facts.history.map((point) => point.year),
    ...facts.path.map((point) => point.year),
  ]);

  return [...years]
    .sort((a, b) => a - b)
    .map((year) => {
      const future = futureByYear.get(year);
      const historyPoint = facts.history.find((point) => point.year === year);
      if (!future) return { year, history: historyPoint?.mton };

      return {
        year,
        history: historyPoint?.mton,
        trend: future.trendMton,
        paris: future.parisMton,
        parisBase: future.parisMton,
        gap: Math.max(0, future.trendMton - future.parisMton),
      };
    });
}

function Key({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-sm text-white/80">
      <span
        className="h-0.5 w-6 rounded-full"
        style={{ background: color }}
        aria-hidden
      />
      {label}
    </span>
  );
}

/**
 * One picture for "where we have been" and "where we are going". The shaded
 * wedge is the overshoot — the part of the story the current trend/Paris
 * dashed-line pair leaves the reader to eyeball.
 */
export function TwoFuturesChart({ facts }: { facts: ParisBudgetFacts }) {
  const rows = useMemo(() => buildRows(facts), [facts]);

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Text variant="h3" className="font-light">
          Sweden has two futures. We are on the wrong one.
        </Text>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Key color="#ffffff" label="What has happened" />
          <Key color="var(--pink-3)" label="Where today's pace leads" />
          <Key color="var(--green-2)" label="What Paris asks for" />
        </div>
      </div>

      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={rows}
            margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="year"
              type="number"
              domain={[1990, facts.endYear]}
              ticks={[1990, 2000, 2010, 2020, 2030, 2040, 2050]}
              tick={{ fill: "var(--grey)", fontSize: 12 }}
              axisLine={{ stroke: "rgba(255,255,255,0.15)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--grey)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={52}
              unit=" Mt"
            />
            <Area
              dataKey="parisBase"
              stackId="gap"
              stroke="none"
              fill="transparent"
              isAnimationActive={false}
            />
            <Area
              dataKey="gap"
              stackId="gap"
              stroke="none"
              fill="var(--pink-3)"
              fillOpacity={0.22}
              isAnimationActive={false}
            />
            <ReferenceLine
              x={facts.startYear}
              stroke="rgba(255,255,255,0.3)"
              strokeDasharray="4 4"
              label={{
                value: "today",
                position: "insideTopLeft",
                fill: "var(--grey)",
                fontSize: 12,
              }}
            />
            <Line
              dataKey="history"
              stroke="#ffffff"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="trend"
              stroke="var(--pink-3)"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="paris"
              stroke="var(--green-2)"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="max-w-2xl text-base leading-relaxed text-white/80">
        Everything in the pink wedge is emissions we are planning to produce
        beyond what Paris allows — about{" "}
        {Math.round(facts.trendMton - facts.budgetMton).toLocaleString("en-GB")}{" "}
        Mt CO₂e. Closing it means bending the pink line down onto the green one,
        starting this year.
      </p>
    </div>
  );
}
