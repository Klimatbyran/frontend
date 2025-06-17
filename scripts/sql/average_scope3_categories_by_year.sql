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
    MAX(CASE WHEN "category" = '15' THEN "total" END) AS Scope3_cat_15
  FROM "public"."Scope3Category"
  GROUP BY "scope3Id"
),
emissions_with_scopes AS (
  SELECT
    e."id" AS emissions_id,
    e."reportingPeriodId",
    s3."id" AS scope3_id,
    sp.*
  FROM "Emissions" e
  LEFT JOIN "Scope3" s3 ON e."id" = s3."emissionsId"
  LEFT JOIN Scope3_pivot sp ON s3."id" = sp."scope3Id"
),
reporting_with_company AS (
  SELECT
    rp."companyId",
    rp."year",
    es.Scope3_cat_1, es.Scope3_cat_2, es.Scope3_cat_3, es.Scope3_cat_4, es.Scope3_cat_5, es.Scope3_cat_6, es.Scope3_cat_7, es.Scope3_cat_8, es.Scope3_cat_9, es.Scope3_cat_10, es.Scope3_cat_11, es.Scope3_cat_12, es.Scope3_cat_13, es.Scope3_cat_14, es.Scope3_cat_15
  FROM "public"."ReportingPeriod" rp
  LEFT JOIN emissions_with_scopes es ON rp."id" = es."reportingPeriodId"
),
company_years AS (
  SELECT
    "companyId",
    "year",
    (
      (CASE WHEN Scope3_cat_1 > 0 THEN 1 ELSE 0 END) +
      (CASE WHEN Scope3_cat_2 > 0 THEN 1 ELSE 0 END) +
      (CASE WHEN Scope3_cat_3 > 0 THEN 1 ELSE 0 END) +
      (CASE WHEN Scope3_cat_4 > 0 THEN 1 ELSE 0 END) +
      (CASE WHEN Scope3_cat_5 > 0 THEN 1 ELSE 0 END) +
      (CASE WHEN Scope3_cat_6 > 0 THEN 1 ELSE 0 END) +
      (CASE WHEN Scope3_cat_7 > 0 THEN 1 ELSE 0 END) +
      (CASE WHEN Scope3_cat_8 > 0 THEN 1 ELSE 0 END) +
      (CASE WHEN Scope3_cat_9 > 0 THEN 1 ELSE 0 END) +
      (CASE WHEN Scope3_cat_10 > 0 THEN 1 ELSE 0 END) +
      (CASE WHEN Scope3_cat_11 > 0 THEN 1 ELSE 0 END) +
      (CASE WHEN Scope3_cat_12 > 0 THEN 1 ELSE 0 END) +
      (CASE WHEN Scope3_cat_13 > 0 THEN 1 ELSE 0 END) +
      (CASE WHEN Scope3_cat_14 > 0 THEN 1 ELSE 0 END) +
      (CASE WHEN Scope3_cat_15 > 0 THEN 1 ELSE 0 END)
    ) AS num_scope3_cats_gt0
  FROM reporting_with_company
),
companies_with_both_years AS (
  SELECT "companyId"
  FROM company_years
  WHERE "year" = '2023'
  INTERSECT
  SELECT "companyId"
  FROM company_years
  WHERE "year" = '2024'
)
SELECT
  ROUND(AVG(CASE WHEN cy."year" = '2023' THEN cy.num_scope3_cats_gt0::numeric END), 2) AS avg_scope3_cats_2023,
  ROUND(AVG(CASE WHEN cy."year" = '2024' THEN cy.num_scope3_cats_gt0::numeric END), 2) AS avg_scope3_cats_2024
FROM company_years cy
WHERE cy."companyId" IN (SELECT "companyId" FROM companies_with_both_years)
  AND cy."year" IN ('2023', '2024'); 