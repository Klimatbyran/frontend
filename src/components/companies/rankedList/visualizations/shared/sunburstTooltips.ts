/**
 * Shared tooltip utilities for sunburst chart visualizations
 */

interface SectorTooltipData {
  name: string;
  companyCount: number;
  averageValue: number;
}

interface CompanyTooltipData {
  companyName: string;
  value: number;
}

/**
 * Format a sector tooltip
 */
export function formatSectorTooltip(
  data: SectorTooltipData,
  formatValue: (value: number) => string,
): string {
  return `
    <div style="padding: 8px;">
      <div style="font-weight: bold; margin-bottom: 4px;">${data.name}</div>
      <div style="font-size: 11px; color: rgba(255,255,255,0.7); margin-bottom: 2px;">${data.companyCount} companies</div>
      <div style="font-size: 11px; color: rgba(255,255,255,0.7);">
        Average: ${formatValue(data.averageValue)}
      </div>
    </div>
  `;
}

/**
 * Format a company tooltip
 */
export function formatCompanyTooltip(
  data: CompanyTooltipData,
  formatValue: (value: number) => string,
): string {
  return `
    <div style="padding: 8px;">
      <div style="font-weight: bold; margin-bottom: 4px;">${data.companyName}</div>
      <div style="font-size: 13px;">
        ${formatValue(data.value)}
      </div>
    </div>
  `;
}

/**
 * Create a tooltip formatter for sunburst charts
 */
export function createSunburstTooltipFormatter(options: {
  formatSectorValue: (value: number) => string;
  formatCompanyValue: (value: number) => string;
  getCompanyName: (item: any) => string;
  getValue: (item: any) => number;
}): (params: any) => string {
  const { formatSectorValue, formatCompanyValue, getCompanyName, getValue } =
    options;

  return (params: any) => {
    const data = params.data;
    if (!data) return "";

    const treePathInfo = params.treePathInfo || [];
    const hoverLevel = treePathInfo.length - 1;

    // Priority 1: Check for sectors first when hovering at level 1
    if (hoverLevel === 1) {
      if (data.children && data.name && !data.item && !data.companyName) {
        const companyCount = data.children.length;
        const averageValue = data.averageValue ?? 0;
        return formatSectorTooltip(
          {
            name: data.name,
            companyCount,
            averageValue,
          },
          formatSectorValue,
        );
      }
    }

    // Priority 2: Check for companies when hovering at level 2 or if data has company info
    if (data.item || data.companyName || hoverLevel === 2) {
      if (data.item || data.companyName) {
        const companyName = getCompanyName(data);
        if (!companyName) return "";
        const value = getValue(data);
        return formatCompanyTooltip(
          {
            companyName,
            value,
          },
          formatCompanyValue,
        );
      }
      if (hoverLevel === 2 && treePathInfo[2]) {
        const companyData = treePathInfo[2];
        if (companyData.item || companyData.companyName) {
          const companyName = getCompanyName(companyData);
          if (companyName) {
            const value = getValue(companyData);
            return formatCompanyTooltip(
              {
                companyName,
                value,
              },
              formatCompanyValue,
            );
          }
        }
      }
    }

    // Fallback: If it's a sector (has children and a name), show sector info
    if (data.children && data.name && !data.item && !data.companyName) {
      const companyCount = data.children.length;
      const averageValue = data.averageValue ?? 0;
      return formatSectorTooltip(
        {
          name: data.name,
          companyCount,
          averageValue,
        },
        formatSectorValue,
      );
    }

    if (!data.name || data.name === "" || (!data.children && !data.item)) {
      return "";
    }

    return "";
  };
}
