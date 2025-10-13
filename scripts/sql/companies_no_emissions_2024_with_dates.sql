-- Query to find companies with no reported emissions data for 2024
-- Returns companies with zero or null emissions across all scopes for 2024
-- Includes turnover, currency, and latest reporting period start/end dates
-- Shows split year reporting cases where start and end dates span different years

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
    rp."startDate",
    rp."endDate",
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
    rwc."startDate",
    rwc."endDate",
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
    MAX(CASE WHEN year = '2024' THEN turnover_currency END) AS turnover_currency_2024,
    -- Get the latest reporting period dates (most recent endDate)
    (SELECT "startDate" FROM company_years cy2 
     WHERE cy2."wikidataId" = company_years."wikidataId" 
     AND cy2."endDate" IS NOT NULL
     ORDER BY cy2."endDate" DESC LIMIT 1) AS latest_start_date,
    (SELECT "endDate" FROM company_years cy2 
     WHERE cy2."wikidataId" = company_years."wikidataId" 
     AND cy2."endDate" IS NOT NULL
     ORDER BY cy2."endDate" DESC LIMIT 1) AS latest_end_date
  FROM company_years
  WHERE "wikidataId" != 'Q1671804'  -- Exclude Investor company
  GROUP BY company_name, "wikidataId"
)
SELECT
  company_name,
  -- missing 2024 data yes/no
  CASE 
    WHEN s1_2024 IS NULL AND s2_mb_2024 IS NULL AND s2_lb_2024 IS NULL AND s2_unknown_2024 IS NULL AND scope3_total_2024 IS NULL 
    THEN 'Yes' 
    ELSE 'No' 
  END AS missing_2024_data,
  -- industry information
  sector_name,
  industry_name,
  -- 2024 total (stated) - including s2_unknown
  (COALESCE(s1_2024,0) + COALESCE(NULLIF(s2_mb_2024,0), s2_lb_2024, 0) + COALESCE(s2_unknown_2024,0) + COALESCE(scope3_total_2024,0)) AS total_2024_stated,
  -- 2024 total (summed) - including s2_unknown
  (COALESCE(s1_2024,0) + COALESCE(NULLIF(s2_mb_2024,0), s2_lb_2024, 0) + COALESCE(s2_unknown_2024,0) + COALESCE(scope3_sum_2024,0)) AS total_2024_summed,
  -- turnover 2024
  turnover_2024,
  turnover_currency_2024,
  -- latest reporting period dates
  latest_start_date,
  latest_end_date,
  -- show if this is split year reporting
  CASE 
    WHEN latest_start_date IS NOT NULL AND latest_end_date IS NOT NULL 
    AND EXTRACT(YEAR FROM latest_start_date) != EXTRACT(YEAR FROM latest_end_date)
    THEN 'Yes'
    ELSE 'No'
  END AS is_split_year_reporting
FROM pivoted
WHERE 
  -- Filter for companies with no emissions data in 2024 (both stated and summed totals are 0 or null)
  -- Including s2_unknown in the calculation
  (COALESCE(s1_2024,0) + COALESCE(NULLIF(s2_mb_2024,0), s2_lb_2024, 0) + COALESCE(s2_unknown_2024,0) + COALESCE(scope3_total_2024,0)) = 0
  AND 
  (COALESCE(s1_2024,0) + COALESCE(NULLIF(s2_mb_2024,0), s2_lb_2024, 0) + COALESCE(s2_unknown_2024,0) + COALESCE(scope3_sum_2024,0)) = 0
-- order by sector name, then by company name
ORDER BY sector_name, company_name;
