import {
  buildBooleanBenchmark,
  buildNumericBenchmark,
  rankPosition,
} from "./kpiBenchmark";

const format = (value: number) => String(Math.round(value));

describe("rankPosition", () => {
  it("places the smallest value at the start and the largest at the end", () => {
    const values = [1, 2, 3, 4, 5];
    expect(rankPosition(1, values)).toBe(0);
    expect(rankPosition(5, values)).toBe(1);
    expect(rankPosition(3, values)).toBe(0.5);
  });
});

describe("buildNumericBenchmark", () => {
  const peers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it("calls a low emissions-style value better than the average", () => {
    const view = buildNumericBenchmark({
      value: 1,
      peers,
      higherIsBetter: false,
      peerGroup: "municipalities",
      format,
    });

    expect(view?.tone).toBe("good");
    expect(view?.primary).toMatchObject({
      key: "kpiBenchmark.bestOfPeers",
      peerGroup: "municipalities",
    });
    expect(view?.position).toBe(0);
  });

  it("calls a high emissions-style value worse than the average", () => {
    const view = buildNumericBenchmark({
      value: 10,
      peers,
      higherIsBetter: false,
      peerGroup: "municipalities",
      format,
    });

    expect(view?.tone).toBe("bad");
    expect(view?.primary).toMatchObject({
      key: "kpiBenchmark.worstOfPeers",
      peerGroup: "municipalities",
    });
  });

  it("uses the regional peer group when it is large enough", () => {
    const view = buildNumericBenchmark({
      value: 4,
      peers,
      groupPeers: [2, 4, 6, 8, 10],
      higherIsBetter: false,
      peerGroup: "municipalities",
      groupPeerGroup: "municipalitiesInRegion",
      reference: "region",
      format,
    });

    expect(view?.primary).toMatchObject({
      key: "kpiBenchmark.betterThanReference",
      reference: "region",
    });
    expect(view?.primaryReference).toBe("region");
  });

  it("falls back to the full peer set when the group is too small", () => {
    const view = buildNumericBenchmark({
      value: 2,
      peers,
      groupPeers: [8, 9],
      higherIsBetter: false,
      peerGroup: "municipalities",
      groupPeerGroup: "municipalitiesInRegion",
      reference: "region",
      format,
    });

    expect(view?.primaryReference).toBe("all");
  });

  it("describes size metrics as higher or lower, without a good or bad tone", () => {
    const view = buildNumericBenchmark({
      value: 10,
      peers,
      higherIsBetter: null,
      peerGroup: "companies",
      format,
    });

    expect(view?.tone).toBe("neutral");
    expect(view?.primary).toMatchObject({
      key: "kpiBenchmark.highestOfPeers",
      peerGroup: "companies",
    });
    expect(view?.higherIsBetter).toBeNull();
  });

  it("treats a shared top score as tied for best, not worse", () => {
    const view = buildNumericBenchmark({
      value: 2,
      peers: [2, 2, 2, 2, 1, 0],
      higherIsBetter: true,
      peerGroup: "municipalities",
      format,
    });

    expect(view?.tone).toBe("good");
    expect(view?.primary).toMatchObject({
      key: "kpiBenchmark.tiedForBest",
      peerGroup: "municipalities",
    });
  });

  it("returns nothing when there is nobody to compare with", () => {
    expect(
      buildNumericBenchmark({
        value: 4,
        peers: [4],
        higherIsBetter: false,
        peerGroup: "regions",
        format,
      }),
    ).toBeNull();
  });
});

describe("buildBooleanBenchmark", () => {
  it("says yes is ahead when most peers are not", () => {
    const view = buildBooleanBenchmark({
      value: true,
      peers: [true, false, false, false, false],
      higherIsBetter: true,
      peerGroup: "municipalities",
    });

    expect(view?.tone).toBe("good");
    expect(view?.primary.key).toBe("kpiBenchmark.booleanAhead");
    expect(view?.trueShare).toBeCloseTo(0.2);
  });

  it("says no is behind when most peers are yes", () => {
    const view = buildBooleanBenchmark({
      value: false,
      peers: [false, true, true, true, true],
      higherIsBetter: true,
      peerGroup: "companies",
    });

    expect(view?.tone).toBe("bad");
    expect(view?.primary.key).toBe("kpiBenchmark.booleanBehind");
  });

  it("explains a missing value with the peer share", () => {
    const view = buildBooleanBenchmark({
      value: null,
      peers: [true, true, false, false],
      higherIsBetter: true,
      peerGroup: "regions",
    });

    expect(view?.tone).toBe("unknown");
    expect(view?.primary).toMatchObject({
      key: "kpiBenchmark.booleanUnknown",
      percent: 50,
    });
  });
});
