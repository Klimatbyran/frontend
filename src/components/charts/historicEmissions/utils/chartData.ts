/**
 * Chart data filtering utilities
 */

export const filterValidTotalData = (data: any[]) => {
  return data.filter((d) => d.total !== undefined && d.total !== null);
};

export const filterValidScopeData = (data: any[]) => {
  return data.filter((d) => {
    return (
      (d.scope1?.value !== undefined && d.scope1?.value !== null) ||
      (d.scope2?.value !== undefined && d.scope2?.value !== null) ||
      (d.scope3?.value !== undefined && d.scope3?.value !== null)
    );
  });
};

export const filterValidCategoryData = (data: any[]) => {
  return data.filter((d) => {
    return Object.keys(d).some((key) => {
      if (key.startsWith("cat") && d[key]) {
        const categoryValue = d[key];
        return (
          categoryValue !== undefined &&
          categoryValue !== null &&
          categoryValue !== 0
        );
      }
      return false;
    });
  });
};

export const filterDataByYearRange = (data: any[], endYear: number) => {
  return data.filter((point) => point.year <= endYear);
};
