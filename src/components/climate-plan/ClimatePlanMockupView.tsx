import { useMemo, useState, type ChangeEvent } from "react";
import { Download, Search } from "lucide-react";
import { OverviewStat } from "@/components/companies/detail/overview/OverviewStat";
import {
  detailStatItemClassName,
  detailStatsRowClassName,
} from "@/components/detail/detailStatsLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import {
  CLIMATE_PLAN_STEPS,
  EXAMPLE_MUNICIPALITY,
  EXAMPLE_NOTE,
  EXAMPLE_SECTORS,
  EXAMPLE_STATS,
  countFilledAnswers,
  initialAnswers,
  type MockField,
  type WizardStep,
} from "./climatePlanMockupContent";

const controlClassName =
  "w-full rounded-md border border-white/10 bg-black-1 px-3 py-2 text-sm font-light text-white placeholder:text-grey focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40";

function FillProgress({ filled, total }: { filled: number; total: number }) {
  const percent = total === 0 ? 0 : Math.round((filled / total) * 100);

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h1 className="text-sm font-light text-grey">Klimatplan</h1>
        <p className="text-sm text-grey">
          {filled} av {total} ifyllda
        </p>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={filled}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Ifyllda frågor"
      >
        <div
          className="h-full rounded-full bg-orange-2 transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function StepHeading({ step }: { step: WizardStep }) {
  return (
    <div>
      <p className="text-sm text-grey">{step.kicker}</p>
      <Text variant="h4" as="h2" className="mt-1">
        {step.title}
      </Text>
      {step.intro && (
        <p className="mt-3 max-w-2xl text-sm text-grey">{step.intro}</p>
      )}
    </div>
  );
}

function FieldLabel({ field }: { field: MockField }) {
  return (
    <div className="mb-2 flex items-start justify-between gap-3">
      <label htmlFor={field.id} className="text-sm text-white">
        {field.label}
      </label>
      {field.fromKlimatkollen && (
        <span className="shrink-0 rounded-full bg-black-1 px-2 py-0.5 text-xs text-grey">
          Klimatkollen
        </span>
      )}
    </div>
  );
}

function TextQuestion({
  field,
  value,
  onChange,
  grow,
  hideHint,
}: {
  field: MockField;
  value: string;
  onChange: (value: string) => void;
  grow?: boolean;
  hideHint?: boolean;
}) {
  const locked = field.fromKlimatkollen;
  const shared = {
    id: field.id,
    value,
    readOnly: locked,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(event.target.value),
    placeholder: value ? undefined : field.placeholder,
    className: cn(controlClassName, locked && "text-white/80"),
  };

  return (
    <div className={cn(grow && "flex min-h-0 flex-1 flex-col")}>
      {!grow && <FieldLabel field={field} />}
      {field.kind === "textarea" ? (
        <textarea
          {...shared}
          rows={grow ? undefined : 4}
          className={cn(
            shared.className,
            "resize-none",
            grow && "min-h-40 flex-1",
          )}
        />
      ) : (
        <div className="flex items-center gap-3">
          <input {...shared} type="text" />
          {field.unit && (
            <span className="shrink-0 text-sm text-grey">{field.unit}</span>
          )}
        </div>
      )}
      {!hideHint && field.hint && (
        <p className="mt-2 text-xs text-grey">{field.hint}</p>
      )}
    </div>
  );
}

function CheckQuestion({
  field,
  checked,
  onChange,
}: {
  field: MockField;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id={field.id}
        checked={checked}
        onCheckedChange={(next) => onChange(next === true)}
        className="mt-0.5 border-white/40 data-[state=checked]:bg-orange-2 data-[state=checked]:text-black"
      />
      <div>
        <label htmlFor={field.id} className="text-sm text-white">
          {field.label}
        </label>
        {field.hint && <p className="mt-1 text-xs text-grey">{field.hint}</p>}
      </div>
    </div>
  );
}

function MunicipalityStep() {
  return (
    <div className="mx-auto w-full max-w-xl">
      <label htmlFor="municipality" className="mb-2 block text-sm">
        Kommun
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50"
          aria-hidden
        />
        <input
          id="municipality"
          readOnly
          value={EXAMPLE_MUNICIPALITY}
          className={cn(controlClassName, "h-11 pl-9")}
        />
      </div>
      <p className="mt-3 text-sm text-grey">
        {EXAMPLE_MUNICIPALITY} är vald i det här exemplet. {EXAMPLE_NOTE}
      </p>
    </div>
  );
}

