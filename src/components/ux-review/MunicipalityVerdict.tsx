import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { Municipality } from "@/types/municipality";

/** The per-person consumption footprint a 1.5°C world allows by 2050. */
const CONSUMPTION_TARGET_TONNES = 1;

const format = (value: number, digits = 0) =>
  value.toLocaleString("en-GB", { maximumFractionDigits: digits });

/** A faithful trim of today's header: three numbers, no verdict. */
function TodaysHeader({ municipality }: { municipality: Municipality }) {
  const latest = municipality.emissions.filter(Boolean).at(-1);

  const stats = [
    {
      label: `Total Emissions ${latest?.year ?? ""}`,
      value: format(latest?.value ?? 0),
      unit: "tCO₂e",
    },
    {
      label: "Annual emission change since 2015",
      value: `${municipality.historicalEmissionChangePercent.toFixed(1)}%`,
      unit: "",
    },
    {
      label: "Consumption emissions per capita",
      value: municipality.totalConsumptionEmission.toFixed(1),
      unit: "tCO₂e",
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-4xl font-light">{municipality.name}</h3>
      <div className="grid gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="space-y-1">
            <p className="text-sm text-white/80">{stat.label}</p>
            <p className="text-3xl font-light text-orange-3">
              {stat.value}
              {stat.unit && (
                <span className="ml-1 text-base text-grey">{stat.unit}</span>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BenchmarkBar({
  label,
  value,
  reference,
  valueLabel,
  referenceLabel,
}: {
  label: string;
  value: number;
  reference: number;
  valueLabel: string;
  referenceLabel: string;
}) {
  const scale = Math.max(value, reference);
  const good = value <= reference;

  return (
    <div className="space-y-2">
      <p className="text-sm text-white/80">{label}</p>
      <div className="relative h-7 w-full rounded-full bg-white/5">
        <motion.div
          className="h-full rounded-full"
          style={{ background: good ? "var(--green-3)" : "var(--pink-3)" }}
          initial={{ width: 0 }}
          whileInView={{ width: `${(value / scale) * 100}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
        <div
          className="absolute inset-y-0 border-l-2 border-dashed border-white/60"
          style={{ left: `${(reference / scale) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-grey">
        <span className={good ? "text-green-3" : "text-pink-3"}>
          {valueLabel}
        </span>
        <span>{referenceLabel}</span>
      </div>
    </div>
  );
}

function ProposedHeader({ municipality }: { municipality: Municipality }) {
  const onTrack = municipality.meetsParisGoal;
  const trendMton = municipality.totalTrend / 1_000_000;
  const budgetMton = municipality.totalCarbonLaw / 1_000_000;

  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <h3 className="text-4xl font-light">{municipality.name}</h3>
        <div
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-base ${
            onTrack ? "bg-green-5/40 text-green-2" : "bg-pink-5/40 text-pink-2"
          }`}
        >
          {onTrack ? <Check size={18} /> : <X size={18} />}
          {onTrack
            ? "On track for the Paris Agreement"
            : "Not on track for the Paris Agreement"}
        </div>
        <p className="max-w-xl text-lg font-light leading-relaxed">
          {onTrack ? (
            <>
              If {municipality.name} keeps cutting at today&apos;s pace it will
              emit{" "}
              <span className="text-green-2">{format(trendMton, 1)} Mt</span>{" "}
              between now and 2050 — inside its {format(budgetMton, 1)} Mt share
              of what the world can still emit.
            </>
          ) : (
            <>
              At today&apos;s pace {municipality.name} will emit{" "}
              <span className="text-pink-3">{format(trendMton, 1)} Mt</span>{" "}
              between now and 2050. Its fair share is {format(budgetMton, 1)} Mt
              — that is{" "}
              <span className="text-pink-3">
                {(trendMton / budgetMton).toFixed(1)}× too much
              </span>
              .
            </>
          )}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <BenchmarkBar
          label="Emissions between now and 2050"
          value={trendMton}
          reference={budgetMton}
          valueLabel={`${format(trendMton, 1)} Mt on today's pace`}
          referenceLabel={`${format(budgetMton, 1)} Mt allowed`}
        />
        <BenchmarkBar
          label="What each resident's consumption adds up to"
          value={municipality.totalConsumptionEmission}
          reference={CONSUMPTION_TARGET_TONNES}
          valueLabel={`${municipality.totalConsumptionEmission.toFixed(1)} t per person today`}
          referenceLabel="1 t by 2050"
        />
      </div>

      <p className="text-sm text-grey">
        Same three numbers as today, plus the one the data already knows and the
        page never says.
      </p>
    </div>
  );
}

const PRESETS = ["Stockholm", "Göteborg", "Malmö", "Kiruna"];

export function MunicipalityVerdict({
  municipalities,
}: {
  municipalities: Municipality[];
}) {
  const options = useMemo(
    () =>
      PRESETS.map((name) =>
        municipalities.find((item) => item.name === name),
      ).filter((item): item is Municipality => Boolean(item)),
    [municipalities],
  );
  const [selected, setSelected] = useState(0);
  const municipality = options[selected];

  if (!municipality) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {options.map((option, optionIndex) => (
          <button
            key={option.name}
            type="button"
            onClick={() => setSelected(optionIndex)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              optionIndex === selected
                ? "bg-white text-black"
                : "bg-white/10 text-white/80 hover:bg-white/20"
            }`}
          >
            {option.name}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <figure className="space-y-3">
          <figcaption className="text-xs uppercase tracking-[0.15em] text-grey">
            Today
          </figcaption>
          <div className="rounded-level-2 bg-black-2 p-6 md:p-8">
            <TodaysHeader municipality={municipality} />
          </div>
        </figure>
        <figure className="space-y-3">
          <figcaption className="text-xs uppercase tracking-[0.15em] text-[#E2FF8D]">
            Proposed
          </figcaption>
          <div className="rounded-level-2 bg-black-2 p-6 md:p-8">
            <ProposedHeader municipality={municipality} />
          </div>
        </figure>
      </div>
    </div>
  );
}
