SELECT
   "Country",
   count(id) as "Value"
FROM policies_tbl
WHERE true
   AND "Policy" = '${policy_filter}'
GROUP BY "Country", "Policy"
;
