import { LocalizedLink } from "@/components/LocalizedLink";
import { getCompanyDetailPath } from "@/utils/companyRouting";
import { color } from "framer-motion";

function calcBarWidth(
  showBars: boolean,
  numVal: number | null,
  absMax: number,
): number {
  if (!showBars || numVal === null || absMax <= 0) return 0;
  return Math.min(100, (Math.abs(numVal) / absMax) * 100);
}

interface InsightsListProps<T> {
  title: string;
  entities: T[];
  dataPointKey: keyof T;
  unit: string;
  textColor: string;
  barColor?: string;
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
  const numericValues = entities
    .map((e) => e[dataPointKey])
    .filter((v): v is number => typeof v === "number" && !isNaN(v));
  const absMax = numericValues.length
    ? Math.max(...numericValues.map(Math.abs))
    : 1;

  return (
    <div className="bg-white/10 rounded-level-2 p-4 md:p-6 h-full">
      <h3 className="text-white text-lg font-semibold mb-3">{title}</h3>
      <div className="space-y-1">
        {entities.map((entity, index) => {
          const position = isBottomRanking ? totalCount - index : index + 1;
          const name = String(entity[nameKey]);
          const rawValue = entity[dataPointKey];
          const numVal =
            typeof rawValue === "number" && !isNaN(rawValue) ? rawValue : null;
          const barWidth = calcBarWidth(showBars, numVal, absMax);
          const color = colorItem(entity);

          const content = (
            <div
              className="relative rounded-lg overflow-hidden group"
              style={{
                animation: `fadeSlideIn 0.35s ease-out both`,
                animationDelay: `${index * 35}ms`,
              }}
            >
              {showBars && barWidth > 0 && (
                <div
                  className="absolute inset-y-0 left-0 rounded-lg opacity-20 group-hover:opacity-30"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: color ?? "currentColor",
                    transition: `width 0.6s ease-out ${index * 40}ms, opacity 0.3s ease`,
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
                key={name}
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
                  key={name}
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
              key={name}
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
