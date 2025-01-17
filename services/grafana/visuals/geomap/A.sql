SELECT
   "Country",
   "Type",
   "Comment"
FROM policies_tbl
WHERE true
   AND "Policy" = '${policy_filter}'
   AND "Comment" != ''
;
