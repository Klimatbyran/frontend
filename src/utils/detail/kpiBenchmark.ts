export type BenchmarkTone = "good" | "bad" | "neutral" | "unknown";

export type BenchmarkPeerGroup =
  | "municipalities"
  | "municipalitiesInRegion"
  | "regions"
  | "companies"
  | "companiesInIndustry"
  | "companiesInSector";

export type BenchmarkReference = "region" | "industry" | "sector" | "all";

export interface BenchmarkPhrase {
  key: string;
  percent?: number;
  peerGroup?: BenchmarkPeerGroup;
  reference?: BenchmarkReference;
}

export interface NumericBenchmarkView {
  kind: "numeric";
  tone: Exclude<BenchmarkTone, "unknown">;
  higherIsBetter: boolean | null;
  /** 0 = smallest, 1 = largest, in rank space. */
  position: number;
  averagePosition: number;
  overallAveragePosition: number | null;
  minLabel: string;
  maxLabel: string;
  averageLabel: string;
  overallAverageLabel: string | null;
  /** Which average the colour split and primary sentence use. */
  primaryReference: BenchmarkReference;
  primary: BenchmarkPhrase;
  secondary: BenchmarkPhrase | null;
}

export interface BooleanBenchmarkView {
  kind: "boolean";
  tone: BenchmarkTone;
  /** Share of decisive peers that are true, including this entity. */
  trueShare: number;
  higherIsBetter: boolean;
  peerGroup: BenchmarkPeerGroup;
  primary: BenchmarkPhrase;
  secondary: BenchmarkPhrase | null;
}

export type KpiBenchmarkView = NumericBenchmarkView | BooleanBenchmarkView;

export interface NumericBenchmarkInput {
  value: number;
  peers: number[];
  groupPeers?: number[];
  /**
   * true: higher is better. false: lower is better.
   * null: show where the number sits, without a good/bad judgment.
   */
  higherIsBetter: boolean | null;
  peerGroup: BenchmarkPeerGroup;
  groupPeerGroup?: BenchmarkPeerGroup;
  reference?: BenchmarkReference;
  minGroupSize?: number;
  format: (value: number) => string;
}

export interface BooleanBenchmarkInput {
  value: boolean | null;
  peers: Array<boolean | null | undefined>;
  groupPeers?: Array<boolean | null | undefined>;
  /** true when "yes" is the good outcome. */
  higherIsBetter: boolean;
  peerGroup: BenchmarkPeerGroup;
  groupPeerGroup?: BenchmarkPeerGroup;
  groupReference?: BenchmarkReference;
  minGroupSize?: number;
}

const EXTREME_SHARE = 0.8;
const SIMILAR_RANK_GAP = 0.05;
const MIN_FOR_EXTREME_WORDING = 5;

function finiteNumbers(values: number[]): number[] {
  return values.filter((value) => Number.isFinite(value));
}

/** Typical peer. A mean is pulled off by a few enormous values. */
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function excludeOne(values: number[], value: number): number[] {
  const index = values.findIndex((item) => item === value);
  if (index === -1) return values;
  return values.filter((_, itemIndex) => itemIndex !== index);
}

function percent(share: number): number {
  return Math.round(share * 100);
}

/** Rank position from 0 (smallest) to 1 (largest). */
export function rankPosition(value: number, values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  if (count <= 1) return 0.5;

  let below = 0;
  let equal = 0;
  for (const item of sorted) {
    if (item < value) below += 1;
    else if (item === value) equal += 1;
    else break;
  }

  if (equal > 0) {
    return (below + (equal - 1) / 2) / (count - 1);
  }
  if (below <= 0) return 0;
  if (below >= count) return 1;

  const lowerValue = sorted[below - 1];
  const upperValue = sorted[below];
  const span = upperValue - lowerValue;
  const fraction = span === 0 ? 0.5 : (value - lowerValue) / span;
  const lowerPos = (below - 1) / (count - 1);
  const upperPos = below / (count - 1);
  return lowerPos + fraction * (upperPos - lowerPos);
}

interface ShareSplit {
  /** Strictly better, or strictly higher when there is no good/bad direction. */
  favorable: number;
  unfavorable: number;
  equal: number;
  total: number;
}

function splitShares(
  value: number,
  others: number[],
  higherIsBetter: boolean | null,
): ShareSplit {
  let favorable = 0;
  let unfavorable = 0;
  let equal = 0;
  for (const other of others) {
    if (other === value) {
      equal += 1;
      continue;
    }
    const isFavorable =
      higherIsBetter === false ? value < other : value > other;
    if (isFavorable) favorable += 1;
    else unfavorable += 1;
  }
  return { favorable, unfavorable, equal, total: others.length };
}

type Relation = "better" | "worse" | "higher" | "lower" | "similar";

