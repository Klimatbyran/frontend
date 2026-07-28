import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isChunkLoadError,
  registerChunkLoadRecovery,
  reloadForStaleChunks,
} from "./chunkLoadRecovery";

describe("chunkLoadRecovery", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubGlobal("location", { reload: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detects vite dynamic import failures", () => {
    expect(
      isChunkLoadError(
        "Failed to fetch dynamically imported module: https://stage.klimatkollen.se/assets/RegionalOverviewPage-BklbI-0Y.js",
      ),
    ).toBe(true);
    expect(isChunkLoadError("Network request failed")).toBe(false);
  });

  it("reloads only once per session", () => {
    reloadForStaleChunks();
    reloadForStaleChunks();

    expect(window.location.reload).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem("klimatkollen:chunk-reload")).toBe("1");
  });

  it("handles vite:preloadError", () => {
    registerChunkLoadRecovery();

    window.dispatchEvent(new Event("vite:preloadError"));

    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });

  it("handles unhandled chunk load rejections", () => {
    registerChunkLoadRecovery();

    const event = new Event("unhandledrejection") as Event & {
      reason: Error;
      preventDefault: () => void;
    };
    event.reason = new Error("Loading chunk 12 failed.");
    event.preventDefault = vi.fn();

    window.dispatchEvent(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });
});
