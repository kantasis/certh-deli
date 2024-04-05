SELECT
   AVG("CRC_incidence_val_Percent") as values_f,
   "Country" as country_str
FROM
   data_tbl
GROUP BY
   "Country"
having AVG("CRC_incidence_val_Percent") is not null
LIMIT
   6
;