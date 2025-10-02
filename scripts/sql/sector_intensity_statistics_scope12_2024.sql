-- Query to analyze revenue intensity per million SEK statistics by sector for 2024
-- Calculates min, max, average, and median intensity for each sector
-- Based on companies with non-null, non-zero SEK turnover
-- ONLY considers Scope 1 and Scope 2 emissions (excludes Scope 3)
-- Includes s2.unknown emissions in addition to s2.mb and s2.lb
-- Excludes Investor company (Q1671804) due to incorrect turnover data

WITH emissions_with_scopes AS (
  SELECT
    e."id" AS emissions_id,
    e."reportingPeriodId",
    s1."total" AS s1_total,
    s2."mb" AS s2_mb,
    s2."lb" AS s2_lb,
    s2."unknown" AS s2_unknown
  FROM "Emissions" e
  LEFT JOIN "Scope1" s1 ON e."id" = s1."emissionsId"
  LEFT JOIN "Scope2" s2 ON e."id" = s2."emissionsId"
),
reporting_with_company AS (
  SELECT
    rp."companyId",
    rp."year",
    es.s1_total,
    es.s2_mb,
    es.s2_lb,
    es.s2_unknown,
    t."value" AS revenue_value,
    t."currency" AS revenue_currency
  FROM "public"."ReportingPeriod" rp
  LEFT JOIN emissions_with_scopes es ON rp."id" = es."reportingPeriodId"
  LEFT JOIN "Economy" e ON rp."id" = e."reportingPeriodId"
  LEFT JOIN "Turnover" t ON e."id" = t."economyId"
),
company_years AS (
  SELECT
    c."name" AS company_name,
    c."wikidataId",
    rwc."year",
    rwc.s1_total,
    rwc.s2_mb,
    rwc.s2_lb,
    rwc.s2_unknown,
    rwc.revenue_value,
    rwc.revenue_currency,
    ig."sectorName",
    ig."industryName"
  FROM reporting_with_company rwc
  LEFT JOIN "Company" c ON rwc."companyId" = c."wikidataId"
  LEFT JOIN "Industry" i ON c."wikidataId" = i."companyWikidataId"
  LEFT JOIN "IndustryGics" ig ON i."gicsSubIndustryCode" = ig."subIndustryCode"
),
pivoted AS (
  SELECT
    company_name,
    MAX("sectorName") AS sector_name,
    MAX("industryName") AS industry_name,
    MAX(CASE WHEN year = '2024' THEN s1_total END) AS s1_2024,
    MAX(CASE WHEN year = '2024' THEN s2_mb END) AS s2_mb_2024,
    MAX(CASE WHEN year = '2024' THEN s2_lb END) AS s2_lb_2024,
    MAX(CASE WHEN year = '2024' THEN s2_unknown END) AS s2_unknown_2024,
    MAX(CASE WHEN year = '2024' THEN revenue_value END) AS revenue_2024,
    MAX(CASE WHEN year = '2024' THEN revenue_currency END) AS revenue_currency_2024
  FROM company_years
  WHERE "wikidataId" != 'Q1671804'  -- Exclude Investor company
  GROUP BY company_name
),
companies_with_intensity AS (
  SELECT
    company_name,
    sector_name,
    industry_name,
    revenue_2024,
    revenue_currency_2024,
    -- Calculate 2024 total emissions (Scope 1 + Scope 2 only)
    (COALESCE(s1_2024,0) + COALESCE(NULLIF(s2_mb_2024,0), s2_lb_2024, 0) + COALESCE(s2_unknown_2024,0)) AS total_2024_scope12,
    -- Calculate intensity per million SEK (Scope 1 + Scope 2 only)
    CASE 
      WHEN revenue_2024 IS NOT NULL AND revenue_2024 > 0 
      THEN ROUND(
        ((COALESCE(s1_2024,0) + COALESCE(NULLIF(s2_mb_2024,0), s2_lb_2024, 0) + COALESCE(s2_unknown_2024,0)) / (revenue_2024 / 1000000))::numeric, 
        6
      )
      ELSE NULL 
    END AS intensity_per_million_sek_scope12
  FROM pivoted
  WHERE 
    -- Filter for companies with non-null, non-zero revenue in SEK
    revenue_2024 IS NOT NULL 
    AND revenue_2024 > 0
    AND revenue_currency_2024 = 'SEK'
    -- Only include companies with non-null, non-zero Scope 1+2 emissions data
    AND (COALESCE(s1_2024,0) + COALESCE(NULLIF(s2_mb_2024,0), s2_lb_2024, 0) + COALESCE(s2_unknown_2024,0)) > 0
)
SELECT
  sector_name,
  COUNT(*) AS total_companies,
  -- Intensity statistics (Scope 1 + Scope 2 emissions only)
  MIN(intensity_per_million_sek_scope12) AS min_intensity_per_million_sek,
  MAX(intensity_per_million_sek_scope12) AS max_intensity_per_million_sek,
  ROUND(AVG(intensity_per_million_sek_scope12), 6) AS avg_intensity_per_million_sek,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY intensity_per_million_sek_scope12)::numeric, 6) AS median_intensity_per_million_sek,
  -- Range calculation
  ROUND((MAX(intensity_per_million_sek_scope12) - MIN(intensity_per_million_sek_scope12))::numeric, 6) AS range_intensity_per_million_sek
FROM companies_with_intensity
WHERE sector_name IS NOT NULL
GROUP BY sector_name
ORDER BY avg_intensity_per_million_sek DESC;
