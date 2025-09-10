import { LocalizedLink } from "@/components/LocalizedLink";
import type { paths } from "@/lib/api-types";

// Use the Municipality type from the API
type Municipality = NonNullable<
  paths["/municipalities/"]["get"]["responses"][200]["content"]["application/json"]
>[0];

interface InsightsListProps {
  title: string;
  municipalities: Municipality[];
  dataPointKey: keyof Municipality;
  unit: string;
  textColor: string;
  totalCount: number;
  isBottomRanking?: boolean;
  nullValues?: string;
}

function InsightsList({
  title,
  municipalities,
  dataPointKey,
  unit,
  textColor,
  totalCount,
  isBottomRanking = false,
  nullValues,
}: InsightsListProps) {
  return (
    <div className="bg-white/10 rounded-level-2 p-4 md:p-6">
      <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
      {municipalities.map((municipality, index) => {
        const position = isBottomRanking ? totalCount - index : index + 1;

        return (
          <LocalizedLink
            key={municipality.name}
            to={`/municipalities/${municipality.name}`}
            className="block transition-colors hover:bg-white/5 rounded-lg"
          >
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <span className="text-orange-2">{position}</span>
                <span>{municipality.name}</span>
              </div>
              <span className={`${textColor} font-semibold`}>
                {municipality[dataPointKey] != null
                  ? (municipality[dataPointKey] as number).toFixed(1) + unit
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
