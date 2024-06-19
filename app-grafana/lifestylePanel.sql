SELECT
   "Country",
   AVG("Alcohol use SEV_val") AS "Alcohol use SEV_val",
   AVG("Smoking SEV_val") AS "Smoking SEV_val",
   AVG("Low physical activity SEV_val") AS "Low physical activity SEV_val",
   AVG("High body-mass index SEV_val") AS "High body-mass index SEV_val"
FROM data_tbl
WHERE true
   AND "Country" IN ('Greece', 'Romania', 'Lithuania', 'Belgium', 'Italy', 'Spain')
   AND "Year" BETWEEN ${minyear_filter} AND ${maxyear_filter}
   AND "age" = 'Age-standardized'

GROUP BY "Country"
ORDER BY 1
;
