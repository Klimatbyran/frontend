export const dataGuideFeatureFlagEnabled = () => {
  return ["localhost", "stage"].some((enabledHost) =>
    window.location.hostname.includes(enabledHost),
  );
};
