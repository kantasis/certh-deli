
SELECT 
   *
FROM crosstab('
   SELECT 
      year_str, 
      country_str, 
      values_f 
   FROM prepivot_view 
   WHERE year_str BETWEEN ${minyear_filter} AND ${maxyear_filter}
   ORDER BY 1, 2
') AS ct (
   "Year" INT,
   "Greece" DOUBLE PRECISION,
   "Romania" DOUBLE PRECISION,
   "Lithuania" DOUBLE PRECISION,
   "Belgium" DOUBLE PRECISION,
   "Italy" DOUBLE PRECISION,
   "Spain" DOUBLE PRECISION
)

ORDER BY ct."Year"
;
