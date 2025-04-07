import { Info } from "lucide-react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Text } from "@/components/ui/text";

interface EmissionsComparisonProps {
  emissions: number;
}

const COMPARISONS = [
  {
    name: "Genomsnittlig svensk",
    value: 4.2,
    unit: "ton CO₂e per år",
    description: "En genomsnittlig svensk släpper ut cirka 4,2 ton CO₂e per år",
    color: "#99CFFF", // blue-2
  },
  {
    name: "Sveriges totala utsläpp",
    value: 44400000,
    unit: "ton CO₂e per år",
    description:
      "Sveriges territoriella utsläpp är cirka 44,4 miljoner ton CO₂e per år",
    color: "#F48F2A", // orange-3
  },
  {
    name: "Bilkörning (10000 km)",
    value: 1.7,
    unit: "ton CO₂e",
    description:
      "En genomsnittlig bensinbil släpper ut cirka 170g CO₂e per kilometer",
    color: "#F0759A", // pink-3
  },
  {
    name: "Flygresor (10 timmar)",
    value: 2.5,
    unit: "ton CO₂e",
    description:
      "En genomsnittlig flygresa släpper ut cirka 250kg CO₂e per flygtimme",
    color: "#AAE506", // green-3
  },
];

export function EmissionsComparison({ emissions }: EmissionsComparisonProps) {
  // Transform data for the bubble chart
  const chartData = [
    // Company's emissions
    [
      {
        name: "Företagets utsläpp",
        value: emissions,
        description: `${Math.round(emissions).toLocaleString()} ton CO₂e`,
        color: "#FFFFFF",
        x: 50,
        y: 50,
      },
    ],
    // Add comparison values as separate series
    ...COMPARISONS.map((comparison, index) => [
      {
        name: comparison.name,
        value: comparison.value,
        description: `${comparison.value.toLocaleString()} ${comparison.unit}`,
        color: comparison.color,
        x: 50 + (index + 1) * 150,
        y: 50,
      },
    ]),
  ];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-black-1 px-4 py-3 rounded-level-2">
          <Text variant="small" className="text-grey">
            {data.name}
          </Text>
          <Text variant="large">{data.description}</Text>
          {data.value !== emissions && (
            <Text variant="small" className="text-grey">
              {data.value < emissions
                ? `${Math.round(emissions / data.value).toLocaleString()}× större än detta`
                : `${Math.round(data.value / emissions).toLocaleString()}× större än företagets utsläpp`}
            </Text>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 text-grey hover:text-white transition-colors">
          <Info className="w-4 h-4" />
          <span className="text-sm">Jämför storleken</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            Vad betyder {Math.round(emissions).toLocaleString()} ton CO₂e?
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-6">
          <Text className="text-grey">
            För att sätta utsläppen i perspektiv kan vi jämföra med några
            vardagliga exempel. Storleken på cirklarna representerar mängden
            utsläpp.
          </Text>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              >
                <XAxis type="number" dataKey="x" domain={[0, 800]} hide />
                <YAxis type="number" dataKey="y" domain={[0, 100]} hide />
                <ZAxis
                  type="number"
                  dataKey="value"
                  range={[400, 2000]}
                  scale="log"
                />
                <Tooltip content={<CustomTooltip />} />
                {chartData.map((data, index) => (
                  <Scatter
                    key={data[0].name}
                    name={data[0].name}
                    data={data}
                    fill={data[0].color}
                  >
                    <text
                      x={data[0].x}
                      y={data[0].y + 80}
                      textAnchor="middle"
                      fill="#878787"
                      fontSize={12}
                    >
                      {data[0].name}
                    </text>
                  </Scatter>
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <Text className="text-grey text-sm">
            Notera: Storleken på cirklarna är logaritmiskt skalade för att kunna
            visa både stora och små värden. Jämförelserna är förenklade och
            baserade på genomsnittliga värden.
          </Text>
        </div>
      </DialogContent>
    </Dialog>
  );
}
