// Common chart data types

export interface LegendItem {
  name: string;
  color: string;
  isHidden?: boolean;
  isClickable?: boolean;
  isDashed?: boolean;
  metadata?: {
    value?: number;
    percentage?: number;
    unit?: string;
    isAIGenerated?: boolean;
  };
}

export interface ChartConfig {
  height?: string | number;
  width?: string | number;
  className?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
}

export interface AxisConfig {
  xAxis?: {
    dataKey?: string;
    domain?: [number, number];
    ticks?: number[];
    padding?: { left: number; right: number };
    // tickFormatter receives numeric values (years for x-axis, emissions for y-axis)
    tickFormatter?: (value: number) => string;
  };
  yAxis?: {
    // tickFormatter receives numeric values (emissions values)
    tickFormatter?: (value: number) => string;
    width?: number;
    domain?: [number, number];
    padding?: { top: number; bottom: number };
  };
}

export interface ReferenceLineConfig {
  x?: number;
  y?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  label?: {
    value: string | number;
    position?: "top" | "bottom" | "left" | "right";
    fill?: string;
    fontSize?: number;
    fontWeight?: "normal" | "bold";
  };
}

// Chart view types
export type ChartView = "overview" | "sectors" | "scopes" | "categories";

// Chart interaction types
export interface ChartInteractionHandlers {
  onItemToggle?: (itemName: string) => void;
  onYearSelect?: (year: string) => void;
  // onDataPointClick receives chart data point objects (ChartData or similar)
  // Using unknown is safer than any - requires type checking before use
  onDataPointClick?: (data: unknown) => void;
}

// Chart styling types
export interface ChartStyling {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
    grid?: string;
  };
  lineStyles?: {
    strokeWidth?: number;
    strokeDasharray?: string;
    dotRadius?: number;
  };
}

// Sector emissions chart types
export interface SectorInfo {
  color: string;
  translatedName: string;
}
