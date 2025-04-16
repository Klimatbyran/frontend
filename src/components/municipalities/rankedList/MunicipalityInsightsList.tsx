import { Municipality } from "@/types/municipality";

interface InsightsListProps {
  title: string;
  municipalities: Municipality[];
  dataPointKey: keyof Municipality;
  unit: string;
  textColor: string;
}

function InsightsList({
  title,
  municipalities,
  dataPointKey,
  unit,
  textColor,
}: InsightsListProps) {
  return (
    <div className="bg-white/10 rounded-level-2 p-4 md:p-6">
      <h3 className="text-white text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-2">
        {municipalities.map((municipality, index) => (
          <div
            key={municipality.name}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-orange-2">{index + 1}</span>
              <span>{municipality.name}</span>
            </div>
            <span className={`${textColor} font-semibold`}>
              {(municipality[dataPointKey] as number).toFixed(1)}
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InsightsList;
