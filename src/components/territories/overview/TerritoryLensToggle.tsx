import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { StoryLens } from "@/utils/territories/territoryOverviewStory";

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] transition-colors",
        active
          ? "border-blue-3/60 bg-blue-5/40 text-blue-2"
          : "border-white/10 bg-black-1 text-white/80 hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );
}

/** Two ways to read the same map, rather than a row of indicators. */
export function TerritoryLensToggle({
  storyKey,
  lens,
  onChange,
}: {
  storyKey: string;
  lens: StoryLens;
  onChange: (lens: StoryLens) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-[10px] uppercase tracking-[0.06em] text-white/40">
        {t(`${storyKey}.lensLabel`)}
      </span>
      <Chip active={lens === "paris"} onClick={() => onChange("paris")}>
        {t(`${storyKey}.lensParis`)}
      </Chip>
      <Chip active={lens === "pace"} onClick={() => onChange("pace")}>
        {t(`${storyKey}.lensPace`)}
      </Chip>
    </div>
  );
}
