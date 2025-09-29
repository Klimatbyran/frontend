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
company_years AS (
  SELECT
    c."name" AS company_name,
    rwc."year",
    rwc.s1_total,
    rwc.s2_mb,
    rwc.s2_lb,
    rwc.scope3_total,
    rwc.scope3_categories_sum,
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
    MAX(CASE WHEN year = '2023' THEN s1_total END) AS s1_2023,
    MAX(CASE WHEN year = '2023' THEN s2_mb END) AS s2_mb_2023,
    MAX(CASE WHEN year = '2023' THEN s2_lb END) AS s2_lb_2023,
    MAX(CASE WHEN year = '2023' THEN scope3_total END) AS scope3_total_2023,
    MAX(CASE WHEN year = '2023' THEN scope3_categories_sum END) AS scope3_sum_2023,
    MAX(CASE WHEN year = '2023' THEN revenue_value END) AS revenue_2023,
    MAX(CASE WHEN year = '2023' THEN revenue_currency END) AS revenue_currency_2023,
    MAX(CASE WHEN year = '2024' THEN s1_total END) AS s1_2024,
    MAX(CASE WHEN year = '2024' THEN s2_mb END) AS s2_mb_2024,
    MAX(CASE WHEN year = '2024' THEN s2_lb END) AS s2_lb_2024,
    MAX(CASE WHEN year = '2024' THEN scope3_total END) AS scope3_total_2024,
    MAX(CASE WHEN year = '2024' THEN scope3_categories_sum END) AS scope3_sum_2024,
    MAX(CASE WHEN year = '2024' THEN revenue_value END) AS revenue_2024,
    MAX(CASE WHEN year = '2024' THEN revenue_currency END) AS revenue_currency_2024
  FROM company_years
  GROUP BY company_name
)
SELECT
  company_name,
  -- missing 2024 data yes/no
  CASE 
    WHEN s1_2024 IS NULL AND s2_mb_2024 IS NULL AND s2_lb_2024 IS NULL AND scope3_total_2024 IS NULL 
    THEN 'Yes' 
    ELSE 'No' 
  END AS missing_2024_data,
  -- industry information
  sector_name,
  industry_name,
  -- 2024 total (stated)
  (COALESCE(s1_2024,0) + COALESCE(NULLIF(s2_mb_2024,0), s2_lb_2024, 0) + COALESCE(scope3_total_2024,0)) AS total_2024_stated,
  -- 2024 total (summed)
  (COALESCE(s1_2024,0) + COALESCE(NULLIF(s2_mb_2024,0), s2_lb_2024, 0) + COALESCE(scope3_sum_2024,0)) AS total_2024_summed,
  -- revenue 2024
  revenue_2024,
  revenue_currency_2024,
  -- revenue intensity 2024 (emissions per revenue unit)
  CASE 
    WHEN revenue_2024 IS NOT NULL AND revenue_2024 > 0 
    THEN ROUND(
      ((COALESCE(s1_2024,0) + COALESCE(NULLIF(s2_mb_2024,0), s2_lb_2024, 0) + COALESCE(scope3_total_2024,0)) / revenue_2024)::numeric, 
      6
    )
    ELSE NULL 
  END AS revenue_intensity_2024_stated,
  CASE 
    WHEN revenue_2024 IS NOT NULL AND revenue_2024 > 0 
    THEN ROUND(
      ((COALESCE(s1_2024,0) + COALESCE(NULLIF(s2_mb_2024,0), s2_lb_2024, 0) + COALESCE(scope3_sum_2024,0)) / revenue_2024)::numeric, 
      6
    )
    ELSE NULL 
  END AS revenue_intensity_2024_summed
FROM pivoted
-- order by sector name, then by summed emissions (descending)
ORDER BY sector_name, total_2024_summed DESC NULLS LAST; 