function EmissionsStep() {
  return (
    <div>
      <div className={cn("mt-8", detailStatsRowClassName)}>
        {EXAMPLE_STATS.map((stat) => (
          <div key={stat.label} className={detailStatItemClassName}>
            <OverviewStat
              variant="detail"
              label={stat.label}
              value={stat.value}
              unit={stat.unit}
              caption={stat.caption}
              valueClassName={stat.valueClassName}
              useFlex1={false}
            />
          </div>
        ))}
      </div>
      <div className="mt-8">
        <p className="mb-3 text-sm text-grey">Fördelning per sektor</p>
        <div className="flex h-3 overflow-hidden rounded-full">
          {EXAMPLE_SECTORS.map((sector) => (
            <div
              key={sector.label}
              style={{ width: `${sector.share}%`, background: sector.color }}
            />
          ))}
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 md:grid-cols-5">
          {EXAMPLE_SECTORS.map((sector) => (
            <li key={sector.label} className="flex items-start gap-2 text-sm">
              <span
                className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: sector.color }}
              />
              <span>
                <span className="block">{sector.label}</span>
                <span className="text-grey">{sector.share} %</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function FieldsStep({
  step,
  answers,
  checks,
  onAnswer,
  onCheck,
}: {
  step: WizardStep;
  answers: Record<string, string>;
  checks: Record<string, boolean>;
  onAnswer: (id: string, value: string) => void;
  onCheck: (id: string, checked: boolean) => void;
}) {
  const checksOnly = step.fields.every((field) => field.kind === "checkbox");
  const single = step.fields.length === 1;

  if (checksOnly) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        {step.fields.map((field) => (
          <CheckQuestion
            key={field.id}
            field={field}
            checked={checks[field.id] ?? false}
            onChange={(checked) => onCheck(field.id, checked)}
          />
        ))}
      </div>
    );
  }

  if (single && step.grow) {
    const field = step.fields[0];
    return (
      <TextQuestion
        field={field}
        value={answers[field.id] ?? ""}
        onChange={(value) => onAnswer(field.id, value)}
        grow
        hideHint
      />
    );
  }

  return (
    <div
      className={cn("grid gap-6", step.fields.length > 1 && "md:grid-cols-2")}
    >
      {step.fields.map((field) => (
        <TextQuestion
          key={field.id}
          field={field}
          value={answers[field.id] ?? ""}
          onChange={(value) => onAnswer(field.id, value)}
          hideHint={single}
        />
      ))}
    </div>
  );
}

export function ClimatePlanMockupView() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const step = CLIMATE_PLAN_STEPS[stepIndex];
  const { filled, total } = useMemo(
    () => countFilledAnswers(answers, checks),
    [answers, checks],
  );
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === CLIMATE_PLAN_STEPS.length - 1;
  const centerStep = step.kind === "municipality" || step.kind === "download";

  return (
    <div className="mx-auto flex h-[calc(100dvh-9rem)] min-h-[32rem] w-full max-w-[960px] flex-col">
      <FillProgress filled={filled} total={total} />

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto py-6",
          centerStep && "justify-center",
        )}
      >
        <div className={cn(step.grow && "flex min-h-0 flex-1 flex-col")}>
          <StepHeading step={step} />
          <div
            className={cn("mt-6", step.grow && "flex min-h-0 flex-1 flex-col")}
          >
            {step.kind === "municipality" && <MunicipalityStep />}
            {step.kind === "emissions" && <EmissionsStep />}
            {step.kind === "fields" && (
              <FieldsStep
                step={step}
                answers={answers}
                checks={checks}
                onAnswer={(id, value) =>
                  setAnswers((current) => ({ ...current, [id]: value }))
                }
                onCheck={(id, checked) =>
                  setChecks((current) => ({ ...current, [id]: checked }))
                }
              />
            )}
            {step.kind === "download" && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled
                className="pointer-events-none w-fit gap-2 border border-white/15 disabled:opacity-100"
              >
                <Download className="h-4 w-4" aria-hidden />
                Ladda ner Word
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {!isFirst && (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => setStepIndex((current) => current - 1)}
          >
            Tillbaka
          </Button>
        )}
        {!isLast && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="border border-white/15"
            onClick={() => setStepIndex((current) => current + 1)}
          >
            Nästa
          </Button>
        )}
      </div>
    </div>
  );
}
