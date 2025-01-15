TRUNCATE TABLE predictive_tbl;

COPY predictive_tbl(
   "Risk Factor",
   "Values",
   "Error",
   "Year Lag"
)
FROM '/tmp/predictive.csv'
DELIMITER ','
CSV HEADER
;
