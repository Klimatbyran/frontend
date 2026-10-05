import {
  buildBooleanBenchmark,
  buildNumericBenchmark,
  rankPosition,
} from "./kpiBenchmark";

describe("rankPosition", () => {
  it("places the smallest value at the start and the largest at the end", () => {
    const values = [1, 2, 3, 4, 5];
    expect(rankPosition(1, values)).toBe(0);
    expect(rankPosition(5, values)).toBe(1);
    expect(rankPosition(3, values)).toBe(0.5);
  });

  it("puts a tied value in the middle of that tie", () => {
    // Sorted: 1, 2, 2, 4. The two 2s occupy the middle two slots.
    expect(rankPosition(2, [1, 2, 2, 4])).toBe(0.5);
  });

  it("places a number that nobody reported halfway between its neighbors", () => {
    // 25 sits halfway between 20 and 30, the two middle values of four.
    // Those slots are at 1/3 and 2/3, so 25 lands at 1/2.
    expect(rankPosition(25, [10, 20, 30, 40])).toBe(0.5);
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
    });

    expect(view?.primary).toMatchObject({
      key: "kpiBenchmark.betterThanReference",
      reference: "region",
    });
    expect(view?.primary.reference).toBe("region");
  });

  it("falls back to the full peer set when the group is too small", () => {
    const view = buildNumericBenchmark({
      value: 4,
      peers,
      groupPeers: [8, 9],
      higherIsBetter: false,
      peerGroup: "municipalities",
      groupPeerGroup: "municipalitiesInRegion",
      reference: "region",
    });

    expect(view?.primary.reference).toBe("all");
  });

  it("describes size metrics as higher or lower, without a good or bad tone", () => {
    const view = buildNumericBenchmark({
      value: 10,
      peers,
      higherIsBetter: null,
      peerGroup: "companies",
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
      }),
    ).toBeNull();
  });

  it("keeps a peer who shares the top score when the subject is already excluded", () => {
    const view = buildNumericBenchmark({
      value: 5,
      peers: [5, 1, 2, 3, 4],
      higherIsBetter: true,
      peerGroup: "companies",
      peersIncludeSubject: false,
    });

    expect(view?.primary.key).toBe("kpiBenchmark.tiedForBest");
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
    expect(view?.primary.key).toBe("kpiBenchmark.booleanUnknown");
  });

  it("counts this entity in the yes share when peers were already filtered", () => {
    // One other municipality said yes, four said no, and this one said yes.
    // The bar splits at 2 of 6.
    const view = buildBooleanBenchmark({
      value: true,
      peers: [true, false, false, false, false],
      higherIsBetter: true,
      peerGroup: "municipalities",
      peersIncludeSubject: false,
    });

    expect(view?.trueShare).toBeCloseTo(2 / 6);
  });

  it("does not drop another yes when the subject is already excluded", () => {
    const view = buildBooleanBenchmark({
      value: true,
      peers: [true],
      higherIsBetter: true,
      peerGroup: "regions",
      peersIncludeSubject: false,
    });

    expect(view?.trueShare).toBeCloseTo(1);
    expect(view?.primary.key).toBe("kpiBenchmark.booleanWithMost");
  });
});

