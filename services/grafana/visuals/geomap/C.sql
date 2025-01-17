SELECT
   "Country",
   coalesce("Comment", 'None') as "Comment"
FROM policies_tbl
WHERE true
   AND "Type" = 'Best Practices'
   AND "Policy" = '${policy_filter}'
   AND "Comment" != ''
;
