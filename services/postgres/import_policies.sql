COPY policies_tbl(
   "Country",
   "Policy",
   "Type",
   "Comment"
)
FROM '/tmp/policies.csv'
DELIMITER ','
CSV HEADER
;
