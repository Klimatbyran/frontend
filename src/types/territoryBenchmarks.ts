export type TerritoryBenchmarkEntityType = "municipality" | "region" | "nation";

export interface BenchmarkMetricDefinition {
  key: string;
  label: string;
  unit: string;
  higherIsBetter: boolean;
  description: string;
}

export interface BenchmarkReference {
  id: string;
  label: string;
  value: number | null;
  colorClass: string;
  isHighlighted?: boolean;
}

export interface BenchmarkDistributionItem {
  id: string;
  name: string;
  value: number;
  isCurrentEntity: boolean;
}

export interface TerritoryBenchmarkData {
  metric: BenchmarkMetricDefinition;
  entityValue: number | null;
  references: BenchmarkReference[];
  distribution: BenchmarkDistributionItem[];
  rank: number | null;
  totalPeers: number;
  percentile: number | null;
  diffFromPeerAverage: number | null;
  peerAverage: number | null;
  loading: boolean;
}
