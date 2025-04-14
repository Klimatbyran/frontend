import { useEffect, useState } from "react";
import { DonutChart } from "./DonutChart";
import { BubbleChart } from "./BubbleChart";
import { BarChart } from "./BarChart";
import { StatCard } from "./StatCard";
import {
  getEmissionsBySector,
  getCO2Level,
  getSeaLevel,
  getArcticIce,
} from "@/lib/api";

interface EmissionData {
  value: number;
  unit: string;
  sector: string;
  year: number;
}

export function ChartDemo() {
  const [emissions, setEmissions] = useState<EmissionData[]>([]);
  const [co2Level, setCO2Level] = useState<{ value: number; date: string }>();
  const [seaLevel, setSeaLevel] = useState<{ value: number; year: number }>();
  const [arcticIce, setArcticIce] = useState<{ value: number; year: number }>();

  useEffect(() => {
    async function fetchData() {
      try {
        const [emissionsData, co2Data, seaData, iceData] = await Promise.all([
          getEmissionsBySector(),
          getCO2Level(),
          getSeaLevel(),
          getArcticIce(),
        ]);

        setEmissions(emissionsData);
        setCO2Level(co2Data);
        setSeaLevel(seaData);
        setArcticIce(iceData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    fetchData();
  }, []);

  const donutData = emissions.slice(0, 3).map((item, index) => ({
    label: item.sector,
    value: item.value,
    color: `orange.${index + 2}`,
  }));

  const bubbleData = emissions.map((item, index) => ({
    label: item.sector,
    value: item.value,
    color: `blue.${index + 1}`,
  }));

  const barData = emissions.slice(0, 4).map((item) => ({
    label: item.sector,
    value: item.value,
    color: "pink.3",
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-black-2 rounded-level-2 p-6">
        <h3 className="text-sm font-light text-grey mb-4">
          Förnybar energi fördelning
        </h3>
        <DonutChart data={donutData} />
      </div>

      <div className="bg-black-2 rounded-level-2 p-6">
        <h3 className="text-sm font-light text-grey mb-4">
          Utsläpp fördelat per sektor
        </h3>
        <BubbleChart data={bubbleData} />
      </div>

      <div className="bg-black-2 rounded-level-2 p-6">
        <h3 className="text-sm font-light text-grey mb-4">
          Utsläpp per sektor (CO₂)
        </h3>
        <BarChart data={barData} />
      </div>

      <StatCard
        title="Koldioxid"
        value={co2Level?.value.toFixed(1) || "415.7"}
        unit="ppm"
        subtext={`UPPMÄTT ${new Date(co2Level?.date || "").toLocaleDateString("sv-SE")}`}
        color="orange"
      />

      <StatCard
        title="Havet"
        value={`+${seaLevel?.value || 26}`}
        unit="cm"
        subtext={`HÖGRE ÄN ${seaLevel?.year || 1880}`}
        color="pink"
      />

      <StatCard
        title="Arktis havsis"
        value={`${arcticIce?.value || -38}`}
        unit="%"
        subtext={`SKILLNAD SEDAN ${arcticIce?.year || 1979}`}
        color="green"
      />
    </div>
  );
}
