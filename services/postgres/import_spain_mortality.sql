TRUNCATE TABLE spain_mortality_tbl;

COPY spain_mortality_tbl(
	"Region",
	"Year",
	"Value",
	"Sex"
)
FROM '/tmp/final_spain_region_mortality_by_CRC.csv'
DELIMITER ','
CSV HEADER;
