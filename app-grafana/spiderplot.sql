SELECT 
   AVG("Air Pollution Population Weighted Average [ug/m3]_PM2.5") as averages, 
   MAX("Air Pollution Population Weighted Average [ug/m3]_PM2.5") as maxes,
   "Country" as countries
FROM data_tbl 
GROUP BY countries
HAVING AVG("Air Pollution Population Weighted Average [ug/m3]_PM2.5") IS NOT NULL
ORDER BY AVG("Air Pollution Population Weighted Average [ug/m3]_PM2.5")
LIMIT 15
