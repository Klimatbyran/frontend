-- Company, base year, count of years with any (non-null, non-zero) calculated total,
-- and sum of calculated totals for all years since base year.
--
-- Calculated total = Scope 1+2 + Scope 3. Scope 1+2 uses separate Scope1 + Scope2 when either is present; only when both are null do we use Scope1And2.total. Scope 3 = sum of categories, or Scope 3 stated if no category sum.
-- "Has data" = non-zero calculated total.

WITH Scope3_pivot AS (
  SELECT
    "scope3Id",
    MAX(CASE WHEN "category" = '1' THEN "total" END) AS Scope3_cat_1,
    MAX(CASE WHEN "category" = '2' THEN "total" END) AS Scope3_cat_2,
    MAX(CASE WHEN "category" = '3' THEN "total" END) AS Scope3_cat_3,
    MAX(CASE WHEN "category" = '4' THEN "total" END) AS Scope3_cat_4,
    MAX(CASE WHEN "category" = '5' THEN "total" END) AS Scope3_cat_5,
    MAX(CASE WHEN "category" = '6' THEN "total" END) AS Scope3_cat_6,
    MAX(CASE WHEN "category" = '7' THEN "total" END) AS Scope3_cat_7,
    MAX(CASE WHEN "category" = '8' THEN "total" END) AS Scope3_cat_8,
    MAX(CASE WHEN "category" = '9' THEN "total" END) AS Scope3_cat_9,
    MAX(CASE WHEN "category" = '10' THEN "total" END) AS Scope3_cat_10,
    MAX(CASE WHEN "category" = '11' THEN "total" END) AS Scope3_cat_11,
    MAX(CASE WHEN "category" = '12' THEN "total" END) AS Scope3_cat_12,
    MAX(CASE WHEN "category" = '13' THEN "total" END) AS Scope3_cat_13,
    MAX(CASE WHEN "category" = '14' THEN "total" END) AS Scope3_cat_14,
    MAX(CASE WHEN "category" = '15' THEN "total" END) AS Scope3_cat_15,
    MAX(CASE WHEN "category" = '16' THEN "total" END) AS Scope3_cat_16
  FROM "public"."Scope3Category"
  GROUP BY "scope3Id"
),
emissions_with_scopes AS (
  SELECT
    e."id" AS emissions_id,
    e."reportingPeriodId",
    s12."total" AS scope1and2_total,
    s1."total" AS s1_total,
    s2."mb" AS s2_mb,
    s2."lb" AS s2_lb,
    (SELECT se."total" FROM "StatedTotalEmissions" se WHERE s3."id" = se."scope3Id") AS scope3_total,
    (
      COALESCE(sp.Scope3_cat_1,0) + COALESCE(sp.Scope3_cat_2,0) + COALESCE(sp.Scope3_cat_3,0) +
      COALESCE(sp.Scope3_cat_4,0) + COALESCE(sp.Scope3_cat_5,0) + COALESCE(sp.Scope3_cat_6,0) +
      COALESCE(sp.Scope3_cat_7,0) + COALESCE(sp.Scope3_cat_8,0) + COALESCE(sp.Scope3_cat_9,0) +
      COALESCE(sp.Scope3_cat_10,0) + COALESCE(sp.Scope3_cat_11,0) + COALESCE(sp.Scope3_cat_12,0) +
      COALESCE(sp.Scope3_cat_13,0) + COALESCE(sp.Scope3_cat_14,0) + COALESCE(sp.Scope3_cat_15,0) +
      COALESCE(sp.Scope3_cat_16,0)
    ) AS scope3_categories_sum
  FROM "Emissions" e
  LEFT JOIN "Scope1And2" s12 ON e."id" = s12."emissionsId"
  LEFT JOIN "Scope1" s1 ON e."id" = s1."emissionsId"
  LEFT JOIN "Scope2" s2 ON e."id" = s2."emissionsId"
  LEFT JOIN "Scope3" s3 ON e."id" = s3."emissionsId"
  LEFT JOIN Scope3_pivot sp ON s3."id" = sp."scope3Id"
),
reporting_with_company AS (
  SELECT
    rp."companyId",
    rp."year",
    es.scope1and2_total,
    es.s1_total,
    es.s2_mb,
    es.s2_lb,
    es.scope3_total,
    es.scope3_categories_sum
  FROM "public"."ReportingPeriod" rp
  LEFT JOIN emissions_with_scopes es ON rp."id" = es."reportingPeriodId"
),
company_years AS (
  SELECT
    c."name" AS company_name,
    rwc."year",
    -- Calculated: Scope 1+2 (separate S1+S2 when either present; else Scope1And2.total) + Scope 3 (categories sum or stated).
    (
      CASE
        WHEN (rwc.s1_total IS NOT NULL OR rwc.s2_mb IS NOT NULL OR rwc.s2_lb IS NOT NULL)
        THEN (COALESCE(rwc.s1_total, 0) + COALESCE(NULLIF(rwc.s2_mb, 0), rwc.s2_lb, 0))
        ELSE COALESCE(rwc.scope1and2_total, 0)
      END
      + COALESCE(rwc.scope3_categories_sum, rwc.scope3_total, 0)
    ) AS total_calculated
  FROM reporting_with_company rwc
  LEFT JOIN "Company" c ON rwc."companyId" = c."wikidataId"
),
with_has_data AS (
  SELECT
    company_name,
    year,
    total_calculated,
    (total_calculated IS NOT NULL AND total_calculated != 0) AS has_emissions_data
  FROM company_years
  WHERE company_name IS NOT NULL
),
base_year_per_company AS (
  SELECT
    company_name,
    MIN(year) FILTER (WHERE has_emissions_data) AS base_year_emissions
  FROM with_has_data
  GROUP BY company_name
),
-- For each company-year, only include years >= base year for that company
since_base AS (
  SELECT
    w.company_name,
    w.year,
    w.total_calculated,
    w.has_emissions_data,
    by.base_year_emissions
  FROM with_has_data w
  JOIN base_year_per_company by ON w.company_name = by.company_name
  WHERE by.base_year_emissions IS NOT NULL
    AND w.year >= by.base_year_emissions
)
SELECT
  company_name,
  base_year_emissions AS base_year,
  COUNT(*) FILTER (WHERE has_emissions_data) AS years_with_emissions_data,
  COALESCE(SUM(total_calculated) FILTER (WHERE has_emissions_data), 0) AS total_reported_emissions_since_base
FROM since_base
GROUP BY company_name, base_year_emissions
ORDER BY company_name;
