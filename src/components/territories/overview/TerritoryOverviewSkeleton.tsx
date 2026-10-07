import { useTranslation } from "react-i18next";

const SHIMMER = "animate-pulse rounded bg-white/10";

function Block({ className = "" }: { className?: string }) {
  return <div className={`${SHIMMER} ${className}`} />;
}

/** Mirrors the territory story so the page does not jump once the map arrives. */
export function TerritoryOverviewSkeleton({
  storyKey,
  showPlans = false,
}: {
  storyKey: string;
  showPlans?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">{t(`${storyKey}.loading`)}</span>
      <div className="space-y-8 md:space-y-10" aria-hidden="true">
        <div className="space-y-5 md:space-y-7">
          <div className="space-y-3">
            <Block className="h-9 w-3/4 max-w-[560px] md:h-11" />
            <Block className="h-4 w-full max-w-[600px]" />
            <Block className="h-4 w-2/3 max-w-[420px]" />
          </div>
          <div className="flex max-w-[640px] items-center justify-between gap-4 rounded-2xl bg-black-2 px-5 py-4">
            <Block className="h-4 w-64" />
            <Block className="size-4 shrink-0" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Block className="mr-1 h-2.5 w-14" />
            <Block className="h-7 w-28 rounded-full" />
            <Block className="h-7 w-32 rounded-full" />
          </div>
          <section className="grid overflow-hidden rounded-level-2 bg-black-2 lg:h-[680px] lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.85fr)]">
            <Block className="h-[min(70vh,620px)] min-h-[440px] rounded-none lg:h-full" />
            <div className="px-6 py-8 md:px-10 md:py-9">
              <Block className="h-3 w-36" />
              <Block className="mb-3 mt-3.5 h-[56px] w-[180px] md:h-[80px] md:w-[240px]" />
              <Block className="h-6 w-full max-w-[420px]" />
              <Block className="mt-2 h-6 w-4/5 max-w-[320px]" />
              <Block className="mt-4 h-4 w-full" />
              <div className="mt-3.5">
                {Array.from({ length: 2 }, (_, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2.5 border-t border-white/10 py-3 last:border-b"
                  >
                    <Block className="size-2.5 shrink-0 rounded-full" />
                    <Block className="h-3.5 flex-1" />
                    <Block className="h-3.5 w-8" />
                    <Block className="h-3.5 w-11" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <Block className="h-6 w-64" />
          <Block className="h-4 w-full max-w-[560px]" />
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }, (_, card) => (
              <div
                key={card}
                className="rounded-level-2 bg-black-2 px-4 py-6 md:px-6"
              >
                <Block className="mb-4 h-6 w-40" />
                {Array.from({ length: 5 }, (_, row) => (
                  <Block key={row} className="mb-2 h-8 w-full" />
                ))}
              </div>
            ))}
          </div>
        </div>

        {showPlans && (
          <section className="rounded-level-2 bg-black-2 p-6 md:p-7">
            <Block className="h-6 w-72" />
            <Block className="mt-2 h-4 w-full max-w-[520px]" />
            <Block className="mt-6 h-4 w-full rounded-full" />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Block className="h-9 w-16" />
                <Block className="mt-2 h-4 w-44" />
              </div>
              <div>
                <Block className="h-9 w-16" />
                <Block className="mt-2 h-4 w-40" />
              </div>
            </div>
          </section>
        )}

        <section className="rounded-level-2 bg-black-2 p-5 md:p-7">
          <Block className="h-6 w-48" />
          <Block className="mt-2 h-4 w-full max-w-[480px]" />
          <Block className="mt-5 h-10 w-full rounded-full" />
          {Array.from({ length: 8 }, (_, index) => (
            <Block key={index} className="mt-3 h-10 w-full" />
          ))}
        </section>
      </div>
    </div>
  );
}
