// Common chart data types
export interface ChartDataPoint {
  year: number;
  [key: string]: any;
}

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
    tickFormatter?: (value: any) => string;
  };
  yAxis?: {
    tickFormatter?: (value: any) => string;
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
  onDataPointClick?: (data: any) => void;
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
