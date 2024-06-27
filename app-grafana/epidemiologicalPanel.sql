
SELECT 
   *
FROM crosstab('
   SELECT 
      "Year" as year_str,
      "Country" as country_str,
      AVG("CRC_incidence_val_Rate") as values_f
   FROM data_tbl 
   WHERE true
      AND "Year" BETWEEN ${minyear_filter} AND ${maxyear_filter}
      AND "age" = ''Age-standardized''
      AND "Country" IN (''Belgium'', ''Greece'', ''Italy'', ''Lithuania'', ''Romania'', ''Spain'')
   GROUP BY
      "Country",
      "Year"
   ORDER BY 1, 2
',
'
SELECT 
   *
FROM ( VALUES 
   (''Belgium''), (''Greece''), (''Italy''), (''Lithuania''), (''Romania''), (''Spain'')
)
'
) AS ct (
   "Year" INT,
   "Belgium" DOUBLE PRECISION,
   "Greece" DOUBLE PRECISION,
   "Italy" DOUBLE PRECISION,
   "Lithuania" DOUBLE PRECISION,
   "Romania" DOUBLE PRECISION,
   "Spain" DOUBLE PRECISION
)
ORDER BY ct."Year"
;

