import type { ParisAlignedCompanyRow } from "./calculateStatistics";

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatTonnes(num: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(num);
}

export function exportParisAlignedCompaniesToCSV(
  yesCompanies: ParisAlignedCompanyRow[],
): void {
  if (yesCompanies.length === 0) return;

  const headers = [
    "Company Name",
    "Est. 2025 Emissions (tonnes CO₂)",
    "Carbon Budget 2025-2050 (tonnes CO₂)",
    "Projected Emissions 2025-2050 (tonnes CO₂)",
    "Diff from Budget (tonnes CO₂)",
    "Has Scope 3 Categories",
  ];

  const rows = yesCompanies.map((company) => [
    company.name,
    company.emissions2025.toFixed(2),
    company.carbonBudget.toFixed(2),
    company.projectedEmissions.toFixed(2),
    company.diffFromBudget.toFixed(2),
    company.hasScope3Categories ? "Yes" : "No",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `paris-aligned-companies-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
}
