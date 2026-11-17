import type { SectorEmissionsByYear } from "@/types/emissions";
import {
  formatEmissionsAbsolute,
  formatPercentChange,
  localizeUnit,
} from "@/utils/formatting/localization";

export type ClimatePlanMunicipality = {
  name: string;
  historicalEmissionChangePercent: number;
  electricCarChangePercent: number;
  climatePlanYear: number | null;
  bicycleMetrePerCapita: number;
  totalConsumptionEmission: number;
  electricVehiclePerChargePoints: number | null;
  procurementScore: number;
  emissions: ({ year: string | number; value: number } | null)[];
};

export type ClimatePlanStat = {
  label: string;
  value: string;
  unit?: string;
  caption?: string;
  valueClassName?: string;
};

export type ClimatePlanSectorShare = {
  label: string;
  share: number;
  color: string;
};

export type ClimatePlanFigures = {
  year: number | null;
  stats: ClimatePlanStat[];
  sectors: ClimatePlanSectorShare[];
  answers: Record<string, string>;
};

const SECTOR_PRESENTATION: Record<string, { label: string; color: string }> = {
  "Industri (energi + processer)": {
    label: "Industri",
    color: "var(--orange-2)",
  },
  "Produktanvändning (inkl. lösningsmedel)": {
    label: "Produktanvändning",
    color: "var(--orange-4)",
  },
  "Utrikes transporter": {
    label: "Utrikes transporter",
    color: "var(--green-2)",
  },
  Jordbruk: { label: "Jordbruk", color: "var(--green-4)" },
  "El och fjärrvärme": { label: "El och fjärrvärme", color: "var(--blue-2)" },
  Arbetsmaskiner: { label: "Arbetsmaskiner", color: "var(--blue-4)" },
  "Avfall (inkl.avlopp)": { label: "Avfall", color: "var(--pink-2)" },
  "Egen uppvärmning av bostäder och lokaler": {
    label: "Uppvärmning av byggnader",
    color: "var(--pink-4)",
  },
  Transporter: { label: "Transporter", color: "var(--orange-3)" },
};

function latestEmission(emissions: ClimatePlanMunicipality["emissions"]) {
  const points = emissions.filter(
    (point): point is { year: string | number; value: number } =>
      point != null && Number.isFinite(point.value),
  );
  points.sort((a, b) => Number(a.year) - Number(b.year));
  return points.at(-1) ?? null;
}

function signedNumber(value: number): string {
  return new Intl.NumberFormat("sv-SE", {
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(value);
}

function oneDecimal(value: number): string {
  return new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}

function procurementLabel(score: number): string {
  if (score === 2) return "Ja";
  if (score === 1) return "Kanske";
  return "Nej";
}

function sectorShares(
  sectorsByYear: SectorEmissionsByYear | undefined,
): ClimatePlanSectorShare[] {
  if (!sectorsByYear || typeof sectorsByYear !== "object") return [];
  const years = Object.keys(sectorsByYear)
    .map(Number)
    .filter((year) => Number.isFinite(year))
    .sort((a, b) => b - a);
  const year = years[0];
  if (year == null) return [];
  const entries = Object.entries(sectorsByYear[String(year)] ?? {}).filter(
    ([, value]) => Number.isFinite(value) && value > 0,
  );
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  if (total <= 0) return [];

  const shares = entries
    .map(([name, value]) => {
      const presentation = SECTOR_PRESENTATION[name];
      return {
        label: presentation?.label ?? name,
        color: presentation?.color ?? "var(--grey)",
        share: Math.round((value / total) * 100),
      };
    })
    .sort((a, b) => b.share - a.share);

  const drift = shares.reduce((sum, sector) => sum + sector.share, 0) - 100;
  if (shares[0] && drift !== 0) {
    shares[0] = { ...shares[0], share: shares[0].share - drift };
  }
  return shares.filter((sector) => sector.share > 0);
}

export function buildClimatePlanFigures(
  municipality: ClimatePlanMunicipality,
  sectorsByYear: SectorEmissionsByYear | undefined,
): ClimatePlanFigures {
  const latest = latestEmission(municipality.emissions);
  const year = latest ? Number(latest.year) : null;
  const increased = municipality.historicalEmissionChangePercent > 0;

  const stats: ClimatePlanStat[] = [
    {
      label: "Totala utsläpp",
      value: latest ? formatEmissionsAbsolute(latest.value, "sv") : "–",
      unit: "tCO₂e",
      caption: year ? `${year}, inom kommungränsen` : "Inom kommungränsen",
    },
    {
      label: "Förändring",
      value: formatPercentChange(
        municipality.historicalEmissionChangePercent,
        "sv",
      ),
      caption: "sedan 2015",
      valueClassName: increased ? "text-pink-3" : "text-orange-2",
    },
    {
      label: "Konsumtionsutsläpp per invånare",
      value: localizeUnit(municipality.totalConsumptionEmission, "sv") ?? "–",
      unit: "tCO₂e",
    },
  ];

  const answers: Record<string, string> = {
    "kpi-total": latest ? formatEmissionsAbsolute(latest.value, "sv") : "",
    "consumption-per-capita":
      localizeUnit(municipality.totalConsumptionEmission, "sv") ?? "",
    "kpi-ev-change": signedNumber(municipality.electricCarChangePercent),
    "kpi-charge-points":
      municipality.electricVehiclePerChargePoints == null
        ? "Saknar laddpunkter"
        : oneDecimal(municipality.electricVehiclePerChargePoints),
    "kpi-bike-paths": oneDecimal(municipality.bicycleMetrePerCapita),
    "kpi-climate-plan": municipality.climatePlanYear
      ? `Antagen ${municipality.climatePlanYear}`
      : "Saknar klimatplan",
    "kpi-procurement": procurementLabel(municipality.procurementScore),
  };

  return {
    year,
    stats,
    sectors: sectorShares(sectorsByYear),
    answers,
  };
}
