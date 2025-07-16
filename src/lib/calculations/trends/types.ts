// TODO: MIGRATION - This is the standardized data format for all trend/statistics functions
// Legacy code may use { x, y } or { year, total } formats - these should be migrated
export interface DataPoint {
  year: number;
  value: number;
}
