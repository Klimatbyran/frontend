import type { TFunction } from "i18next";
import { createMeetsParisStat, getMeetsParisDisplay } from "./meetsParisStat";

const t = ((key: string) => key) as TFunction;

describe("getMeetsParisDisplay", () => {
  it("describes an on-track result in plain language", () => {
    expect(getMeetsParisDisplay(true, t)).toEqual({
      value: "yes",
      valueClassName: "text-blue-3",
      caption: "detailPage.meetsParisOnTrack",
    });
  });

  it("describes an off-track result in plain language", () => {
    expect(getMeetsParisDisplay(false, t)).toEqual({
      value: "no",
      valueClassName: "text-pink-3",
      caption: "detailPage.meetsParisOffTrack",
    });
  });

  it("explains when there is not enough data", () => {
    expect(getMeetsParisDisplay(null, t)).toEqual({
      value: "unknown",
      valueClassName: "text-grey",
      caption: "detailPage.meetsParisUnknown",
    });
  });
});

describe("createMeetsParisStat", () => {
  it("uses the shared Paris question as the header label", () => {
    expect(createMeetsParisStat(true, t).label).toBe(
      "detailPage.meetsParisGoal",
    );
  });
});
