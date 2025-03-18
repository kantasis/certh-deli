TRUNCATE TABLE spain_incidence_by_crc_tbl;

COPY spain_incidence_by_crc_tbl(
    "Region",
    "Year",
    "Value",
    "Sex",
    "Age_Group"
)
FROM '/tmp/spain_regions_Incidence_by _CRC.csv'
DELIMITER ','
CSV HEADER;
