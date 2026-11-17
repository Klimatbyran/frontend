import { useEffect, useRef, useState, type ChangeEvent } from "react";
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
  type ClimatePlanField,
  type WizardStep,
} from "./climatePlanContent";
import type { ClimatePlanFigures } from "./climatePlanFigures";
import { useClimatePlanWizard } from "./useClimatePlanWizard";

const controlClassName =
  "w-full rounded-md border border-white/10 bg-black-1 px-3 py-2 text-sm font-light text-white placeholder:text-grey focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40";

function FillProgress({ step, steps }: { step: number; steps: number }) {
  const current = step + 1;
  const scale = steps === 0 ? 0 : current / steps;

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h1 className="text-sm font-light text-grey">Klimatplan</h1>
        <p className="text-sm text-grey">
          Steg {current} av {steps}
        </p>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={steps}
        aria-label="Steg i klimatplanen"
      >
        <div
          className="h-full w-full origin-left rounded-full bg-orange-2 transition-transform duration-300 motion-reduce:transition-none"
          style={{ transform: `scaleX(${scale})` }}
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
      {step.tip && (
        <p className="mt-4 max-w-2xl border-l border-white/20 pl-3 text-sm text-grey">
          <span className="text-white">Tips. </span>
          {step.tip}
        </p>
      )}
    </div>
  );
}

