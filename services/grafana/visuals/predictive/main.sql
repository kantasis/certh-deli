SELECT 
   *
FROM predictive_tbl
WHERE true
-- AND "Year Lag" = '1'
   AND "Risk Factor" = '${riskFactor_filter}'
;