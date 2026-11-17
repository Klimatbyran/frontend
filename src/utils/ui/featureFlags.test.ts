import { describe, expect, it } from "vitest";
import { stagingFeatureFlagEnabled } from "./featureFlags";

describe("stagingFeatureFlagEnabled", () => {
  it("is off on the production host", () => {
    expect(stagingFeatureFlagEnabled("klimatkollen.se")).toBe(false);
    expect(stagingFeatureFlagEnabled("www.klimatkollen.se")).toBe(false);
  });

  it("is on for local development and stage", () => {
    expect(stagingFeatureFlagEnabled("localhost")).toBe(true);
    expect(stagingFeatureFlagEnabled("127.0.0.1")).toBe(true);
    expect(stagingFeatureFlagEnabled("stage.klimatkollen.se")).toBe(true);
  });
});
