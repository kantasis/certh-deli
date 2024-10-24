SELECT
   "Country",
   "Type"
FROM policies_tbl
WHERE true
   AND "Policy" = '${policy_filter}'
;
