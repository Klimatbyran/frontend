export interface DataPoint {
  year: number;
  value: number;
}

export interface MovingAverageResult {
  year: number;
  value: number;
  slope: number;
}

export interface TrendMethod {
  name: string;
  calculate: (data: DataPoint[]) => number;
  weight: number;
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  r2: number;
}
