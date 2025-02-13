SELECT
   "Country",
   AVG("Alcohol use_${factor_filter}") AS "Alcohol Use",
   AVG("Smoking_${factor_filter}") AS "Smoking",
   AVG("Low physical activity_${factor_filter}") AS "Low Physical Activity",
   AVG("High body-mass index_${factor_filter}") AS "High Body-Mass Index"
FROM data_tbl
WHERE true
   AND "Country" IN ('Greece', 'Romania', 'Lithuania', 'Belgium', 'Italy', 'Spain')
   AND "Year" BETWEEN ${minyear_filter} AND ${maxyear_filter}
   AND "age" = 'Age-standardized'
GROUP BY "Country"
ORDER BY 1
;