function relate(
  value: number,
  reference: number,
  valuePosition: number,
  referencePosition: number,
  higherIsBetter: boolean | null,
  span: number,
): Relation {
  const valueGap = Math.abs(value - reference);
  const epsilon = Math.max(Math.abs(span) * 0.02, Math.abs(reference) * 0.01);
  const rankGap = Math.abs(valuePosition - referencePosition);
  if (valueGap <= epsilon || rankGap <= SIMILAR_RANK_GAP) return "similar";

  const isHigher = value > reference;
  if (higherIsBetter === null) return isHigher ? "higher" : "lower";
  const isBetter = higherIsBetter ? isHigher : !isHigher;
  return isBetter ? "better" : "worse";
}

function directionalPrimary(
  relation: Relation,
  betterShare: number,
  othersCount: number,
  reference: BenchmarkReference,
): BenchmarkPhrase {
  if (
    othersCount >= MIN_FOR_EXTREME_WORDING &&
    betterShare >= EXTREME_SHARE &&
    relation === "better"
  ) {
    return { key: "kpiBenchmark.amongTheBest" };
  }
  if (
    othersCount >= MIN_FOR_EXTREME_WORDING &&
    betterShare <= 1 - EXTREME_SHARE &&
    relation === "worse"
  ) {
    return { key: "kpiBenchmark.amongTheWorst" };
  }
  if (relation === "similar") {
    return { key: "kpiBenchmark.similarToReference", reference };
  }
  if (relation === "better") {
    return { key: "kpiBenchmark.betterThanReference", reference };
  }
  return { key: "kpiBenchmark.worseThanReference", reference };
}

function positionPrimary(
  relation: Relation,
  higherShare: number,
  othersCount: number,
  reference: BenchmarkReference,
): BenchmarkPhrase {
  if (othersCount >= MIN_FOR_EXTREME_WORDING && higherShare >= EXTREME_SHARE) {
    return { key: "kpiBenchmark.amongTheHighest" };
  }
  if (
    othersCount >= MIN_FOR_EXTREME_WORDING &&
    higherShare <= 1 - EXTREME_SHARE
  ) {
    return { key: "kpiBenchmark.amongTheLowest" };
  }
  if (relation === "similar") {
    return { key: "kpiBenchmark.similarToReference", reference };
  }
  if (relation === "higher") {
    return { key: "kpiBenchmark.higherThanReference", reference };
  }
  return { key: "kpiBenchmark.lowerThanReference", reference };
}

function sharePhrase(
  parts: ShareSplit,
  peerGroup: BenchmarkPeerGroup,
  higherIsBetter: boolean | null,
): BenchmarkPhrase | null {
  if (!parts.total) return null;
  // Ties are not "worse". A top score shared with others is still a top score.
  if (higherIsBetter !== null && parts.unfavorable === 0 && parts.equal > 0) {
    return { key: "kpiBenchmark.tiedForBest", peerGroup };
  }
  if (
    higherIsBetter !== null &&
    parts.favorable === 0 &&
    parts.equal > 0 &&
    parts.unfavorable > 0
  ) {
    return { key: "kpiBenchmark.tiedForWorst", peerGroup };
  }

  const favorableShare = parts.favorable / parts.total;
  const unfavorableShare = parts.unfavorable / parts.total;
  if (higherIsBetter === null) {
    const higher = favorableShare >= unfavorableShare;
    return {
      key: higher
        ? "kpiBenchmark.higherThanShare"
        : "kpiBenchmark.lowerThanShare",
      percent: percent(higher ? favorableShare : unfavorableShare),
      peerGroup,
    };
  }
  const better = favorableShare >= unfavorableShare;
  return {
    key: better
      ? "kpiBenchmark.betterThanShare"
      : "kpiBenchmark.worseThanShare",
    percent: percent(better ? favorableShare : unfavorableShare),
    peerGroup,
  };
}

function toneFor(relation: Relation): Exclude<BenchmarkTone, "unknown"> {
  if (relation === "better") return "good";
  if (relation === "worse") return "bad";
  return "neutral";
}

