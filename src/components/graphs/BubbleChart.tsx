import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
} from "recharts";

interface BubbleChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
}

export function BubbleChart({ data }: BubbleChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value));

  const transformedData = data.map((item, index) => ({
    x: index * 2 + 2,
    y: item.value,
    z: item.value,
    label: item.label,
    color: item.color,
    value: item.value,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black-1 px-3 py-2 rounded-level-2 text-sm">
          <p className="text-white">{`${data.label}: ${data.value}%`}</p>
        </div>
      );
    }
    return null;
  };

  const getColor = (colorKey: string) => {
    const [palette, shade] = colorKey.split(".");
    return `var(--${palette}-${shade})`;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart margin={{ top: 40, right: 40, bottom: 40, left: 40 }}>
        <XAxis type="number" dataKey="x" domain={[0, 10]} hide />
        <YAxis type="number" dataKey="y" domain={[0, maxValue * 1.2]} hide />
        <ZAxis type="number" dataKey="z" range={[60, 400]} scale="sqrt" />
        {transformedData.map((item, index) => (
          <Scatter
            key={index}
            name={item.label}
            data={[item]}
            fill={getColor(item.color)}
          >
            <text
              x={item.x * 50}
              y={400 - item.y * (300 / maxValue)}
              fill="#878787"
              fontSize={12}
              textAnchor="middle"
              dy={-20}
            >
              {`${item.value}%`}
            </text>
          </Scatter>
        ))}
        <Tooltip content={<CustomTooltip />} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
