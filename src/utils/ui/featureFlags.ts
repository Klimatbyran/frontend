export const dataGuideFeatureFlagEnabled = () => {
  return true;
};

/** Public path for Sweden's emissions story. */
export const nationPublicPath = () => "/nation";

export const stagingFeatureFlagEnabled = (hostname?: string) => {
  const host =
    hostname ?? (typeof window !== "undefined" ? window.location.hostname : "");

  return host === "localhost" || host === "127.0.0.1" || host.includes("stage");
};
