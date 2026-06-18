export interface EmissionsIntensityDataPoint {
  year: number;
  total?: number;
  turnover?: number;
  turnoverCurrency?: string;
  /** Tons CO₂e per million currency units */
  intensity?: number;
  emissionsIsAIGenerated?: boolean;
  turnoverIsAIGenerated?: boolean;
  /** Indexed to 100 in the first year with both emissions and turnover */
  emissionsIndex?: number;
  turnoverIndex?: number;
  intensityChangeFromFirstYear?: number;
  intensityChangeFromPreviousYear?: number;
}

export type EmissionsIntensityView = "intensity" | "growth";

export interface EmissionsIntensitySummary {
  firstYear: number;
  latestYear: number;
  latestIntensity: number;
  firstIntensity: number;
  changeFromFirstYearPercent: number;
  trend: "improving" | "worsening" | "stable";
  turnoverCurrency?: string;
}
