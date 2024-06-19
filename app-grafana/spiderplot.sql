SELECT
   "Country",
   AVG("Diet low in whole grains SEV_val") AS "Diet low in whole grains SEV_val",
   AVG("Diet low in milk SEV_val") AS "Diet low in milk SEV_val",
   AVG("Diet high in red meat SEV_val") AS "Diet high in red meat SEV_val",
   AVG("Diet low in calcium SEV_val") AS "Diet low in calcium SEV_val",
   AVG("Diet low in fiber SEV_val") AS "Diet low in fiber SEV_val",
   AVG("Diet high in processed meat SEV_val") AS "Diet high in processed meat SEV_val",
   AVG("Diet low in fruits SEV_val") AS "Diet low in fruits SEV_val",
   AVG("Diet low in vegetables SEV_val") AS "Diet low in vegetables SEV_val"
FROM data_tbl
WHERE true
   AND "Country" IN ('Greece', 'Romania', 'Lithuania', 'Belgium', 'Italy', 'Spain')
   AND "Year" BETWEEN ${minyear_filter} AND ${maxyear_filter}
   AND "age" = 'Age-standardized'

GROUP BY "Country"
ORDER BY 1
;