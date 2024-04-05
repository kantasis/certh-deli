SELECT
   -- AVG("Air Pollution Population Weighted Average [ug/m3]_PM2.5"),
   AVG("Air Pollution Population Weighted Average [ug/m3]_PM2.5") as values_f,
   "Country" as country_str
FROM
   data_tbl
GROUP BY
   "Country"
having AVG("Air Pollution Population Weighted Average [ug/m3]_PM2.5") is not null
LIMIT
   15