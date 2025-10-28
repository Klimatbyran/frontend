-- Company Goals with Emissions Data and Progress Tracking
-- This query shows all companies with their goals, base year emissions, latest emissions, and progress tracking
-- Structure: One row per goal per company (many-to-one relationship handled by showing all goals)

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
    rp."endDate",
    EXTRACT(YEAR FROM rp."endDate") AS reporting_year,
    es.s1_total,
    es.s2_mb,
    es.s2_lb,
    es.s2_unknown,
    es.scope3_total,
    es.scope3_categories_sum
  FROM "public"."ReportingPeriod" rp
  LEFT JOIN emissions_with_scopes es ON rp."id" = es."reportingPeriodId"
),
company_emissions_by_year AS (
  SELECT
    c."name" AS company_name,
    c."wikidataId",
    rwc.reporting_year,
    -- Scope 1 emissions
    COALESCE(rwc.s1_total,0) AS scope1_emissions,
    -- Scope 2 emissions (prefer market-based, fallback to location-based)
    COALESCE(NULLIF(rwc.s2_mb,0), rwc.s2_lb, 0) + COALESCE(rwc.s2_unknown,0) AS scope2_emissions,
    -- Scope 3 emissions (prefer calculated over stated, fallback to stated if calculated is null/0)
    CASE 
      WHEN COALESCE(rwc.scope3_categories_sum,0) > 0 THEN rwc.scope3_categories_sum
      ELSE COALESCE(rwc.scope3_total,0)
    END AS scope3_emissions,
    -- Calculate total emissions (prefer calculated over stated, fallback to stated if calculated is null/0)
    CASE 
      WHEN (COALESCE(rwc.s1_total,0) + COALESCE(NULLIF(rwc.s2_mb,0), rwc.s2_lb, 0) + COALESCE(rwc.scope3_categories_sum,0)) > 0
      THEN (COALESCE(rwc.s1_total,0) + COALESCE(NULLIF(rwc.s2_mb,0), rwc.s2_lb, 0) + COALESCE(rwc.scope3_categories_sum,0))
      ELSE (COALESCE(rwc.s1_total,0) + COALESCE(NULLIF(rwc.s2_mb,0), rwc.s2_lb, 0) + COALESCE(rwc.scope3_total,0))
    END AS total_emissions_calculated,
    -- Stated total emissions
    (COALESCE(rwc.s1_total,0) + COALESCE(NULLIF(rwc.s2_mb,0), rwc.s2_lb, 0) + COALESCE(rwc.scope3_total,0)) AS total_emissions_stated
  FROM reporting_with_company rwc
  LEFT JOIN "Company" c ON rwc."companyId" = c."wikidataId"
  WHERE rwc.reporting_year IS NOT NULL
),
-- Get all companies (including those without goals)
all_companies AS (
  SELECT DISTINCT "wikidataId", "name" FROM "Company"
),
-- Get latest reporting year for each company
company_latest_year AS (
  SELECT 
    "wikidataId",
    MAX(reporting_year) AS latest_year
  FROM company_emissions_by_year
  WHERE reporting_year IS NOT NULL
  GROUP BY "wikidataId"
),
-- Get emissions for latest year for each company (one row per company)
company_latest_emissions AS (
  SELECT DISTINCT
    cey."wikidataId",
    cey."company_name",
    cly.latest_year,
    -- Latest year emissions (take the first non-null value for consistency)
    FIRST_VALUE(cey.total_emissions_calculated) OVER (
      PARTITION BY cey."wikidataId" 
      ORDER BY CASE WHEN cey.total_emissions_calculated > 0 THEN 0 ELSE 1 END, cey.reporting_year DESC
    ) AS latest_year_emissions,
    FIRST_VALUE(cey.total_emissions_stated) OVER (
      PARTITION BY cey."wikidataId" 
      ORDER BY CASE WHEN cey.total_emissions_stated > 0 THEN 0 ELSE 1 END, cey.reporting_year DESC
    ) AS latest_year_emissions_stated,
    -- Latest year scope emissions
    FIRST_VALUE(cey.scope1_emissions) OVER (
      PARTITION BY cey."wikidataId" 
      ORDER BY CASE WHEN cey.scope1_emissions > 0 THEN 0 ELSE 1 END, cey.reporting_year DESC
    ) AS latest_year_scope1,
    FIRST_VALUE(cey.scope2_emissions) OVER (
      PARTITION BY cey."wikidataId" 
      ORDER BY CASE WHEN cey.scope2_emissions > 0 THEN 0 ELSE 1 END, cey.reporting_year DESC
    ) AS latest_year_scope2,
    FIRST_VALUE(cey.scope3_emissions) OVER (
      PARTITION BY cey."wikidataId" 
      ORDER BY CASE WHEN cey.scope3_emissions > 0 THEN 0 ELSE 1 END, cey.reporting_year DESC
    ) AS latest_year_scope3
  FROM company_emissions_by_year cey
  LEFT JOIN company_latest_year cly ON cey."wikidataId" = cly."wikidataId"
  WHERE cey.reporting_year = cly.latest_year
),
-- Get base year emissions for each goal (with BaseYear table fallback)
goal_base_year_emissions AS (
  SELECT
    g."id" AS goal_id,
    g."companyId",
    g."baseYear" AS goal_base_year,
    by."year" AS company_base_year,
    -- Use goal base year if available, otherwise fall back to company base year from BaseYear table
    COALESCE(g."baseYear", by."year"::text) AS effective_base_year,
    -- Base year emissions for this specific goal
    MAX(CASE WHEN cey.reporting_year::text = COALESCE(g."baseYear", by."year"::text) THEN cey.total_emissions_calculated END) AS base_year_emissions,
    MAX(CASE WHEN cey.reporting_year::text = COALESCE(g."baseYear", by."year"::text) THEN cey.total_emissions_stated END) AS base_year_emissions_stated,
    -- Base year scope emissions for this specific goal
    MAX(CASE WHEN cey.reporting_year::text = COALESCE(g."baseYear", by."year"::text) THEN cey.scope1_emissions END) AS base_year_scope1,
    MAX(CASE WHEN cey.reporting_year::text = COALESCE(g."baseYear", by."year"::text) THEN cey.scope2_emissions END) AS base_year_scope2,
    MAX(CASE WHEN cey.reporting_year::text = COALESCE(g."baseYear", by."year"::text) THEN cey.scope3_emissions END) AS base_year_scope3
  FROM "Goal" g
  LEFT JOIN "BaseYear" by ON g."companyId" = by."companyId"
  LEFT JOIN company_emissions_by_year cey ON g."companyId" = cey."wikidataId"
  GROUP BY g."id", g."companyId", g."baseYear", by."year"
)
SELECT
  ac."name" AS "Company Name",
  gbye.effective_base_year AS "Base Year",
  CASE 
    WHEN gbye.goal_base_year IS NOT NULL THEN 'Goal'
    WHEN gbye.company_base_year IS NOT NULL THEN 'Company'
    ELSE 'None'
  END AS "Base Year Source",
  g."description" AS "Goal Description", 
  g."target" AS "Target",
  g."year" AS "Year",
  -- Base year emissions (prefer calculated, fallback to stated if calculated is null/0)
  CASE 
    WHEN gbye.base_year_emissions > 0 THEN gbye.base_year_emissions
    WHEN gbye.base_year_emissions_stated > 0 THEN gbye.base_year_emissions_stated
    ELSE NULL
  END AS "Base Year Total Emissions",
  -- Latest year emissions (prefer calculated, fallback to stated if calculated is null/0)
  CASE 
    WHEN cle.latest_year_emissions > 0 THEN cle.latest_year_emissions
    WHEN cle.latest_year_emissions_stated > 0 THEN cle.latest_year_emissions_stated
    ELSE NULL
  END AS "Latest Year Total Emissions",
  cle.latest_year AS "Latest Reporting Year",
  -- Percentage change calculation
  CASE 
    WHEN gbye.base_year_emissions > 0 AND cle.latest_year_emissions IS NOT NULL
    THEN ROUND(100 * ((cle.latest_year_emissions - gbye.base_year_emissions) / gbye.base_year_emissions)::numeric, 2)
    WHEN gbye.base_year_emissions_stated > 0 AND cle.latest_year_emissions_stated IS NOT NULL
    THEN ROUND(100 * ((cle.latest_year_emissions_stated - gbye.base_year_emissions_stated) / gbye.base_year_emissions_stated)::numeric, 2)
    ELSE NULL
  END AS "% Change",
  -- Scope 1 percentage change
  CASE 
    WHEN gbye.base_year_scope1 > 0 AND cle.latest_year_scope1 IS NOT NULL
    THEN ROUND(100 * ((cle.latest_year_scope1 - gbye.base_year_scope1) / gbye.base_year_scope1)::numeric, 2)
    ELSE NULL
  END AS "Scope 1 % Change",
  -- Scope 2 percentage change
  CASE 
    WHEN gbye.base_year_scope2 > 0 AND cle.latest_year_scope2 IS NOT NULL
    THEN ROUND(100 * ((cle.latest_year_scope2 - gbye.base_year_scope2) / gbye.base_year_scope2)::numeric, 2)
    ELSE NULL
  END AS "Scope 2 % Change",
  -- Scope 3 percentage change
  CASE 
    WHEN gbye.base_year_scope3 > 0 AND cle.latest_year_scope3 IS NOT NULL
    THEN ROUND(100 * ((cle.latest_year_scope3 - gbye.base_year_scope3) / gbye.base_year_scope3)::numeric, 2)
    ELSE NULL
  END AS "Scope 3 % Change"
FROM all_companies ac
LEFT JOIN "Goal" g ON ac."wikidataId" = g."companyId"
LEFT JOIN company_latest_emissions cle ON ac."wikidataId" = cle."wikidataId"
LEFT JOIN goal_base_year_emissions gbye ON g."id" = gbye.goal_id
ORDER BY 
  ac."name",
  g."year" NULLS LAST,
  g."baseYear" NULLS LAST;
