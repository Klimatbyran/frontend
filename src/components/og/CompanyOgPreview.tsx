/**
 * OG Image Preview Component for Companies
 * Renders a curated preview that looks like the actual company detail page
 * Optimized for 1200x630px (Open Graph standard)
 */

import type { CompanyDetails } from "@/types/company";

interface CompanyOgPreviewProps {
  company: CompanyDetails;
  latestYear?: number;
  totalEmissions?: number;
  emissionsChange?: number;
  industry?: string;
}

export function CompanyOgPreview({
  company,
  latestYear,
  totalEmissions,
  emissionsChange,
  industry,
}: CompanyOgPreviewProps) {
  const formattedEmissions = totalEmissions
    ? `${(totalEmissions / 1_000_000).toFixed(1)} Mt CO₂e`
    : "No data";

  const changeDisplay = emissionsChange
    ? `${emissionsChange > 0 ? "+" : ""}${emissionsChange.toFixed(1)}%`
    : null;

  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#000000",
        fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif',
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header Section - mimics DetailHeader */}
      <div
        style={{
          padding: "60px 80px 40px",
          borderBottom: "1px solid #2e2e2e",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "56px",
                fontWeight: 300,
                lineHeight: 1.1,
                color: "#ffffff",
                margin: 0,
                marginBottom: "8px",
                letterSpacing: "-0.02em",
              }}
            >
              {company.name}
            </h1>
            {industry && (
              <div
                style={{
                  fontSize: "20px",
                  color: "#878787",
                  marginTop: "4px",
                }}
              >
                {industry}
              </div>
            )}
          </div>
          {company.logoUrl && (
            <img
              src={company.logoUrl}
              alt=""
              style={{
                height: "60px",
                width: "auto",
                objectFit: "contain",
              }}
            />
          )}
        </div>
      </div>

      {/* Stats Section - mimics OverviewStatistics */}
      <div
        style={{
          flex: 1,
          padding: "40px 80px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "40px",
        }}
      >
        {/* Total Emissions */}
        <div>
          <div
            style={{
              fontSize: "18px",
              color: "#878787",
              marginBottom: "12px",
            }}
          >
            Total Emissions
            {latestYear && ` (${latestYear})`}
          </div>
          <div
            style={{
              fontSize: "42px",
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            {formattedEmissions}
          </div>
        </div>

        {/* Year-over-Year Change */}
        {changeDisplay && (
          <div>
            <div
              style={{
                fontSize: "18px",
                color: "#878787",
                marginBottom: "12px",
              }}
            >
              Year-over-Year Change
            </div>
            <div
              style={{
                fontSize: "42px",
                fontWeight: 600,
                color: emissionsChange && emissionsChange < 0 ? "#aae506" : "#f0759a",
              }}
            >
              {changeDisplay}
            </div>
          </div>
        )}

        {/* Paris Alignment */}
        <div>
          <div
            style={{
              fontSize: "18px",
              color: "#878787",
              marginBottom: "12px",
            }}
          >
            Paris Alignment
          </div>
          <div
            style={{
              fontSize: "42px",
              fontWeight: 600,
              color: "#ffffff",
            }}
          >
            {company.meetsParis === true
              ? "On Track"
              : company.meetsParis === false
                ? "Not on Track"
                : "Unknown"}
          </div>
        </div>
      </div>

      {/* Footer - Klimatkollen branding */}
      <div
        style={{
          padding: "24px 80px",
          backgroundColor: "#121212",
          borderTop: "1px solid #2e2e2e",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#ffffff",
          }}
        >
          Klimatkollen
        </div>
        <div
          style={{
            fontSize: "16px",
            color: "#878787",
          }}
        >
          klimatkollen.se
        </div>
      </div>
    </div>
  );
}