describe("how the average is calculated", () => {
  it("uses the middle peer when there is an odd number of other peers", () => {
    // Other municipalities: 10, 20, 30, 40, 50. The middle value is 30.
    // This municipality emits 25, so the bar reads 10, 20, 25, 30, 40, 50.
    const view = buildNumericBenchmark({
      value: 25,
      peers: [10, 20, 30, 40, 50],
      higherIsBetter: false,
      peerGroup: "municipalities",
      peersIncludeSubject: false,
    });

    // 25 is the third of six values: 2 / 5 of the way along the bar.
    expect(view?.position).toBeCloseTo(0.4);
    // 30 is the fourth of six values: 3 / 5 of the way along the bar.
    expect(view?.averagePosition).toBeCloseTo(0.6);
    expect(view?.primary).toMatchObject({
      key: "kpiBenchmark.betterThanReference",
      reference: "all",
    });
  });

  it("averages the two middle peers when there is an even number", () => {
    // Other peers: 10, 20, 30, 40. The two middle values are 20 and 30,
    // so the average is 25. This municipality is tied with the highest peer.
    const view = buildNumericBenchmark({
      value: 40,
      peers: [10, 20, 30, 40],
      higherIsBetter: false,
      peerGroup: "municipalities",
      peersIncludeSubject: false,
    });

    // Bar: 10, 20, 30, 40, 40. The two 40s share the last two slots.
    expect(view?.position).toBeCloseTo(0.875);
    // 25 falls halfway between 20 (at 25%) and 30 (at 50%).
    expect(view?.averagePosition).toBeCloseTo(0.375);
  });

  it("keeps the average on the median when one peer is far above the rest", () => {
    // Other peers: 1, 2, 3, 4, 100. The median is 3. The mean would be 22.
    // This municipality also emits 3.
    const view = buildNumericBenchmark({
      value: 3,
      peers: [1, 2, 3, 4, 100],
      higherIsBetter: false,
      peerGroup: "municipalities",
      peersIncludeSubject: false,
    });

    // Both the dot and the average sit on 3, halfway along 1, 2, 3, 3, 4, 100.
    // The mean, 22, would sit between 4 and 100, at about 84%.
    expect(view?.position).toBeCloseTo(0.5);
    expect(view?.averagePosition).toBeCloseTo(0.5);
    expect(view?.primary.key).toBe("kpiBenchmark.similarToReference");
  });

  it("still gives this entity its own slot when a peer reports the same number", () => {
    // Other peers: 1, 2, 3, 4, 5. One of them also emits 5.
    const view = buildNumericBenchmark({
      value: 5,
      peers: [1, 2, 3, 4, 5],
      higherIsBetter: true,
      peerGroup: "companies",
      peersIncludeSubject: false,
    });

    // Bar: 1, 2, 3, 4, 5, 5. The two 5s share the top, at 90%, not at 100%.
    expect(view?.position).toBeCloseTo(0.9);
    // The middle peer is 3, the third of six values, at 40%.
    expect(view?.averagePosition).toBeCloseTo(0.4);
    expect(view?.primary.key).toBe("kpiBenchmark.tiedForBest");
  });

  it("takes the average from the regional group when that group is large enough", () => {
    // Neighbors: 30, 40, 50, 60, 70. Their middle value is 50.
    // The national list 1 through 10 would have put the average at 5.5.
    const view = buildNumericBenchmark({
      value: 45,
      peers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      groupPeers: [30, 40, 50, 60, 70],
      higherIsBetter: false,
      peerGroup: "municipalities",
      groupPeerGroup: "municipalitiesInRegion",
      reference: "region",
      peersIncludeSubject: false,
    });

    // Bar: 30, 40, 45, 50, 60, 70. This municipality is the third of six.
    expect(view?.position).toBeCloseTo(0.4);
    // 50 is the fourth of those six values.
    expect(view?.averagePosition).toBeCloseTo(0.6);
    expect(view?.primary).toMatchObject({
      key: "kpiBenchmark.betterThanReference",
      reference: "region",
    });
  });

  it("calls one step above a long list near the average", () => {
    // 41 other municipalities, with emissions 0 through 40. The middle one is 20.
    // This municipality emits 21.
    const peers = Array.from({ length: 41 }, (_, index) => index);
    const view = buildNumericBenchmark({
      value: 21,
      peers,
      higherIsBetter: false,
      peerGroup: "municipalities",
      peersIncludeSubject: false,
    });

    // 20 is at 20/41 of the bar. 21 shares the next slot, at 21.5/41.
    // The gap is about 3.7 points, inside the 5-point "near the average" band.
    expect(view?.averagePosition).toBeCloseTo(20 / 41);
    expect(view?.position).toBeCloseTo(21.5 / 41);
    expect(view?.primary).toMatchObject({
      key: "kpiBenchmark.similarToReference",
      reference: "all",
    });
  });

  it("ignores peers that are not real numbers", () => {
    const view = buildNumericBenchmark({
      value: 20,
      peers: [10, Number.NaN, 20, Number.POSITIVE_INFINITY, 30, 40, 50],
      higherIsBetter: false,
      peerGroup: "municipalities",
      peersIncludeSubject: false,
    });

    // Finite peers are 10, 20, 30, 40, 50. The middle value is 30.
    // Bar: 10, 20, 20, 30, 40, 50.
    expect(view?.position).toBeCloseTo(0.3);
    expect(view?.averagePosition).toBeCloseTo(0.6);
  });
});
