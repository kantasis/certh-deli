SELECT 
   "Year",
   MAX(CASE WHEN "Country" = 'Greece' THEN "CRC_incidence_val_Percent" END) as "Greece",
   MAX(CASE WHEN "Country" = 'France' THEN "CRC_incidence_val_Percent" END) as "France",
   MAX(CASE WHEN "Country" = 'Germany' THEN "CRC_incidence_val_Percent" END) as "Germany"
FROM data_tbl
WHERE age='Age-standardized'
   and "Country" in ( 'Greece', 'France', 'Germany')
group by "Year"
ORDER BY "Year"
