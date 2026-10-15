import { Line } from "recharts";
import type { TwoFuturesRow } from "@/components/territories/emissionsGraph/twoFuturesChartData";
import { FUTURE_LINE_DASH } from "./TwoFuturesTooltip";

const AI_MARK_WIDTH = 16;
const AI_MARK_HEIGHT = 12;

type HistoryDotProps = {
  cx?: number;
  cy?: number;
  value?: number | null;
  payload?: TwoFuturesRow;
};

/** Small AI badge drawn on reported years whose value was AI-extracted. */
function HistoryPointDot({ cx, cy, value, payload }: HistoryDotProps) {
  if (
    cx == null ||
    cy == null ||
    value == null ||
    !payload?.historyIsAIGenerated
  ) {
    return null;
  }

  return (
    <g>
      <title>AI</title>
      <rect
        x={cx - AI_MARK_WIDTH / 2}
        y={cy - AI_MARK_HEIGHT / 2}
        width={AI_MARK_WIDTH}
        height={AI_MARK_HEIGHT}
        rx={2}
        fill="#141414"
        stroke="#878787"
        strokeWidth={1}
      />
      <text
        x={cx}
        y={cy + 3}
        textAnchor="middle"
        fontSize={8}
        fontWeight={700}
        fill="#878787"
      >
        AI
      </text>
    </g>
  );
}

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
        dot={<HistoryPointDot />}
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
