COPY policies_tbl(
   "Country",
   "Value",
   "Policy"
)
FROM '/tmp/policy_data.csv'
DELIMITER ','
CSV HEADER
;
