export const dataGuideFeatureFlagEnabled = () => {
  return true;
};

export const exploreButtonFeatureFlagEnabled = () => {
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