export function buildNumericBenchmark(
  input: NumericBenchmarkInput,
): NumericBenchmarkView | null {
  if (!Number.isFinite(input.value)) return null;

  const all = finiteNumbers(input.peers);
  const group = finiteNumbers(input.groupPeers ?? []);
  const minGroupSize = input.minGroupSize ?? 3;
  const useGroup = group.length >= minGroupSize;
  const scaleSource = useGroup ? group : all;
  if (scaleSource.length < 2) return null;

  const scale = scaleSource.includes(input.value)
    ? scaleSource
    : [...scaleSource, input.value];
  const sorted = [...scale].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const span = max - min;

  const referenceValue = median(scaleSource);
  const position = rankPosition(input.value, scale);
  const averagePosition = rankPosition(referenceValue, scale);

  const showOverall = useGroup && all.length >= 2;
  const overallAverage = showOverall ? median(all) : null;
  const overallAveragePosition =
    overallAverage === null ? null : rankPosition(overallAverage, scale);
  const hideOverall =
    overallAveragePosition !== null &&
    Math.abs(overallAveragePosition - averagePosition) <= 0.025;

  const peerGroup =
    useGroup && input.groupPeerGroup ? input.groupPeerGroup : input.peerGroup;
  const reference: BenchmarkReference = useGroup
    ? (input.reference ?? "all")
    : "all";
  const others = excludeOne(scaleSource, input.value);
  const relation = relate(
    input.value,
    referenceValue,
    position,
    averagePosition,
    input.higherIsBetter,
    span,
  );

  const parts = splitShares(input.value, others, input.higherIsBetter);
  const favorableShare = parts.total ? parts.favorable / parts.total : 0;
  const tiedForBest =
    input.higherIsBetter !== null &&
    parts.unfavorable === 0 &&
    parts.equal > 0 &&
    parts.total > 0;

  const primary = tiedForBest
    ? { key: "kpiBenchmark.tiedForBest", peerGroup }
    : input.higherIsBetter === null
      ? positionPrimary(relation, favorableShare, others.length, reference)
      : directionalPrimary(relation, favorableShare, others.length, reference);

  const extreme = tiedForBest
    ? null
    : relation === "similar"
      ? null
      : extremePhrase(
          favorableShare,
          peerGroup,
          input.higherIsBetter,
          others.length,
        );

  return {
    kind: "numeric",
    tone: tiedForBest ? "good" : toneFor(relation),
    higherIsBetter: input.higherIsBetter,
    position,
    averagePosition,
    overallAveragePosition: hideOverall ? null : overallAveragePosition,
    minLabel: input.format(min),
    maxLabel: input.format(max),
    averageLabel: input.format(referenceValue),
    overallAverageLabel:
      overallAverage === null || hideOverall
        ? null
        : input.format(overallAverage),
    primaryReference: reference,
    primary: extreme?.primary ?? primary,
    secondary:
      tiedForBest || extreme
        ? null
        : sharePhrase(parts, peerGroup, input.higherIsBetter),
  };
}

function extremePhrase(
  share: number,
  peerGroup: BenchmarkPeerGroup,
  higherIsBetter: boolean | null,
  othersCount: number,
): { primary: BenchmarkPhrase; secondary: null } | null {
  if (othersCount < 1) return null;
  if (share >= 0.995) {
    return {
      primary: {
        key:
          higherIsBetter === null
            ? "kpiBenchmark.highestOfPeers"
            : "kpiBenchmark.bestOfPeers",
        peerGroup,
      },
      secondary: null,
    };
  }
  if (share <= 0.005) {
    return {
      primary: {
        key:
          higherIsBetter === null
            ? "kpiBenchmark.lowestOfPeers"
            : "kpiBenchmark.worstOfPeers",
        peerGroup,
      },
      secondary: null,
    };
  }
  return null;
}

function decisiveCounts(values: Array<boolean | null | undefined>) {
  let yes = 0;
  let no = 0;
  for (const value of values) {
    if (value === true) yes += 1;
    else if (value === false) no += 1;
  }
  return { yes, no, total: yes + no };
}

export function buildBooleanBenchmark(
  input: BooleanBenchmarkInput,
): BooleanBenchmarkView | null {
  const peers = decisiveCounts(input.peers);
  if (peers.total < 2) return null;

  const others = { ...peers };
  if (input.value === true && others.yes > 0) others.yes -= 1;
  if (input.value === false && others.no > 0) others.no -= 1;
  others.total = others.yes + others.no;

  const trueShare = peers.yes / peers.total;
  const othersYesShare =
    others.total > 0 ? others.yes / others.total : trueShare;
  const yesIsGood = input.higherIsBetter;
  const inMajority =
    input.value === true ? othersYesShare >= 0.5 : othersYesShare < 0.5;

  let tone: BenchmarkTone = "unknown";
  let primary: BenchmarkPhrase;
  if (input.value === null || input.value === undefined) {
    primary = {
      key: "kpiBenchmark.booleanUnknown",
      percent: percent(trueShare),
      peerGroup: input.peerGroup,
    };
  } else if (input.value === true) {
    tone = yesIsGood ? "good" : "bad";
    primary = {
      key: inMajority
        ? "kpiBenchmark.booleanWithMost"
        : "kpiBenchmark.booleanAhead",
      peerGroup: input.peerGroup,
    };
  } else {
    tone = yesIsGood ? "bad" : "good";
    primary = {
      key: inMajority
        ? "kpiBenchmark.booleanWithFew"
        : "kpiBenchmark.booleanBehind",
      peerGroup: input.peerGroup,
    };
  }

  const minGroupSize = input.minGroupSize ?? 3;
  const group = decisiveCounts(input.groupPeers ?? []);
  const secondary =
    group.total >= minGroupSize && input.groupPeerGroup
      ? {
          key: "kpiBenchmark.shareOfPeers",
          percent: percent(group.yes / group.total),
          peerGroup: input.groupPeerGroup,
          reference: input.groupReference,
        }
      : null;

  return {
    kind: "boolean",
    tone,
    trueShare,
    higherIsBetter: input.higherIsBetter,
    peerGroup: input.peerGroup,
    primary,
    secondary,
  };
}
