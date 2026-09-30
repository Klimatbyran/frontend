import { useTranslation } from "react-i18next";

const SHIMMER = "animate-pulse rounded bg-white/10";

function Block({ className = "" }: { className?: string }) {
  return <div className={`${SHIMMER} ${className}`} />;
}

function HeaderSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <Block className="h-9 w-3/4 max-w-[520px] md:h-11" />
        <Block className="h-4 w-full max-w-[600px]" />
        <Block className="h-4 w-2/3 max-w-[420px]" />
      </div>

      {/* The explainer loads collapsed, so only its trigger row is reserved. */}
      <div className="flex max-w-[640px] items-center justify-between gap-4 rounded-2xl bg-black-2 px-5 py-4">
        <Block className="h-4 w-52" />
        <Block className="size-4 shrink-0" />
      </div>
    </div>
  );
}

function ChipFilterSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Block className="mr-1 h-2.5 w-14" />
      <Block className="h-7 w-32 rounded-full" />
      <Block className="h-6 w-24 rounded-full" />
    </div>
  );
}

/** Mid-sized dots and a full block, matching a typical unfiltered selection. */
const DOT_COUNT = 48;

function AnswerCardSkeleton() {
  return (
    <section className="grid items-center gap-9 rounded-level-2 bg-black-2 px-6 py-8 md:grid-cols-[minmax(0,1fr)_minmax(340px,0.85fr)] md:gap-14 md:px-10 md:py-9">
      <div>
        <Block className="h-3 w-36" />
        <Block className="mb-3 mt-3.5 h-[68px] w-[140px] md:h-[92px] md:w-[190px]" />
        <div className="space-y-2.5">
          <Block className="h-6 w-full max-w-[560px] md:h-7" />
          <Block className="h-6 w-4/5 max-w-[450px] md:h-7" />
        </div>
        <div className="mt-4 space-y-2">
          <Block className="h-4 w-full max-w-[600px]" />
          <Block className="h-4 w-3/5 max-w-[380px]" />
        </div>
      </div>

      <div>
        <Block className="h-3 w-44" />
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {Array.from({ length: DOT_COUNT }, (_, index) => (
            <Block key={index} className="size-4 rounded-full" />
          ))}
        </div>
        <div className="mt-3.5">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="flex items-center gap-2.5 border-t border-white/10 py-3 last:border-b"
            >
              <Block className="size-2.5 shrink-0 rounded-full" />
              <Block className="h-3.5 w-full max-w-[150px] flex-1" />
              <Block className="h-3.5 w-8 shrink-0" />
              <Block className="h-3.5 w-11 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VerdictListSkeleton() {
  return (
    <div className="flex flex-col rounded-level-2 bg-black-2 py-6">
      <div className="px-4 pb-2 md:px-6">
        <Block className="h-6 w-48" />
      </div>
      <div className="space-y-1 px-4 py-2 md:px-6">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center gap-2 px-2 py-2">
            <Block className="h-4 w-6 shrink-0" />
            <Block className="h-4 min-w-0 flex-1" />
            <Block className="ml-2 h-4 w-14 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

function IndustryPieSkeleton() {
  return (
    <section className="rounded-level-2 bg-black-2 p-6 md:p-7">
      <Block className="h-6 w-64 md:h-7" />
      <div className="mt-2 space-y-2">
        <Block className="h-4 w-full max-w-[560px]" />
        <Block className="h-4 w-2/3 max-w-[380px]" />
      </div>

      <div className="mt-6 grid items-center gap-8 md:gap-16 lg:grid-cols-2">
        <div>
          <Block className="mx-auto size-[400px] max-w-full rounded-full" />
          <div className="mt-6 max-w-[270px]">
            <Block className="h-2.5 w-full rounded-sm" />
            <div className="mt-1.5 flex justify-between">
              <Block className="h-3 w-20" />
              <Block className="h-3 w-20" />
            </div>
          </div>
        </div>

        <div className="grid gap-y-3">
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Block className="size-3 shrink-0 rounded-full" />
              <Block className="h-3.5 min-w-0 flex-1" />
              <Block className="h-3.5 w-10 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompaniesTableSkeleton() {
  return (
    <section className="rounded-level-2 bg-black-2 p-5 md:p-7">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Block className="h-6 w-56 md:h-7" />
          <Block className="h-4 w-full max-w-[460px]" />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Block className="h-10 w-60 rounded-full" />
          <Block className="size-8 shrink-0 rounded-full" />
        </div>
      </div>

      <Block className="mt-5 h-10 w-full rounded-full" />

      <div className="mt-4 space-y-1">
        <div className="flex items-center gap-4 border-b border-white/10 py-3">
          <Block className="h-3 w-6 shrink-0" />
          <Block className="h-3 w-28" />
          <Block className="hidden h-3 w-24 md:block" />
          <div className="flex-1" />
          <Block className="hidden h-3 w-20 shrink-0 sm:block" />
          <Block className="h-3 w-16 shrink-0" />
          <Block className="h-3 w-16 shrink-0" />
        </div>

        {Array.from({ length: 12 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-white/5 py-3"
          >
            <Block className="h-3 w-6 shrink-0" />
            <Block className="size-7 shrink-0 rounded-full" />
            <Block className="h-4 w-32 max-w-[35%] flex-1" />
            <Block className="hidden h-3.5 w-24 shrink-0 md:block" />
            <Block className="hidden h-3.5 w-20 shrink-0 sm:block" />
            <Block className="h-3.5 w-14 shrink-0" />
            <Block className="h-5 w-16 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Mirrors the Paris overview layout so the page does not jump once data lands. */
export function CompaniesOverviewSkeleton() {
  const { t } = useTranslation();

  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">
        {t("companiesOverviewPage.paris.loading")}
      </span>

      <div className="space-y-8 md:space-y-10" aria-hidden="true">
        <HeaderSkeleton />
        <ChipFilterSkeleton />
        <AnswerCardSkeleton />

        <div className="grid items-start gap-6 md:grid-cols-2">
          <VerdictListSkeleton />
          <VerdictListSkeleton />
        </div>

        <IndustryPieSkeleton />
        <CompaniesTableSkeleton />
      </div>
    </div>
  );
}
