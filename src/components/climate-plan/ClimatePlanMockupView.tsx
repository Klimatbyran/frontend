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
  CLIMATE_PLAN_PARTS,
  EXAMPLE_MUNICIPALITY,
  EXAMPLE_NOTE,
  EXAMPLE_SECTORS,
  EXAMPLE_STATS,
  type MockField,
  type MockSection,
} from "./climatePlanMockupContent";

const controlClassName =
  "pointer-events-none w-full rounded-md border border-white/10 bg-black-1 px-3 py-2 text-sm font-light text-white placeholder:text-grey";

function DownloadWordButton({ className }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      disabled
      className={cn(
        "pointer-events-none gap-2 border border-white/15 disabled:opacity-100",
        className,
      )}
    >
      <Download className="h-4 w-4" aria-hidden />
      Ladda ner Word
    </Button>
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

function FieldHint({ hint }: { hint?: string }) {
  if (!hint) return null;
  return <p className="mt-2 text-xs text-grey">{hint}</p>;
}

function TextField({ field }: { field: MockField }) {
  const shared = {
    id: field.id,
    readOnly: true,
    tabIndex: -1,
    defaultValue: field.value ?? "",
    placeholder: field.value ? undefined : field.placeholder,
    className: controlClassName,
  };

  return (
    <div>
      <FieldLabel field={field} />
      {field.kind === "textarea" ? (
        <textarea
          {...shared}
          rows={4}
          className={cn(shared.className, "resize-none")}
        />
      ) : (
        <div className="flex items-center gap-3">
          <input {...shared} type="text" />
          {field.unit && (
            <span className="shrink-0 text-sm text-grey">{field.unit}</span>
          )}
        </div>
      )}
      <FieldHint hint={field.hint} />
    </div>
  );
}

function CheckboxField({ field }: { field: MockField }) {
  return (
    <div className="flex items-start gap-3">
      <Checkbox
        id={field.id}
        disabled
        className="pointer-events-none mt-0.5 border-white/40 disabled:opacity-100"
      />
      <div>
        <label htmlFor={field.id} className="text-sm text-white">
          {field.label}
        </label>
        <FieldHint hint={field.hint} />
      </div>
    </div>
  );
}

function FieldControl({ field }: { field: MockField }) {
  if (field.kind === "checkbox") return <CheckboxField field={field} />;
  return <TextField field={field} />;
}

function FieldGrid({ fields }: { fields: MockField[] }) {
  const checks = fields.every((field) => field.kind === "checkbox");
  return (
    <div
      className={cn(
        "grid gap-6",
        checks ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2",
      )}
    >
      {fields.map((field) => (
        <div
          key={field.id}
          className={field.kind === "textarea" ? "md:col-span-2" : undefined}
        >
          <FieldControl field={field} />
        </div>
      ))}
    </div>
  );
}

function EmissionsRecap() {
  return (
    <div className="grid grid-cols-1 gap-6 border-b border-white/10 pb-8 sm:grid-cols-3">
      {EXAMPLE_STATS.map((stat) => (
        <div key={stat.label}>
          <p className="text-sm text-grey">{stat.label}</p>
          <p className={cn("text-2xl font-light", stat.valueClassName)}>
            {stat.value}
            <span className="ml-2 text-base text-grey">{stat.unit}</span>
          </p>
          {stat.caption && (
            <p className="mt-1 text-xs text-grey">{stat.caption}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function PlanSection({ section }: { section: MockSection }) {
  return (
    <article className="space-y-8 rounded-level-2 bg-black-2 p-6 md:p-10">
      <div>
        <p className="text-sm text-grey">{section.number}</p>
        <Text variant="h4" as="h3">
          {section.title}
        </Text>
        {section.intro && (
          <p className="mt-2 max-w-3xl text-sm text-grey">{section.intro}</p>
        )}
      </div>
      {section.showEmissionsRecap && <EmissionsRecap />}
      {section.fields && <FieldGrid fields={section.fields} />}
      {section.groups?.map((group) => (
        <div key={group.title} className="space-y-4">
          <Text as="h4" className="text-lg">
            {group.title}
          </Text>
          <FieldGrid fields={group.fields} />
        </div>
      ))}
    </article>
  );
}

function EmissionsSnapshot() {
  return (
    <section className="rounded-level-2 bg-black-2 p-6 md:p-10">
      <Text variant="h4" as="h2">
        Utsläpp i kommunen
      </Text>
      <p className="mt-2 max-w-3xl text-sm text-grey">
        Territoriella utsläpp och fördelning per sektor. Fylls i automatiskt.
      </p>
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
      <div className="mt-10">
        <p className="mb-3 text-sm text-grey">Fördelning per sektor</p>
        <div className="flex h-3 overflow-hidden rounded-full">
          {EXAMPLE_SECTORS.map((sector) => (
            <div
              key={sector.label}
              style={{ width: `${sector.share}%`, background: sector.color }}
            />
          ))}
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-5">
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
    </section>
  );
}

export function ClimatePlanMockupView() {
  return (
    <div className="space-y-16">
      <section className="rounded-level-2 bg-black-2 p-6 md:p-10">
        <div className="grid gap-4 md:grid-cols-[minmax(0,32rem)_1fr] md:items-end">
          <div>
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
                tabIndex={-1}
                defaultValue={EXAMPLE_MUNICIPALITY}
                className={cn(controlClassName, "h-11 pl-9")}
              />
            </div>
            <p className="mt-2 text-xs text-grey">
              Sök eller välj i listan. {EXAMPLE_MUNICIPALITY} är vald i det här
              exemplet.
            </p>
          </div>
          <DownloadWordButton className="w-full md:w-fit md:justify-self-end" />
        </div>
        <p className="mt-6 max-w-3xl text-sm text-grey">{EXAMPLE_NOTE}</p>
      </section>

      <EmissionsSnapshot />

      {CLIMATE_PLAN_PARTS.map((part) => (
        <section key={part.kicker} className="space-y-6">
          <div>
            <p className="text-sm text-grey">{part.kicker}</p>
            <Text variant="h3" as="h2">
              {part.title}
            </Text>
            <p className="mt-2 text-sm text-grey">{part.intro}</p>
          </div>
          <div className="space-y-6">
            {part.sections.map((section) => (
              <PlanSection key={section.number} section={section} />
            ))}
          </div>
        </section>
      ))}

      <section className="flex flex-col gap-4 rounded-level-2 bg-black-2 p-6 md:flex-row md:items-center md:justify-between md:p-10">
        <div>
          <Text as="h2" className="text-2xl">
            Ladda ner klimatplanen
          </Text>
          <p className="mt-2 max-w-xl text-sm text-grey">
            Word-filen fylls med kommunens siffror och det som skrivits i
            fälten.
          </p>
        </div>
        <DownloadWordButton className="w-full shrink-0 md:w-fit" />
      </section>
    </div>
  );
}
