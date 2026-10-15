import { describe, expect, it } from "vitest";
import { compareParisTrack } from "./parisTrackSort";

const statuses: Array<boolean | null> = [null, false, true, null, true, false];

function ordered(direction: "asc" | "desc"): Array<boolean | null> {
  return [...statuses].sort((a, b) => compareParisTrack(a, b, direction));
}

describe("compareParisTrack", () => {
  it("puts on track, then off track, then no data when sorting descending", () => {
    expect(ordered("desc")).toEqual([true, true, false, false, null, null]);
  });

  it("puts off track, then on track, then no data when sorting ascending", () => {
    expect(ordered("asc")).toEqual([false, false, true, true, null, null]);
  });
});
