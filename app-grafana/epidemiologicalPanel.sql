CREATE EXTENSION IF NOT EXISTS tablefunc;

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
      AND "Country" IN (''Greece'', ''Romania'', ''Lithuania'', ''Belgium'', ''Italy'', ''Spain'')
   GROUP BY
      "Country",
      "Year"
   ORDER BY 1, 2
') AS ct (
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

