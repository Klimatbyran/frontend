export const toMapRegionName = (regionName: string): string => {
  if (!regionName) {
    return regionName;
  }

  if (regionName.toLowerCase().endsWith(" län")) {
    const withoutLan = regionName.slice(0, -4);
    return withoutLan.endsWith("s") ? withoutLan.slice(0, -1) : withoutLan;
  }

  return regionName;
};
