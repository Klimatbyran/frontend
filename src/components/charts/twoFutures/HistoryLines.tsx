import { Line } from "recharts";
import { FUTURE_LINE_DASH } from "./TwoFuturesTooltip";

export function HistoryLines({
  historyName,
  estimatedName,
  showEstimated,
}: {
  historyName: string;
  estimatedName: string;
  showEstimated: boolean;
}) {
  return (
    <>
      <Line
        type="monotone"
        dataKey="history"
        stroke="#ffffff"
        strokeWidth={2.5}
        dot={false}
        activeDot={{ r: 5, fill: "#ffffff", strokeWidth: 0 }}
        connectNulls={false}
        isAnimationActive={false}
        name={historyName}
      />
      {showEstimated && (
        <Line
          type="monotone"
          dataKey="historyEstimated"
          stroke="#ffffff"
          strokeWidth={2.5}
          strokeDasharray={FUTURE_LINE_DASH}
          dot={false}
          connectNulls={false}
          isAnimationActive={false}
          name={estimatedName}
        />
      )}
    </>
  );
}
