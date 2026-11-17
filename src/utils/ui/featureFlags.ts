export const dataGuideFeatureFlagEnabled = () => {
  return true;
};

/** Public path for Sweden's emissions story. */
export const nationPublicPath = () => "/nation";

export const stagingFeatureFlagEnabled = () => {
  // Check if we're running on localhost or stage
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname.includes("stage"))
  ) {
    return true;
  }

  // For production, return false
  return false;
};
