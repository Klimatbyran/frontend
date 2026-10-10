import { cn } from "@/lib/utils";
import type { GuideTab, ScopeKey } from "./buildUnderstandingEmissionsModel";
import { SCOPE_COLORS } from "./buildUnderstandingEmissionsModel";

type NestedScopeRingsProps = {
  activeTab: GuideTab;
  scope1: number | null;
  scope2: number | null;
  scope3: number | null;
  centerLabel: string;
  centerValue: string;
  className?: string;
};

const RING_ORDER: ScopeKey[] = ["scope3", "scope2", "scope1"];

function ringRadius(scope: ScopeKey): number {
  if (scope === "scope3") return 84;
  if (scope === "scope2") return 58;
  return 32;
}

function ringThickness(scope: ScopeKey, value: number | null): number {
  if (value == null) return 6;
  if (scope === "scope3") return 14;
  if (scope === "scope2") return 12;
  return 10;
}

export function NestedScopeRings({
  activeTab,
  scope1,
  scope2,
  scope3,
  centerLabel,
  centerValue,
  className,
}: NestedScopeRingsProps) {
  const values: Record<ScopeKey, number | null> = {
    scope1,
    scope2,
    scope3,
  };

  return (
    <div
      className={cn(
        "relative mx-auto flex h-[240px] w-[240px] items-center justify-center",
        className,
      )}
    >
      <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
        {RING_ORDER.map((scope) => {
          const value = values[scope];
          const isActive = activeTab === "overview" || activeTab === scope;
          const isDimmed = activeTab !== "overview" && activeTab !== scope;
          const radius = ringRadius(scope);
          const thickness = ringThickness(scope, value);
          const missing = value == null;

          return (
            <circle
              key={scope}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={missing ? "var(--grey)" : SCOPE_COLORS[scope]}
              strokeWidth={thickness}
              strokeDasharray={missing ? "4 6" : undefined}
              opacity={missing ? 0.35 : isDimmed ? 0.25 : isActive ? 1 : 0.7}
              className="transition-opacity duration-300"
            />
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
        <p className="text-xs uppercase tracking-wide text-grey">
          {centerLabel}
        </p>
        <p className="mt-1 text-xl font-medium leading-tight text-white sm:text-2xl">
          {centerValue}
        </p>
      </div>
    </div>
  );
}
