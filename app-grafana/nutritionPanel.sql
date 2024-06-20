SELECT
   "Country",
   AVG("Diet low in whole grains_Rate_SEV_val") AS "Diet low in whole grains",
   AVG("Diet low in milk_Rate_SEV_val") AS "Diet low in milk",
   AVG("Diet high in red meat_Rate_SEV_val") AS "Diet high in red meat",
   AVG("Diet low in calcium_Rate_SEV_val") AS "Diet low in calcium",
   AVG("Diet low in fiber_Rate_SEV_val") AS "Diet low in fiber",
   AVG("Diet high in processed meat_Rate_SEV_val") AS "Diet high in processed meat",
   AVG("Diet low in fruits_Rate_SEV_val") AS "Diet low in fruits",
   AVG("Diet low in vegetables_Rate_SEV_val") AS "Diet low in vegetables"
FROM data_tbl
WHERE true
   AND "Country" IN ('Greece', 'Romania', 'Lithuania', 'Belgium', 'Italy', 'Spain')
   AND "Year" BETWEEN ${minyear_filter} AND ${maxyear_filter}
   AND "age" = 'Age-standardized'

GROUP BY "Country"
ORDER BY 1
;