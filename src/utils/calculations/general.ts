/**
 * Calculates the rate of change between two values. If either of the values or undefined
 * or the previous value is zero, null is returned.
 *
 * @param selected The selected value.
 * @param previous The previous value.
 * @returns The rate of change as a percentage or null.
 */
export const calculateRateOfChange = (selected?: number, previous?: number) => {
  return previous && selected ? (selected - previous) / previous : null;
};

export const SWEDISH_EMISSIONS_2024 = 44.2; // mtCO2e