function FieldLabel({ field }: { field: ClimatePlanField }) {
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
  field: ClimatePlanField;
  value: string;
  onChange: (value: string) => void;
  grow?: boolean;
  hideHint?: boolean;
}) {
  const locked = Boolean(field.fromKlimatkollen && value.trim());
  const labelledByHeading = Boolean(grow || hideHint);
  const shared = {
    id: field.id,
    value,
    readOnly: locked,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(event.target.value),
    placeholder: value ? undefined : field.placeholder,
    "aria-label": labelledByHeading ? field.label : undefined,
    className: cn(controlClassName, locked && "text-white/80"),
  };

  return (
    <div className={cn(grow && "flex min-h-0 flex-1 flex-col")}>
      {!labelledByHeading && <FieldLabel field={field} />}
      {labelledByHeading && field.fromKlimatkollen && (
        <p className="mb-2 text-xs text-grey">Klimatkollen</p>
      )}
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
  field: ClimatePlanField;
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

function MunicipalityStep({
  wizard,
}: {
  wizard: ReturnType<typeof useClimatePlanWizard>;
}) {
  const closeTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (closeTimer.current != null) window.clearTimeout(closeTimer.current);
    },
    [],
  );

  function openList() {
    if (closeTimer.current != null) window.clearTimeout(closeTimer.current);
    wizard.setListOpen(true);
  }

  function scheduleClose() {
    if (closeTimer.current != null) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(
      () => wizard.setListOpen(false),
      150,
    );
  }

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
          value={wizard.query}
          onChange={(event) => wizard.changeQuery(event.target.value)}
          onFocus={openList}
          onBlur={scheduleClose}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              wizard.setListOpen(false);
              return;
            }
            if (event.key === "Enter" && wizard.matches[0]) {
              event.preventDefault();
              wizard.selectMunicipality(wizard.matches[0]);
            }
          }}
          placeholder="Sök eller välj i listan"
          className={cn(controlClassName, "h-11 pl-9")}
          role="combobox"
          aria-expanded={wizard.listOpen}
          aria-controls="municipality-list"
          autoComplete="off"
        />
        {wizard.listOpen && (
          <div
            id="municipality-list"
            className="absolute left-0 top-full z-30 mt-2 max-h-56 w-full overflow-y-auto rounded-md bg-black-2 shadow-lg"
          >
            {wizard.municipalitiesLoading ? (
              <p className="px-3 py-2 text-sm text-grey">Hämtar kommuner…</p>
            ) : wizard.matches.length === 0 ? (
              <p className="px-3 py-2 text-sm text-grey">
                {wizard.municipalitiesMissing
                  ? "Kunde inte hämta kommuner."
                  : "Ingen kommun matchar."}
              </p>
            ) : (
              wizard.matches.map((name) => (
                <button
                  key={name}
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-white/10"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => wizard.selectMunicipality(name)}
                >
                  {name}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      <p className="mt-3 text-sm text-grey">
        {wizard.selectedName
          ? `${wizard.selectedName} är vald. Siffrorna i nästa steg hämtas från Klimatkollen.`
          : "Välj en kommun för att hämta utsläppen och gå vidare."}
      </p>
    </div>
  );
}

function EmissionsStep({
  figures,
  sectorsLoading,
  sectorsFailed,
}: {
  figures: ClimatePlanFigures | null;
  sectorsLoading: boolean;
  sectorsFailed: boolean;
}) {
  if (!figures) {
    return (
      <p className="text-sm text-grey">
        Välj en kommun i första steget. Då visas utsläppen här.
      </p>
    );
  }

  return (
    <div>
      <div className={cn("mt-8", detailStatsRowClassName)}>
        {figures.stats.map((stat) => (
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
        {sectorsLoading ? (
          <p className="text-sm text-grey">Hämtar sektorer…</p>
        ) : sectorsFailed ? (
          <p className="text-sm text-grey">Kunde inte hämta sektorerna.</p>
        ) : figures.sectors.length === 0 ? (
          <p className="text-sm text-grey">Ingen sektorfördelning finns.</p>
        ) : (
          <>
            <div className="flex h-3 overflow-hidden rounded-full">
              {figures.sectors.map((sector, index) => (
                <div
                  key={`${sector.label}-${index}`}
                  style={{
                    width: `${sector.share}%`,
                    background: sector.color,
                  }}
                />
              ))}
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              {figures.sectors.map((sector, index) => (
                <li
                  key={`${sector.label}-${index}`}
                  className="flex items-start gap-2 text-sm"
                >
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
          </>
        )}
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

export function ClimatePlanView() {
  const wizard = useClimatePlanWizard();
  const [stepIndex, setStepIndex] = useState(0);
  const step = CLIMATE_PLAN_STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === CLIMATE_PLAN_STEPS.length - 1;
  const centerStep = step.kind === "municipality" || step.kind === "download";
  const canContinue = !isFirst || wizard.selectedName != null;

  return (
    <div className="mx-auto flex h-[calc(100dvh-9rem)] min-h-[32rem] w-full max-w-[960px] flex-col">
      <FillProgress step={stepIndex} steps={CLIMATE_PLAN_STEPS.length} />

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
            {step.kind === "municipality" && (
              <MunicipalityStep wizard={wizard} />
            )}
            {step.kind === "emissions" && (
              <EmissionsStep
                figures={wizard.figures}
                sectorsLoading={wizard.sectorsLoading}
                sectorsFailed={wizard.sectorsFailed}
              />
            )}
            {step.kind === "fields" && (
              <FieldsStep
                step={step}
                answers={wizard.answers}
                checks={wizard.checks}
                onAnswer={wizard.setAnswer}
                onCheck={wizard.setCheck}
              />
            )}
            {step.kind === "download" && (
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={
                    !wizard.selectedName ||
                    wizard.downloading ||
                    wizard.sectorsLoading
                  }
                  className="w-fit gap-2 border border-white/15 disabled:opacity-50"
                  onClick={() => void wizard.download()}
                >
                  <Download className="h-4 w-4" aria-hidden />
                  {wizard.downloading
                    ? "Skapar fil…"
                    : wizard.sectorsLoading
                      ? "Hämtar siffror…"
                      : "Ladda ner Word"}
                </Button>
                {wizard.downloadError && (
                  <p className="mt-3 text-sm text-pink-3">
                    {wizard.downloadError}
                  </p>
                )}
              </div>
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
            disabled={!canContinue}
            onClick={() => setStepIndex((current) => current + 1)}
          >
            Nästa
          </Button>
        )}
      </div>
    </div>
  );
}
