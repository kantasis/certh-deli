COPY policies_tbl(
   "Country",
   "Value",
   "Policy"
)
FROM '/shared/policy_data.csv'
DELIMITER ','
CSV HEADER
;
