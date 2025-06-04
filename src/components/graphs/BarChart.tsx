import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
}

export function BarChart({ data }: BarChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black-1 px-3 py-2 rounded-level-2 text-sm">
          <p className="text-white">{`${payload[0].payload.label}: ${payload[0].value}`}</p>
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
      <RechartsBarChart
        data={data}
        layout="vertical"
        barSize={24}
        margin={{ top: 20, right: 40, bottom: 20, left: 120 }}
      >
        <XAxis
          type="number"
          domain={[0, maxValue * 1.2]}
          scale="linear"
          padding={{ left: 0, right: 0 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--grey)", fontSize: 12 }}
          width={100}
          scale="band"
          padding={{ top: 0, bottom: 0 }}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "color-mix(in srgb, var(--grey) 10%, transparent)" }}
        />
        {data.map((item, index) => (
          <Bar
            key={index}
            dataKey="value"
            fill={getColor(item.color)}
            radius={[4, 4, 4, 4]}
            label={{
              position: "right",
              fill: "var(--grey)",
              fontSize: 12,
              formatter: (value: number) => `${value}`,
            }}
            background={{ fill: "rgba(255, 255, 255, 0.05)" }}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
