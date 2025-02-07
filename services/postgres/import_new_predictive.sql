TRUNCATE TABLE predictive_new_tbl;

COPY predictive_new_tbl(
   "Risk Factor",
   "Year Lag",
   "Coefficient",
   "CI Lower",
   "CI Upper"

)
FROM '/tmp/new_predictive.csv'
WITH (
   FORMAT csv,
   HEADER true,
   DELIMITER ',',
   NULL ''
);
