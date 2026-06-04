export function resolveRegionFromMapName<T extends { name: string }>(
  mapName: string,
  regions: T[],
): T | undefined {
  const mapKey = mapName.toLowerCase();

  return regions.find((region) => {
    const displayKey = region.name.toLowerCase();
    return (
      toMapRegionName(region.name).toLowerCase() === mapKey ||
      displayKey === mapKey
    );
  });
}

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
