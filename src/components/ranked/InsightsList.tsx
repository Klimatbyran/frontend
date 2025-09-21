import { LocalizedLink } from "@/components/LocalizedLink";

interface InsightsListProps<T> {
  title: string;
  entities: T[];
  dataPointKey: keyof T;
  unit: string;
  textColor: string;
  totalCount: number;
  isBottomRanking?: boolean;
  nullValues?: string;
  entityType: string;
  nameKey: keyof T;
}

function InsightsList<T>({
  title,
  entities,
  dataPointKey,
  unit,
  textColor,
  totalCount,
  isBottomRanking = false,
  nullValues,
  entityType,
  nameKey,
}: InsightsListProps<T>) {
  return (
    <div className="bg-white/10 rounded-level-2 p-4 md:p-6">
      <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
      {entities.map((entity, index) => {
        const position = isBottomRanking ? totalCount - index : index + 1;
        const name = String(entity[nameKey]);

        return (
          <LocalizedLink
            key={name}
            to={`/${entityType}/${name}`}
            className="block transition-colors hover:bg-white/5 rounded-lg"
          >
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <span className="text-orange-2">{position}</span>
                <span>{name}</span>
              </div>
              <span className={`${textColor} font-semibold`}>
                {entity[dataPointKey] != null
                  ? (entity[dataPointKey] as number).toFixed(1) + unit
                  : nullValues}
              </span>
            </div>
          </LocalizedLink>
        );
      })}
    </div>
  );
}

export default InsightsList;
