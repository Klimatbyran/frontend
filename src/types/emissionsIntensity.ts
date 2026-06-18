export interface EmissionsIntensityDataPoint {
  year: number;
  total?: number;
  turnover?: number;
  turnoverCurrency?: string;
  /** Tons CO₂e per million currency units */
  intensity?: number;
  emissionsIsAIGenerated?: boolean;
  turnoverIsAIGenerated?: boolean;
  intensityChangeFromFirstYear?: number;
  intensityChangeFromPreviousYear?: number;
}

export interface EmissionsIntensitySummary {
  firstYear: number;
  latestYear: number;
  latestIntensity: number;
  firstIntensity: number;
  changeFromFirstYearPercent: number;
  trend: "improving" | "worsening" | "stable";
  turnoverCurrency?: string;
}
