-- Single row: sum of the last four columns from small_cap_2024_totals for all small caps in 2024.
-- Same filters as small_cap_2024_totals.sql (excludes Folksam).
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
    s12."total" AS scope1and2_total,
    (SELECT se."total" FROM "StatedTotalEmissions" se WHERE s3."id" = se."scope3Id") AS scope3_stated_total,
    (SELECT ste."total" FROM "StatedTotalEmissions" ste WHERE ste."emissionsId" = e."id" AND ste."scope3Id" IS NULL LIMIT 1) AS stated_total_emissions,
    sp.Scope3_cat_1, sp.Scope3_cat_2, sp.Scope3_cat_3, sp.Scope3_cat_4,
    sp.Scope3_cat_5, sp.Scope3_cat_6, sp.Scope3_cat_7, sp.Scope3_cat_8,
    sp.Scope3_cat_9, sp.Scope3_cat_10, sp.Scope3_cat_11, sp.Scope3_cat_12,
    sp.Scope3_cat_13, sp.Scope3_cat_14, sp.Scope3_cat_15, sp.Scope3_cat_16
  FROM "Emissions" e
  LEFT JOIN "Scope1" s1 ON e."id" = s1."emissionsId"
  LEFT JOIN "Scope2" s2 ON e."id" = s2."emissionsId"
  LEFT JOIN "Scope1And2" s12 ON e."id" = s12."emissionsId"
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
    es.scope1and2_total,
    es.scope3_stated_total,
    es.stated_total_emissions,
    es.Scope3_cat_1, es.Scope3_cat_2, es.Scope3_cat_3, es.Scope3_cat_4,
    es.Scope3_cat_5, es.Scope3_cat_6, es.Scope3_cat_7, es.Scope3_cat_8,
    es.Scope3_cat_9, es.Scope3_cat_10, es.Scope3_cat_11, es.Scope3_cat_12,
    es.Scope3_cat_13, es.Scope3_cat_14, es.Scope3_cat_15, es.Scope3_cat_16
  FROM "public"."ReportingPeriod" rp
  LEFT JOIN emissions_with_scopes es ON rp."id" = es."reportingPeriodId"
),
small_cap_2024 AS (
  SELECT
    (
      CASE
        WHEN (rwc.s1_total IS NOT NULL OR rwc.s2_mb IS NOT NULL OR rwc.s2_lb IS NOT NULL OR rwc.s2_unknown IS NOT NULL)
        THEN COALESCE(rwc.s1_total, 0) + COALESCE(NULLIF(rwc.s2_mb, 0), rwc.s2_lb, rwc.s2_unknown, 0)
        ELSE COALESCE(rwc.scope1and2_total, 0)
      END
      + COALESCE(rwc.scope3_stated_total, 0)
    ) AS scope_1_2_stated_scope3,
    (
      CASE
        WHEN (rwc.s1_total IS NOT NULL OR rwc.s2_mb IS NOT NULL OR rwc.s2_lb IS NOT NULL OR rwc.s2_unknown IS NOT NULL)
        THEN COALESCE(rwc.s1_total, 0) + COALESCE(NULLIF(rwc.s2_mb, 0), rwc.s2_lb, rwc.s2_unknown, 0)
        ELSE COALESCE(rwc.scope1and2_total, 0)
      END
      + COALESCE(rwc.Scope3_cat_1, 0) + COALESCE(rwc.Scope3_cat_2, 0) + COALESCE(rwc.Scope3_cat_3, 0) + COALESCE(rwc.Scope3_cat_4, 0)
      + COALESCE(rwc.Scope3_cat_5, 0) + COALESCE(rwc.Scope3_cat_6, 0) + COALESCE(rwc.Scope3_cat_7, 0) + COALESCE(rwc.Scope3_cat_8, 0)
      + COALESCE(rwc.Scope3_cat_9, 0) + COALESCE(rwc.Scope3_cat_10, 0) + COALESCE(rwc.Scope3_cat_11, 0) + COALESCE(rwc.Scope3_cat_12, 0)
      + COALESCE(rwc.Scope3_cat_13, 0) + COALESCE(rwc.Scope3_cat_14, 0) + COALESCE(rwc.Scope3_cat_15, 0) + COALESCE(rwc.Scope3_cat_16, 0)
    ) AS scope_1_2_summed_scope3_cat,
    rwc.stated_total_emissions AS stated_total,
    GREATEST(
      (
        CASE
          WHEN (rwc.s1_total IS NOT NULL OR rwc.s2_mb IS NOT NULL OR rwc.s2_lb IS NOT NULL OR rwc.s2_unknown IS NOT NULL)
          THEN COALESCE(rwc.s1_total, 0) + COALESCE(NULLIF(rwc.s2_mb, 0), rwc.s2_lb, rwc.s2_unknown, 0)
          ELSE COALESCE(rwc.scope1and2_total, 0)
        END
        + COALESCE(rwc.scope3_stated_total, 0)
      ),
      (
        CASE
          WHEN (rwc.s1_total IS NOT NULL OR rwc.s2_mb IS NOT NULL OR rwc.s2_lb IS NOT NULL OR rwc.s2_unknown IS NOT NULL)
          THEN COALESCE(rwc.s1_total, 0) + COALESCE(NULLIF(rwc.s2_mb, 0), rwc.s2_lb, rwc.s2_unknown, 0)
          ELSE COALESCE(rwc.scope1and2_total, 0)
        END
        + COALESCE(rwc.Scope3_cat_1, 0) + COALESCE(rwc.Scope3_cat_2, 0) + COALESCE(rwc.Scope3_cat_3, 0) + COALESCE(rwc.Scope3_cat_4, 0)
        + COALESCE(rwc.Scope3_cat_5, 0) + COALESCE(rwc.Scope3_cat_6, 0) + COALESCE(rwc.Scope3_cat_7, 0) + COALESCE(rwc.Scope3_cat_8, 0)
        + COALESCE(rwc.Scope3_cat_9, 0) + COALESCE(rwc.Scope3_cat_10, 0) + COALESCE(rwc.Scope3_cat_11, 0) + COALESCE(rwc.Scope3_cat_12, 0)
        + COALESCE(rwc.Scope3_cat_13, 0) + COALESCE(rwc.Scope3_cat_14, 0) + COALESCE(rwc.Scope3_cat_15, 0) + COALESCE(rwc.Scope3_cat_16, 0)
      ),
      COALESCE(rwc.stated_total_emissions, 0)
    ) AS largest_of_three
  FROM reporting_with_company rwc
  JOIN "Company" c ON rwc."companyId" = c."wikidataId"
  WHERE (c.tags IS NULL OR (NOT ('mid-cap' = ANY(c.tags)) AND NOT ('large-cap' = ANY(c.tags))))
    AND rwc."year" = '2024'
    AND c."name" != 'Folksam'
)
SELECT
  SUM(scope_1_2_stated_scope3)    AS sum_scope_1_2_stated_scope3,
  SUM(scope_1_2_summed_scope3_cat) AS sum_scope_1_2_summed_scope3_cat,
  SUM(stated_total)               AS sum_stated_total,
  SUM(largest_of_three)           AS sum_largest_of_three
FROM small_cap_2024;
