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
reporting_with_prev AS (
  SELECT
    rp.*,
    rp_last."id" AS last_id,
    rp_last."year" AS last_year
  FROM "public"."ReportingPeriod" rp
  LEFT JOIN "public"."ReportingPeriod" rp_last
    ON rp."companyId" = rp_last."companyId"
    AND CAST(rp."year" AS INTEGER) = CAST(rp_last."year" AS INTEGER) + 1
),
emissions_with_scopes AS (
  SELECT
    e."id" AS emissions_id,
    e."reportingPeriodId",
    s1."total" AS s1_total,
    s2."mb" AS s2_mb,
    s2."lb" AS s2_lb,
    (SELECT se."total" FROM "StatedTotalEmissions" se WHERE s3."id" = se."scope3Id") AS scope3_total,
    sp.*
  FROM "Emissions" e
  LEFT JOIN "Scope1" s1 ON e."id" = s1."emissionsId"
  LEFT JOIN "Scope2" s2 ON e."id" = s2."emissionsId"
  LEFT JOIN "Scope3" s3 ON e."id" = s3."emissionsId"
  LEFT JOIN Scope3_pivot sp ON s3."id" = sp."scope3Id"
),
current_emissions AS (
  SELECT rwp."id" AS reporting_id, rwp."companyId", rwp."year", rwp."last_id", es.*
  FROM reporting_with_prev rwp
  LEFT JOIN emissions_with_scopes es ON rwp."id" = es."reportingPeriodId"
),
previous_emissions AS (
  SELECT rwp."last_id" AS reporting_id, rwp."last_year" AS year, es.*
  FROM reporting_with_prev rwp
  LEFT JOIN emissions_with_scopes es ON rwp."last_id" = es."reportingPeriodId"
),
change_rates AS (
  SELECT
    ce.reporting_id,
    ce."companyId",
    ce.year,
    -- Calculate % change
    ROUND(((ce.s1_total - pe.s1_total) / NULLIF(pe.s1_total, 0) )::NUMERIC, 2) AS s1_change_pct,
    ROUND(((ce.s2_mb - pe.s2_mb) / NULLIF(pe.s2_mb, 0) )::NUMERIC, 2) AS s2_mb_change_pct,
    ROUND(((ce.s2_lb - pe.s2_lb) / NULLIF(pe.s2_lb, 0) )::NUMERIC, 2) AS s2_lb_change_pct,
    ROUND(((ce.scope3_total - pe.scope3_total) / NULLIF(pe.scope3_total, 0))::NUMERIC, 2) AS Scope3_change_pct,
    ROUND(((ce.Scope3_cat_1 - pe.Scope3_cat_1) / NULLIF(pe.Scope3_cat_1, 0) )::NUMERIC, 2) AS Scope3_cat_1_change_pct,
    ROUND(((ce.Scope3_cat_2 - pe.Scope3_cat_2) / NULLIF(pe.Scope3_cat_2, 0) )::NUMERIC, 2) AS Scope3_cat_2_change_pct,
    ROUND(((ce.Scope3_cat_3 - pe.Scope3_cat_3) / NULLIF(pe.Scope3_cat_3, 0) )::NUMERIC, 2) AS Scope3_cat_3_change_pct,
    ROUND(((ce.Scope3_cat_4 - pe.Scope3_cat_4) / NULLIF(pe.Scope3_cat_4, 0) )::NUMERIC, 2) AS Scope3_cat_4_change_pct,
    ROUND(((ce.Scope3_cat_5 - pe.Scope3_cat_5) / NULLIF(pe.Scope3_cat_5, 0) )::NUMERIC, 2) AS Scope3_cat_5_change_pct,
    ROUND(((ce.Scope3_cat_6 - pe.Scope3_cat_6) / NULLIF(pe.Scope3_cat_6, 0))::NUMERIC, 2) AS Scope3_cat_6_change_pct,
    ROUND(((ce.Scope3_cat_7 - pe.Scope3_cat_7) / NULLIF(pe.Scope3_cat_7, 0) )::NUMERIC, 2) AS Scope3_cat_7_change_pct,
    ROUND(((ce.Scope3_cat_8 - pe.Scope3_cat_8) / NULLIF(pe.Scope3_cat_8, 0) )::NUMERIC, 2) AS Scope3_cat_8_change_pct,
    ROUND(((ce.Scope3_cat_9 - pe.Scope3_cat_9) / NULLIF(pe.Scope3_cat_9, 0) )::NUMERIC, 2) AS Scope3_cat_9_change_pct,
    ROUND(((ce.Scope3_cat_10 - pe.Scope3_cat_10) / NULLIF(pe.Scope3_cat_10, 0) )::NUMERIC, 2) AS Scope3_cat_10_change_pct,
    ROUND(((ce.Scope3_cat_11 - pe.Scope3_cat_11) / NULLIF(pe.Scope3_cat_11, 0) )::NUMERIC, 2) AS Scope3_cat_11_change_pct,
    ROUND(((ce.Scope3_cat_12 - pe.Scope3_cat_12) / NULLIF(pe.Scope3_cat_12, 0) )::NUMERIC, 2) AS Scope3_cat_12_change_pct,
    ROUND(((ce.Scope3_cat_13 - pe.Scope3_cat_13) / NULLIF(pe.Scope3_cat_13, 0) )::NUMERIC, 2) AS Scope3_cat_13_change_pct,
    ROUND(((ce.Scope3_cat_14 - pe.Scope3_cat_14) / NULLIF(pe.Scope3_cat_14, 0) )::NUMERIC, 2) AS Scope3_cat_14_change_pct,
    ROUND(((ce.Scope3_cat_15 - pe.Scope3_cat_15) / NULLIF(pe.Scope3_cat_15, 0) )::NUMERIC, 2) AS Scope3_cat_15_change_pct,
    ROUND(((ce.Scope3_cat_16 - pe.Scope3_cat_16) / NULLIF(pe.Scope3_cat_16, 0) )::NUMERIC, 2) AS Scope3_cat_16_change_pct
  FROM current_emissions ce
  LEFT JOIN previous_emissions pe ON ce.last_id = pe.reporting_id
  WHERE ce.year = '2024' AND pe.year = '2023'
    -- Only include if both years have data for each field
    AND ce.s1_total IS NOT NULL AND pe.s1_total IS NOT NULL
    AND ce.s2_mb IS NOT NULL AND pe.s2_mb IS NOT NULL
    AND ce.s2_lb IS NOT NULL AND pe.s2_lb IS NOT NULL
    AND ce.scope3_total IS NOT NULL AND pe.scope3_total IS NOT NULL
    AND ce.Scope3_cat_1 IS NOT NULL AND pe.Scope3_cat_1 IS NOT NULL
    AND ce.Scope3_cat_2 IS NOT NULL AND pe.Scope3_cat_2 IS NOT NULL
    AND ce.Scope3_cat_3 IS NOT NULL AND pe.Scope3_cat_3 IS NOT NULL
    AND ce.Scope3_cat_4 IS NOT NULL AND pe.Scope3_cat_4 IS NOT NULL
    AND ce.Scope3_cat_5 IS NOT NULL AND pe.Scope3_cat_5 IS NOT NULL
    AND ce.Scope3_cat_6 IS NOT NULL AND pe.Scope3_cat_6 IS NOT NULL
    AND ce.Scope3_cat_7 IS NOT NULL AND pe.Scope3_cat_7 IS NOT NULL
    AND ce.Scope3_cat_8 IS NOT NULL AND pe.Scope3_cat_8 IS NOT NULL
    AND ce.Scope3_cat_9 IS NOT NULL AND pe.Scope3_cat_9 IS NOT NULL
    AND ce.Scope3_cat_10 IS NOT NULL AND pe.Scope3_cat_10 IS NOT NULL
    AND ce.Scope3_cat_11 IS NOT NULL AND pe.Scope3_cat_11 IS NOT NULL
    AND ce.Scope3_cat_12 IS NOT NULL AND pe.Scope3_cat_12 IS NOT NULL
    AND ce.Scope3_cat_13 IS NOT NULL AND pe.Scope3_cat_13 IS NOT NULL
    AND ce.Scope3_cat_14 IS NOT NULL AND pe.Scope3_cat_14 IS NOT NULL
    AND ce.Scope3_cat_15 IS NOT NULL AND pe.Scope3_cat_15 IS NOT NULL
    AND ce.Scope3_cat_16 IS NOT NULL AND pe.Scope3_cat_16 IS NOT NULL
)
SELECT
  c."name" AS "Company",
  cr.year AS "Year",
  -- Scope 1
  ce.s1_total,
  pe.s1_total AS s1_prev,
  cr.s1_change_pct,
  -- Scope 2
  ce.s2_mb,
  pe.s2_mb AS s2_mb_prev,
  cr.s2_mb_change_pct,
  ce.s2_lb,
  pe.s2_lb AS s2_lb_prev,
  cr.s2_lb_change_pct,
  -- Scope 3
  ce.scope3_total,
  pe.scope3_total AS scope3_prev,
  cr.Scope3_change_pct,
  ce.Scope3_cat_1,
  pe.Scope3_cat_1 AS Scope3_cat_1_prev,
  cr.Scope3_cat_1_change_pct,
  ce.Scope3_cat_2,
  pe.Scope3_cat_2 AS Scope3_cat_2_prev,
  cr.Scope3_cat_2_change_pct,
  ce.Scope3_cat_3,
  pe.Scope3_cat_3 AS Scope3_cat_3_prev,
  cr.Scope3_cat_3_change_pct,
  ce.Scope3_cat_4,
  pe.Scope3_cat_4 AS Scope3_cat_4_prev,
  cr.Scope3_cat_4_change_pct,
  ce.Scope3_cat_5,
  pe.Scope3_cat_5 AS Scope3_cat_5_prev,
  cr.Scope3_cat_5_change_pct,
  ce.Scope3_cat_6,
  pe.Scope3_cat_6 AS Scope3_cat_6_prev,
  cr.Scope3_cat_6_change_pct,
  ce.Scope3_cat_7,
  pe.Scope3_cat_7 AS Scope3_cat_7_prev,
  cr.Scope3_cat_7_change_pct,
  ce.Scope3_cat_8,
  pe.Scope3_cat_8 AS Scope3_cat_8_prev,
  cr.Scope3_cat_8_change_pct,
  ce.Scope3_cat_9,
  pe.Scope3_cat_9 AS Scope3_cat_9_prev,
  cr.Scope3_cat_9_change_pct,
  ce.Scope3_cat_10,
  pe.Scope3_cat_10 AS Scope3_cat_10_prev,
  cr.Scope3_cat_10_change_pct,
  ce.Scope3_cat_11,
  pe.Scope3_cat_11 AS Scope3_cat_11_prev,
  cr.Scope3_cat_11_change_pct,
  ce.Scope3_cat_12,
  pe.Scope3_cat_12 AS Scope3_cat_12_prev,
  cr.Scope3_cat_12_change_pct,
  ce.Scope3_cat_13,
  pe.Scope3_cat_13 AS Scope3_cat_13_prev,
  cr.Scope3_cat_13_change_pct,
  ce.Scope3_cat_14,
  pe.Scope3_cat_14 AS Scope3_cat_14_prev,
  cr.Scope3_cat_14_change_pct,
  ce.Scope3_cat_15,
  pe.Scope3_cat_15 AS Scope3_cat_15_prev,
  cr.Scope3_cat_15_change_pct,
  ce.Scope3_cat_16,
  pe.Scope3_cat_16 AS Scope3_cat_16_prev,
  cr.Scope3_cat_16_change_pct
FROM change_rates cr
LEFT JOIN current_emissions ce ON cr.reporting_id = ce.reporting_id
LEFT JOIN previous_emissions pe ON ce.last_id = pe.reporting_id
LEFT JOIN "Company" c ON ce."companyId" = c."wikidataId"
ORDER BY c."name", cr.year DESC; 