-- Query to analyze company data by currency type for 2024
-- Returns company count, turnover total, currency, and emissions total grouped by currency
-- Excludes companies with no 2024 turnover data and no 2024 emissions data
-- Includes special rows for companies with missing data scenarios

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
    s1."total" AS s1_total,
    s2."mb" AS s2_mb,
    s2."lb" AS s2_lb,
    s2."unknown" AS s2_unknown,
    (SELECT se."total" FROM "StatedTotalEmissions" se WHERE s3."id" = se."scope3Id") AS scope3_total,
    (
      COALESCE(sp.Scope3_cat_1,0) + COALESCE(sp.Scope3_cat_2,0) + COALESCE(sp.Scope3_cat_3,0) +
      COALESCE(sp.Scope3_cat_4,0) + COALESCE(sp.Scope3_cat_5,0) + COALESCE(sp.Scope3_cat_6,0) +
      COALESCE(sp.Scope3_cat_7,0) + COALESCE(sp.Scope3_cat_8,0) + COALESCE(sp.Scope3_cat_9,0) +
      COALESCE(sp.Scope3_cat_10,0) + COALESCE(sp.Scope3_cat_11,0) + COALESCE(sp.Scope3_cat_12,0) +
      COALESCE(sp.Scope3_cat_13,0) + COALESCE(sp.Scope3_cat_14,0) + COALESCE(sp.Scope3_cat_15,0) +
      COALESCE(sp.Scope3_cat_16,0)
    ) as scope3_categories_sum
  FROM "Emissions" e
  LEFT JOIN "Scope1" s1 ON e."id" = s1."emissionsId"
  LEFT JOIN "Scope2" s2 ON e."id" = s2."emissionsId"
  LEFT JOIN "Scope3" s3 ON e."id" = s3."emissionsId"
  LEFT JOIN Scope3_pivot sp ON s3."id" = sp."scope3Id"
),
reporting_with_company AS (
  SELECT
    rp."companyId",
    rp."year",
    es.s1_total,
    es.s2_mb,
    es.s2_lb,
    es.s2_unknown,
    es.scope3_total,
    es.scope3_categories_sum,
    t."value" AS turnover_value,
    t."currency" AS turnover_currency
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
    rwc.scope3_total,
    rwc.scope3_categories_sum,
    rwc.turnover_value,
    rwc.turnover_currency,
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
    "wikidataId",
    MAX("sectorName") AS sector_name,
    MAX("industryName") AS industry_name,
    MAX(CASE WHEN year = '2024' THEN s1_total END) AS s1_2024,
    MAX(CASE WHEN year = '2024' THEN s2_mb END) AS s2_mb_2024,
    MAX(CASE WHEN year = '2024' THEN s2_lb END) AS s2_lb_2024,
    MAX(CASE WHEN year = '2024' THEN s2_unknown END) AS s2_unknown_2024,
    MAX(CASE WHEN year = '2024' THEN scope3_total END) AS scope3_total_2024,
    MAX(CASE WHEN year = '2024' THEN scope3_categories_sum END) AS scope3_sum_2024,
    MAX(CASE WHEN year = '2024' THEN turnover_value END) AS turnover_2024,
    MAX(CASE WHEN year = '2024' THEN turnover_currency END) AS turnover_currency_2024
  FROM company_years
  WHERE "wikidataId" != 'Q1671804'  -- Exclude Investor company
  GROUP BY company_name, "wikidataId"
),
companies_with_data AS (
  SELECT
    company_name,
    "wikidataId",
    sector_name,
    industry_name,
    turnover_2024,
    turnover_currency_2024,
    -- Calculate 2024 total emissions (stated) - including s2_unknown
    (COALESCE(s1_2024,0) + COALESCE(NULLIF(s2_mb_2024,0), s2_lb_2024, 0) + COALESCE(s2_unknown_2024,0) + COALESCE(scope3_total_2024,0)) AS total_2024_stated,
    -- Calculate 2024 total emissions (summed) - including s2_unknown
    (COALESCE(s1_2024,0) + COALESCE(NULLIF(s2_mb_2024,0), s2_lb_2024, 0) + COALESCE(s2_unknown_2024,0) + COALESCE(scope3_sum_2024,0)) AS total_2024_summed
  FROM pivoted
),
-- Main data: companies with both turnover and emissions data
main_data AS (
  SELECT
    turnover_currency_2024 AS currency,
    COUNT(*) AS company_count,
    SUM(turnover_2024) AS turnover_total,
    SUM(GREATEST(total_2024_stated, total_2024_summed)) AS emissions_total
  FROM companies_with_data
  WHERE 
    -- Companies with turnover data for 2024
    turnover_2024 IS NOT NULL 
    AND turnover_2024 > 0
    -- Companies with emissions data for 2024 (either stated or summed)
    AND (total_2024_stated > 0 OR total_2024_summed > 0)
  GROUP BY turnover_currency_2024
),
-- Companies with turnover but no emissions data
turnover_no_emissions AS (
  SELECT
    turnover_currency_2024 AS currency,
    COUNT(*) AS company_count,
    SUM(turnover_2024) AS turnover_total,
    0 AS emissions_total
  FROM companies_with_data
  WHERE 
    -- Companies with turnover data for 2024
    turnover_2024 IS NOT NULL 
    AND turnover_2024 > 0
    -- Companies with NO emissions data for 2024 (both stated and summed are 0 or null)
    AND (total_2024_stated = 0 OR total_2024_stated IS NULL)
    AND (total_2024_summed = 0 OR total_2024_summed IS NULL)
  GROUP BY turnover_currency_2024
),
-- Companies with emissions but no turnover data
emissions_no_turnover AS (
  SELECT
    'N/A' AS currency,
    COUNT(*) AS company_count,
    0 AS turnover_total,
    SUM(GREATEST(total_2024_stated, total_2024_summed)) AS emissions_total
  FROM companies_with_data
  WHERE 
    -- Companies with NO turnover data for 2024
    (turnover_2024 IS NULL OR turnover_2024 = 0)
    -- Companies with emissions data for 2024 (either stated or summed)
    AND (total_2024_stated > 0 OR total_2024_summed > 0)
),
-- Companies with neither turnover nor emissions data
no_data AS (
  SELECT
    'N/A' AS currency,
    COUNT(*) AS company_count,
    0 AS turnover_total,
    0 AS emissions_total
  FROM companies_with_data
  WHERE 
    -- Companies with NO turnover data for 2024
    (turnover_2024 IS NULL OR turnover_2024 = 0)
    -- Companies with NO emissions data for 2024 (both stated and summed are 0 or null)
    AND (total_2024_stated = 0 OR total_2024_stated IS NULL)
    AND (total_2024_summed = 0 OR total_2024_summed IS NULL)
)
-- Combine all results
SELECT 
  currency,
  company_count,
  turnover_total,
  emissions_total,
  0 AS sort_order
FROM main_data

UNION ALL

SELECT 
  currency,
  company_count,
  turnover_total,
  emissions_total,
  1 AS sort_order
FROM turnover_no_emissions

UNION ALL

SELECT 
  currency,
  company_count,
  turnover_total,
  emissions_total,
  2 AS sort_order
FROM emissions_no_turnover

UNION ALL

SELECT 
  currency,
  company_count,
  turnover_total,
  emissions_total,
  3 AS sort_order
FROM no_data

ORDER BY 
  sort_order,
  currency;
