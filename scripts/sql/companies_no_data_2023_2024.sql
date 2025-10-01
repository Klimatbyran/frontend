-- Query to find companies with no reported emissions data for 2023 and 2024
-- Returns: company name, sector, industry name, revenue
-- Filters for companies with 0 or null emissions data for 2023 and 2024
-- Ordered by sector name, revenue

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
    es.scope3_total,
    es.scope3_categories_sum,
    t."value" AS revenue_value,
    t."currency" AS revenue_currency
  FROM "public"."ReportingPeriod" rp
  LEFT JOIN emissions_with_scopes es ON rp."id" = es."reportingPeriodId"
  LEFT JOIN "Economy" e ON rp."id" = e."reportingPeriodId"
  LEFT JOIN "Turnover" t ON e."id" = t."economyId"
),
company_emissions_2023_2024 AS (
  SELECT
    c."name" AS company_name,
    c."wikidataId" AS company_id,
    ig."sectorName",
    ig."industryName",
    -- Check if company has any non-null, non-zero emissions data for 2023
    MAX(CASE 
      WHEN rwc."year" = '2023' AND rwc.s1_total IS NOT NULL AND rwc.s1_total > 0 THEN 1 
      ELSE 0 
    END) AS has_scope1_2023,
    MAX(CASE 
      WHEN rwc."year" = '2023' AND ((rwc.s2_mb IS NOT NULL AND rwc.s2_mb > 0) OR (rwc.s2_lb IS NOT NULL AND rwc.s2_lb > 0)) THEN 1 
      ELSE 0 
    END) AS has_scope2_2023,
    MAX(CASE 
      WHEN rwc."year" = '2023' AND rwc.scope3_total IS NOT NULL AND rwc.scope3_total > 0 THEN 1 
      ELSE 0 
    END) AS has_scope3_stated_2023,
    MAX(CASE 
      WHEN rwc."year" = '2023' AND rwc.scope3_categories_sum IS NOT NULL AND rwc.scope3_categories_sum > 0 THEN 1 
      ELSE 0 
    END) AS has_scope3_categories_2023,
    -- Check if company has any non-null, non-zero emissions data for 2024
    MAX(CASE 
      WHEN rwc."year" = '2024' AND rwc.s1_total IS NOT NULL AND rwc.s1_total > 0 THEN 1 
      ELSE 0 
    END) AS has_scope1_2024,
    MAX(CASE 
      WHEN rwc."year" = '2024' AND ((rwc.s2_mb IS NOT NULL AND rwc.s2_mb > 0) OR (rwc.s2_lb IS NOT NULL AND rwc.s2_lb > 0)) THEN 1 
      ELSE 0 
    END) AS has_scope2_2024,
    MAX(CASE 
      WHEN rwc."year" = '2024' AND rwc.scope3_total IS NOT NULL AND rwc.scope3_total > 0 THEN 1 
      ELSE 0 
    END) AS has_scope3_stated_2024,
    MAX(CASE 
      WHEN rwc."year" = '2024' AND rwc.scope3_categories_sum IS NOT NULL AND rwc.scope3_categories_sum > 0 THEN 1 
      ELSE 0 
    END) AS has_scope3_categories_2024,
    -- Get the most recent revenue data
    MAX(rwc.revenue_value) AS revenue,
    MAX(rwc.revenue_currency) AS revenue_currency
  FROM "Company" c
  LEFT JOIN "Industry" i ON c."wikidataId" = i."companyWikidataId"
  LEFT JOIN "IndustryGics" ig ON i."gicsSubIndustryCode" = ig."subIndustryCode"
  LEFT JOIN reporting_with_company rwc ON c."wikidataId" = rwc."companyId"
  GROUP BY c."name", c."wikidataId", ig."sectorName", ig."industryName"
)
SELECT
  company_name,
  "sectorName" AS sector_name,
  "industryName" AS industry_name,
  revenue,
  revenue_currency
FROM company_emissions_2023_2024
WHERE 
  -- Filter for companies with no emissions data for both 2023 and 2024
  (has_scope1_2023 = 0 AND has_scope2_2023 = 0 AND has_scope3_stated_2023 = 0 AND has_scope3_categories_2023 = 0)
  AND 
  (has_scope1_2024 = 0 AND has_scope2_2024 = 0 AND has_scope3_stated_2024 = 0 AND has_scope3_categories_2024 = 0)
  -- Only include companies that have industry information
  AND "sectorName" IS NOT NULL
ORDER BY 
  "sectorName", 
  revenue DESC NULLS LAST;
