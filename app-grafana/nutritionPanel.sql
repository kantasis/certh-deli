SELECT
   "Country",
   AVG("Diet low in whole grains${factor_filter}") AS "Diet low in whole grains",
   AVG("Diet low in milk${factor_filter}") AS "Diet low in milk",
   AVG("Diet high in red meat${factor_filter}") AS "Diet high in red meat",
   AVG("Diet low in calcium${factor_filter}") AS "Diet low in calcium",
   AVG("Diet low in fiber${factor_filter}") AS "Diet low in fiber",
   AVG("Diet high in processed meat${factor_filter}") AS "Diet high in processed meat"
   -- AVG("Diet low in fruits${factor_filter}") AS "Diet low in fruits",
   -- AVG("Diet low in vegetables${factor_filter}") AS "Diet low in vegetables",
FROM data_tbl
WHERE true
   AND "Country" IN ('Greece', 'Romania', 'Lithuania', 'Belgium', 'Italy', 'Spain')
   AND "Year" BETWEEN ${minyear_filter} AND ${maxyear_filter}
   AND "age" = 'Age-standardized'
GROUP BY "Country"
ORDER BY 1
;