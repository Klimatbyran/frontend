/**
 * UI validation helper for edit fields: determines if a value is changed, whether verification badge should be enabled,
 * and what color the badge should be.
 */
export function validateValue({
  value,
  originalValue,
  originalVerified,
  verified,
}: {
  value: string | number;
  originalValue: string | number;
  originalVerified: boolean;
  verified: boolean;
}): [boolean, string] {
  const valueChanged = String(value) !== String(originalValue);
  let badgeIconClass = "";
  if (originalVerified && !valueChanged) {
    badgeIconClass = "text-green-4";
  } else if (verified && valueChanged) {
    badgeIconClass = "text-green-3";
  }
  const isDisabled = originalVerified && !valueChanged;
  return [isDisabled, badgeIconClass];
}
