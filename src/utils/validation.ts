/**
 * Validation utilities for emissions calculations
 *
 * This module provides consistent validation functions for all calculation modules.
 * It ensures type safety and provides clear error messages.
 */

/**
 * Validates input data arrays for calculation functions.
 * @throws {Error} When data is invalid (not array, empty, or has invalid years)
 */
export function validateInputData<
  T extends { year: number; total?: number | null | undefined },
>(data: T[], functionName: string): asserts data is T[] {
  if (!Array.isArray(data)) {
    throw new Error(`${functionName}: Input data must be an array`);
  }

  if (data.length === 0) {
    throw new Error(`${functionName}: Input data cannot be empty`);
  }

  for (const item of data) {
    if (typeof item !== "object" || item === null) {
      throw new Error(`${functionName}: Each data item must be an object`);
    }

    if (typeof item.year !== "number" || isNaN(item.year)) {
      throw new Error(
        `${functionName}: Each data item must have a valid numeric year`,
      );
    }
  }
}

/**
 * Validates year parameters for calculation functions.
 * @throws {Error} When year parameters are invalid
 */
export function validateYearParameters(
  year: number,
  currentYear: number,
  functionName: string,
): void {
  if (typeof year !== "number" || isNaN(year)) {
    throw new Error(`${functionName}: Year must be a valid number`);
  }

  if (typeof currentYear !== "number" || isNaN(currentYear)) {
    throw new Error(`${functionName}: Current year must be a valid number`);
  }
}

/**
 * Validates regression parameters for calculation functions.
 * @throws {Error} When regression parameters are invalid
 */
export function validateRegressionParameters(
  regression: { slope: number; intercept: number } | undefined,
  functionName: string,
): void {
  if (regression !== undefined) {
    if (typeof regression.slope !== "number" || isNaN(regression.slope)) {
      throw new Error(
        `${functionName}: Regression slope must be a valid number`,
      );
    }

    if (
      typeof regression.intercept !== "number" ||
      isNaN(regression.intercept)
    ) {
      throw new Error(
        `${functionName}: Regression intercept must be a valid number`,
      );
    }
  }
}

/**
 * Validates base year parameter for calculation functions.
 * @throws {Error} When base year is invalid
 */
export function validateBaseYear(
  baseYear: number | undefined,
  functionName: string,
): void {
  if (
    baseYear !== undefined &&
    (typeof baseYear !== "number" || isNaN(baseYear))
  ) {
    throw new Error(`${functionName}: Base year must be a valid number`);
  }
}

/**
 * Validates end year parameter for calculation functions.
 * @throws {Error} When end year is invalid
 */
export function validateEndYear(endYear: number, functionName: string): void {
  if (typeof endYear !== "number" || isNaN(endYear)) {
    throw new Error(`${functionName}: End year must be a valid number`);
  }
}

/**
 * Wraps a function with consistent error handling.
 * @param fn - The function to wrap
 * @param functionName - Name of the function for error messages
 * @returns The result of the function or null if an error occurs
 */
export function withErrorHandling<T>(
  fn: () => T,
  functionName: string,
): T | null {
  try {
    return fn();
  } catch (error) {
    console.error(`Error in ${functionName}:`, error);
    return null;
  }
}
