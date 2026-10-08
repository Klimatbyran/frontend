import { LocalizedLink } from "@/components/LocalizedLink";
import { useChartMotion } from "@/hooks/useChartMotion";
import { getCompanyDetailPath } from "@/utils/companyRouting";

function calcBarWidth(
  showBars: boolean,
  numVal: number | null,
  absMax: number,
): number {
  if (!showBars || numVal === null || absMax <= 0) return 0;
  return Math.min(100, (Math.abs(numVal) / absMax) * 100);
}

function getEntityKey<T>(
  entity: T,
  entityType: string,
  nameKey: keyof T,
): string {
  const name = String(entity[nameKey]);

  if (entityType === "companies") {
    const company = entity as { id?: string; wikidataId?: string | null };
    return company.id ?? company.wikidataId ?? name;
  }

  return name;
}

interface InsightsListProps<T> {
  title: string;
  /** What the value next to each name means, shown under the title. */
  description?: string;
  entities: T[];
  dataPointKey: keyof T;
  unit: string;
  totalCount: number;
  isBottomRanking?: boolean;
  nullValues?: string;
  entityType: string;
  nameKey: keyof T;
  showBars?: boolean;
  colorItem: (item: T) => string;
}

function InsightsList<T>({
  title,
  description,
  entities,
  dataPointKey,
  unit,
  totalCount,
  isBottomRanking = false,
  nullValues,
  entityType,
  nameKey,
  showBars = false,
  colorItem,
}: InsightsListProps<T>) {
  const { reduceMotion, barDuration, ease } = useChartMotion();
  const rowFadeMs = reduceMotion ? 0 : 350;
  const rowStaggerMs = reduceMotion ? 0 : 35;
  const barTransitionMs = reduceMotion ? 0 : barDuration * 1000;
  const barStaggerMs = reduceMotion ? 0 : 40;
  const barEase = `cubic-bezier(${ease.join(", ")})`;

  const numericValues = entities
    .map((e) => e[dataPointKey])
    .filter((v): v is number => typeof v === "number" && !isNaN(v));
  const absMax = numericValues.length
    ? Math.max(...numericValues.map(Math.abs))
    : 1;

  return (
    <div className="flex flex-col bg-black-2 rounded-level-2 py-6">
      <h3
        className={`text-white text-lg font-semibold px-4 md:px-6 ${
          description ? "pb-1" : "pb-2"
        }`}
      >
        {title}
      </h3>
      {description && (
        <p className="px-4 md:px-6 pb-2 text-sm font-normal leading-snug text-white/60">
          {description}
        </p>
      )}
      <div className="space-y-1 h-full px-4 md:px-6 py-2">
        {entities.map((entity, index) => {
          const position = isBottomRanking ? totalCount - index : index + 1;
          const name = String(entity[nameKey]);
          const entityKey = getEntityKey(entity, entityType, nameKey);
          const rawValue = entity[dataPointKey];
          const numVal =
            typeof rawValue === "number" && !isNaN(rawValue) ? rawValue : null;
          const barWidth = calcBarWidth(showBars, numVal, absMax);
          const color = colorItem(entity);

          const content = (
            <div
              className="relative overflow-hidden group"
              style={
                rowFadeMs
                  ? {
                      animation: `fadeSlideIn ${rowFadeMs}ms ease-out both`,
                      animationDelay: `${index * rowStaggerMs}ms`,
                    }
                  : undefined
              }
            >
              {showBars && barWidth > 0 && (
                <div
                  className="absolute inset-y-0 left-0 rounded-lg opacity-20 group-hover:opacity-30"
                  style={{
                    ["--insights-bar-width" as string]: `${barWidth}%`,
                    backgroundColor: color ?? "currentColor",
                    ...(barTransitionMs
                      ? {
                          animation: `barGrowFromLeft ${barTransitionMs}ms ${barEase} both`,
                          animationDelay: `${index * barStaggerMs}ms`,
                        }
                      : { width: `${barWidth}%` }),
                    transition: "opacity 0.3s ease",
                  }}
                />
              )}
              <div className="relative flex items-center justify-between px-2 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-orange-2 font-mono text-sm w-6 shrink-0 text-right">
                    {position}
                  </span>
                  <span className="text-sm truncate">{name}</span>
                </div>
                <span
                  className={`font-semibold text-sm ml-2 shrink-0`}
                  style={{
                    color: color,
                  }}
                >
                  {numVal !== null
                    ? numVal.toFixed(1) + unit
                    : (nullValues ?? "–")}
                </span>
              </div>
            </div>
          );

          if (entityType === "municipalities" || entityType === "regions") {
            return (
              <LocalizedLink
                key={entityKey}
                to={`/${entityType}/${name.toLowerCase()}`}
                className="block transition-colors hover:bg-white/5 rounded-lg"
              >
                {content}
              </LocalizedLink>
            );
          }

          if (entityType === "companies") {
            const company = entity as {
              id: string;
              wikidataId?: string | null;
            };
            if (company.id) {
              return (
                <LocalizedLink
                  key={entityKey}
                  to={getCompanyDetailPath(company)}
                  className="block transition-colors hover:bg-white/5 rounded-lg"
                >
                  {content}
                </LocalizedLink>
              );
            }
          }

          return (
            <div
              key={entityKey}
              className="block transition-colors hover:bg-white/5 rounded-lg"
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InsightsList;
