import type { TFunction } from "i18next";
import type { DetailStat } from "@/components/detail/DetailHeader";

export interface MeetsParisDisplay {
  value: string;
  valueClassName: string;
  caption: string;
}

export function getMeetsParisDisplay(
  meetsParis: boolean | null,
  t: TFunction,
): MeetsParisDisplay {
  if (meetsParis === true) {
    return {
      value: t("yes"),
      valueClassName: "text-green-3",
      caption: t("detailPage.meetsParisOnTrack"),
    };
  }

  if (meetsParis === false) {
    return {
      value: t("no"),
      valueClassName: "text-pink-3",
      caption: t("detailPage.meetsParisOffTrack"),
    };
  }

  return {
    value: t("unknown"),
    valueClassName: "text-grey",
    caption: t("detailPage.meetsParisUnknown"),
  };
}

export function createMeetsParisStat(
  meetsParis: boolean | null,
  t: TFunction,
): DetailStat {
  return {
    label: t("detailPage.meetsParisGoal"),
    ...getMeetsParisDisplay(meetsParis, t),
  };
}
