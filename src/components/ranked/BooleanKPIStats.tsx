interface BooleanKPIStatsProps {
  trueCount: number;
  falseCount: number;
  nullCount: number;
  totalCount: number;
  trueLabel: string;
  falseLabel: string;
  nullLabel: string;
}

export function BooleanKPIStats({
  trueCount,
  falseCount,
  nullCount,
  totalCount,
  trueLabel,
  falseLabel,
  nullLabel,
}: BooleanKPIStatsProps) {
  const truePercentage = ((trueCount / totalCount) * 100).toFixed(1);
  const falsePercentage = ((falseCount / totalCount) * 100).toFixed(1);
  const nullPercentage = ((nullCount / totalCount) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="relative h-12 bg-black-3 rounded-xl overflow-hidden flex">
        {trueCount > 0 && (
          <div
            className="bg-blue-3/30 border-r border-blue-3/50 flex items-center justify-center transition-all hover:bg-blue-3/40"
            style={{ width: `${truePercentage}%` }}
            title={`${trueLabel}: ${trueCount} (${truePercentage}%)`}
          >
            <span className="text-blue-3 text-xs font-medium">
              {parseFloat(truePercentage) > 10 && `${truePercentage}%`}
            </span>
          </div>
        )}
        {falseCount > 0 && (
          <div
            className="bg-pink-3/30 border-r border-pink-3/50 flex items-center justify-center transition-all hover:bg-pink-3/40"
            style={{ width: `${falsePercentage}%` }}
            title={`${falseLabel}: ${falseCount} (${falsePercentage}%)`}
          >
            <span className="text-pink-3 text-xs font-medium">
              {parseFloat(falsePercentage) > 10 && `${falsePercentage}%`}
            </span>
          </div>
        )}
        {/* Unknown data */}
        {nullCount > 0 && (
          <div
            className="bg-white/10 flex items-center justify-center transition-all hover:bg-white/15"
            style={{ width: `${nullPercentage}%` }}
            title={`${nullLabel}: ${nullCount} (${nullPercentage}%)`}
          >
            <span className="text-white/50 text-xs font-medium">
              {parseFloat(nullPercentage) > 10 && `${nullPercentage}%`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
