import { describe, expect, it } from "vitest";
import { isInfiniteListRefreshing } from "./usePagesInfiniteList";

describe("isInfiniteListRefreshing", () => {
  it("is true while refetching the first page", () => {
    expect(isInfiniteListRefreshing(true, false)).toBe(true);
  });

  it("is false while loading the next page", () => {
    expect(isInfiniteListRefreshing(true, true)).toBe(false);
  });

  it("is false when idle", () => {
    expect(isInfiniteListRefreshing(false, false)).toBe(false);
  });
});
