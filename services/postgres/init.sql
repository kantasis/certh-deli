-- DROP DATABASE IF EXISTS deli_db WITH (FORCE);
-- CREATE DATABASE deli_db;
\c deli_db;

CREATE EXTENSION IF NOT EXISTS tablefunc;

-- DROP TABLE IF EXISTS data_tbl;
CREATE TABLE data_tbl (
   id SERIAL PRIMARY KEY,
   "_id" VARCHAR(250),
   "Country" VARCHAR(250),
   "Year" INT,
   "age" VARCHAR(250),
   "CRC_incidence_val_Percent" DOUBLE PRECISION,
   "CRC_incidence_upper_Percent" DOUBLE PRECISION,
   "CRC_incidence_lower_Percent" DOUBLE PRECISION,
   "CRC_incidence_val_Rate" DOUBLE PRECISION,
   "CRC_incidence_upper_Rate" DOUBLE PRECISION,
   "CRC_incidence_lower_Rate" DOUBLE PRECISION,
   "High body-mass index_Number_DALYs_lower" DOUBLE PRECISION,
   "High body-mass index_Number_DALYs_upper" DOUBLE PRECISION,
   "High body-mass index_Number_DALYs_val" DOUBLE PRECISION,
   "High body-mass index_Number_Deaths_lower" DOUBLE PRECISION,
   "High body-mass index_Number_Deaths_upper" DOUBLE PRECISION,
   "High body-mass index_Number_Deaths_val" DOUBLE PRECISION,
   "High body-mass index_Number_YLDs_lower" DOUBLE PRECISION,
   "High body-mass index_Number_YLDs_upper" DOUBLE PRECISION,
   "High body-mass index_Number_YLDs_val" DOUBLE PRECISION,
   "High body-mass index_Number_YLLs_lower" DOUBLE PRECISION,
   "High body-mass index_Number_YLLs_upper" DOUBLE PRECISION,
   "High body-mass index_Number_YLLs_val" DOUBLE PRECISION,
   "High body-mass index_Percent_DALYs_lower" DOUBLE PRECISION,
   "High body-mass index_Percent_DALYs_upper" DOUBLE PRECISION,
   "High body-mass index_Percent_DALYs_val" DOUBLE PRECISION,
   "High body-mass index_Percent_Deaths_lower" DOUBLE PRECISION,
   "High body-mass index_Percent_Deaths_upper" DOUBLE PRECISION,
   "High body-mass index_Percent_Deaths_val" DOUBLE PRECISION,
   "High body-mass index_Percent_YLDs_lower" DOUBLE PRECISION,
   "High body-mass index_Percent_YLDs_upper" DOUBLE PRECISION,
   "High body-mass index_Percent_YLDs_val" DOUBLE PRECISION,
   "High body-mass index_Percent_YLLs_lower" DOUBLE PRECISION,
   "High body-mass index_Percent_YLLs_upper" DOUBLE PRECISION,
   "High body-mass index_Percent_YLLs_val" DOUBLE PRECISION,
   "High body-mass index_Rate_DALYs_lower" DOUBLE PRECISION,
   "High body-mass index_Rate_DALYs_upper" DOUBLE PRECISION,
   "High body-mass index_Rate_DALYs_val" DOUBLE PRECISION,
   "High body-mass index_Rate_Deaths_lower" DOUBLE PRECISION,
   "High body-mass index_Rate_Deaths_upper" DOUBLE PRECISION,
   "High body-mass index_Rate_Deaths_val" DOUBLE PRECISION,
   "High body-mass index_Rate_YLDs_lower" DOUBLE PRECISION,
   "High body-mass index_Rate_YLDs_upper" DOUBLE PRECISION,
   "High body-mass index_Rate_YLDs_val" DOUBLE PRECISION,
   "High body-mass index_Rate_YLLs_lower" DOUBLE PRECISION,
   "High body-mass index_Rate_YLLs_upper" DOUBLE PRECISION,
   "High body-mass index_Rate_YLLs_val" DOUBLE PRECISION,
   "Low physical activity_Number_DALYs_lower" DOUBLE PRECISION,
   "Low physical activity_Number_DALYs_upper" DOUBLE PRECISION,
   "Low physical activity_Number_DALYs_val" DOUBLE PRECISION,
   "Low physical activity_Number_Deaths_lower" DOUBLE PRECISION,
   "Low physical activity_Number_Deaths_upper" DOUBLE PRECISION,
   "Low physical activity_Number_Deaths_val" DOUBLE PRECISION,
   "Low physical activity_Number_YLDs_lower" DOUBLE PRECISION,
   "Low physical activity_Number_YLDs_upper" DOUBLE PRECISION,
   "Low physical activity_Number_YLDs_val" DOUBLE PRECISION,
   "Low physical activity_Number_YLLs_lower" DOUBLE PRECISION,
   "Low physical activity_Number_YLLs_upper" DOUBLE PRECISION,
   "Low physical activity_Number_YLLs_val" DOUBLE PRECISION,
   "Low physical activity_Percent_DALYs_lower" DOUBLE PRECISION,
   "Low physical activity_Percent_DALYs_upper" DOUBLE PRECISION,
   "Low physical activity_Percent_DALYs_val" DOUBLE PRECISION,
   "Low physical activity_Percent_Deaths_lower" DOUBLE PRECISION,
   "Low physical activity_Percent_Deaths_upper" DOUBLE PRECISION,
   "Low physical activity_Percent_Deaths_val" DOUBLE PRECISION,
   "Low physical activity_Percent_YLDs_lower" DOUBLE PRECISION,
   "Low physical activity_Percent_YLDs_upper" DOUBLE PRECISION,
   "Low physical activity_Percent_YLDs_val" DOUBLE PRECISION,
   "Low physical activity_Percent_YLLs_lower" DOUBLE PRECISION,
   "Low physical activity_Percent_YLLs_upper" DOUBLE PRECISION,
   "Low physical activity_Percent_YLLs_val" DOUBLE PRECISION,
   "Low physical activity_Rate_DALYs_lower" DOUBLE PRECISION,
   "Low physical activity_Rate_DALYs_upper" DOUBLE PRECISION,
   "Low physical activity_Rate_DALYs_val" DOUBLE PRECISION,
   "Low physical activity_Rate_Deaths_lower" DOUBLE PRECISION,
   "Low physical activity_Rate_Deaths_upper" DOUBLE PRECISION,
   "Low physical activity_Rate_Deaths_val" DOUBLE PRECISION,
   "Low physical activity_Rate_YLDs_lower" DOUBLE PRECISION,
   "Low physical activity_Rate_YLDs_upper" DOUBLE PRECISION,
   "Low physical activity_Rate_YLDs_val" DOUBLE PRECISION,
   "Low physical activity_Rate_YLLs_lower" DOUBLE PRECISION,
   "Low physical activity_Rate_YLLs_upper" DOUBLE PRECISION,
   "Low physical activity_Rate_YLLs_val" DOUBLE PRECISION,
   "Alcohol use_Percent_DALYs_lower" DOUBLE PRECISION,
   "Alcohol use_Percent_DALYs_upper" DOUBLE PRECISION,
   "Alcohol use_Percent_DALYs_val" DOUBLE PRECISION,
   "Alcohol use_Percent_Deaths_lower" DOUBLE PRECISION,
   "Alcohol use_Percent_Deaths_upper" DOUBLE PRECISION,
   "Alcohol use_Percent_Deaths_val" DOUBLE PRECISION,
   "Alcohol use_Percent_YLDs_lower" DOUBLE PRECISION,
   "Alcohol use_Percent_YLDs_upper" DOUBLE PRECISION,
   "Alcohol use_Percent_YLDs_val" DOUBLE PRECISION,
   "Alcohol use_Percent_YLLs_lower" DOUBLE PRECISION,
   "Alcohol use_Percent_YLLs_upper" DOUBLE PRECISION,
   "Alcohol use_Percent_YLLs_val" DOUBLE PRECISION,
   "Alcohol use_Rate_DALYs_lower" DOUBLE PRECISION,
   "Alcohol use_Rate_DALYs_upper" DOUBLE PRECISION,
   "Alcohol use_Rate_DALYs_val" DOUBLE PRECISION,
   "Alcohol use_Rate_Deaths_lower" DOUBLE PRECISION,
   "Alcohol use_Rate_Deaths_upper" DOUBLE PRECISION,
   "Alcohol use_Rate_Deaths_val" DOUBLE PRECISION,
   "Alcohol use_Rate_YLDs_lower" DOUBLE PRECISION,
   "Alcohol use_Rate_YLDs_upper" DOUBLE PRECISION,
   "Alcohol use_Rate_YLDs_val" DOUBLE PRECISION,
   "Alcohol use_Rate_YLLs_lower" DOUBLE PRECISION,
   "Alcohol use_Rate_YLLs_upper" DOUBLE PRECISION,
   "Alcohol use_Rate_YLLs_val" DOUBLE PRECISION,
   "Diet high in processed meat_Percent_DALYs_lower" DOUBLE PRECISION,
   "Diet high in processed meat_Percent_DALYs_upper" DOUBLE PRECISION,
   "Diet high in processed meat_Percent_DALYs_val" DOUBLE PRECISION,
   "Diet high in processed meat_Percent_Deaths_lower" DOUBLE PRECISION,
   "Diet high in processed meat_Percent_Deaths_upper" DOUBLE PRECISION,
   "Diet high in processed meat_Percent_Deaths_val" DOUBLE PRECISION,
   "Diet high in processed meat_Percent_YLDs_lower" DOUBLE PRECISION,
   "Diet high in processed meat_Percent_YLDs_upper" DOUBLE PRECISION,
   "Diet high in processed meat_Percent_YLDs_val" DOUBLE PRECISION,
   "Diet high in processed meat_Percent_YLLs_lower" DOUBLE PRECISION,
   "Diet high in processed meat_Percent_YLLs_upper" DOUBLE PRECISION,
   "Diet high in processed meat_Percent_YLLs_val" DOUBLE PRECISION,
   "Diet high in processed meat_Rate_DALYs_lower" DOUBLE PRECISION,
   "Diet high in processed meat_Rate_DALYs_upper" DOUBLE PRECISION,
   "Diet high in processed meat_Rate_DALYs_val" DOUBLE PRECISION,
   "Diet high in processed meat_Rate_Deaths_lower" DOUBLE PRECISION,
   "Diet high in processed meat_Rate_Deaths_upper" DOUBLE PRECISION,
   "Diet high in processed meat_Rate_Deaths_val" DOUBLE PRECISION,
   "Diet high in processed meat_Rate_YLDs_lower" DOUBLE PRECISION,
   "Diet high in processed meat_Rate_YLDs_upper" DOUBLE PRECISION,
   "Diet high in processed meat_Rate_YLDs_val" DOUBLE PRECISION,
   "Diet high in processed meat_Rate_YLLs_lower" DOUBLE PRECISION,
   "Diet high in processed meat_Rate_YLLs_upper" DOUBLE PRECISION,
   "Diet high in processed meat_Rate_YLLs_val" DOUBLE PRECISION,
   "Diet high in red meat_Percent_DALYs_lower" DOUBLE PRECISION,
   "Diet high in red meat_Percent_DALYs_upper" DOUBLE PRECISION,
   "Diet high in red meat_Percent_DALYs_val" DOUBLE PRECISION,
   "Diet high in red meat_Percent_Deaths_lower" DOUBLE PRECISION,
   "Diet high in red meat_Percent_Deaths_upper" DOUBLE PRECISION,
   "Diet high in red meat_Percent_Deaths_val" DOUBLE PRECISION,
   "Diet high in red meat_Percent_YLDs_lower" DOUBLE PRECISION,
   "Diet high in red meat_Percent_YLDs_upper" DOUBLE PRECISION,
   "Diet high in red meat_Percent_YLDs_val" DOUBLE PRECISION,
   "Diet high in red meat_Percent_YLLs_lower" DOUBLE PRECISION,
   "Diet high in red meat_Percent_YLLs_upper" DOUBLE PRECISION,
   "Diet high in red meat_Percent_YLLs_val" DOUBLE PRECISION,
   "Diet high in red meat_Rate_DALYs_lower" DOUBLE PRECISION,
   "Diet high in red meat_Rate_DALYs_upper" DOUBLE PRECISION,
   "Diet high in red meat_Rate_DALYs_val" DOUBLE PRECISION,
   "Diet high in red meat_Rate_Deaths_lower" DOUBLE PRECISION,
   "Diet high in red meat_Rate_Deaths_upper" DOUBLE PRECISION,
   "Diet high in red meat_Rate_Deaths_val" DOUBLE PRECISION,
   "Diet high in red meat_Rate_YLDs_lower" DOUBLE PRECISION,
   "Diet high in red meat_Rate_YLDs_upper" DOUBLE PRECISION,
   "Diet high in red meat_Rate_YLDs_val" DOUBLE PRECISION,
   "Diet high in red meat_Rate_YLLs_lower" DOUBLE PRECISION,
   "Diet high in red meat_Rate_YLLs_upper" DOUBLE PRECISION,
   "Diet high in red meat_Rate_YLLs_val" DOUBLE PRECISION,
   "Diet low in calcium_Percent_DALYs_lower" DOUBLE PRECISION,
   "Diet low in calcium_Percent_DALYs_upper" DOUBLE PRECISION,
   "Diet low in calcium_Percent_DALYs_val" DOUBLE PRECISION,
   "Diet low in calcium_Percent_Deaths_lower" DOUBLE PRECISION,
   "Diet low in calcium_Percent_Deaths_upper" DOUBLE PRECISION,
   "Diet low in calcium_Percent_Deaths_val" DOUBLE PRECISION,
   "Diet low in calcium_Percent_YLDs_lower" DOUBLE PRECISION,
   "Diet low in calcium_Percent_YLDs_upper" DOUBLE PRECISION,
   "Diet low in calcium_Percent_YLDs_val" DOUBLE PRECISION,
   "Diet low in calcium_Percent_YLLs_lower" DOUBLE PRECISION,
   "Diet low in calcium_Percent_YLLs_upper" DOUBLE PRECISION,
   "Diet low in calcium_Percent_YLLs_val" DOUBLE PRECISION,
   "Diet low in calcium_Rate_DALYs_lower" DOUBLE PRECISION,
   "Diet low in calcium_Rate_DALYs_upper" DOUBLE PRECISION,
   "Diet low in calcium_Rate_DALYs_val" DOUBLE PRECISION,
   "Diet low in calcium_Rate_Deaths_lower" DOUBLE PRECISION,
   "Diet low in calcium_Rate_Deaths_upper" DOUBLE PRECISION,
   "Diet low in calcium_Rate_Deaths_val" DOUBLE PRECISION,
   "Diet low in calcium_Rate_YLDs_lower" DOUBLE PRECISION,
   "Diet low in calcium_Rate_YLDs_upper" DOUBLE PRECISION,
   "Diet low in calcium_Rate_YLDs_val" DOUBLE PRECISION,
   "Diet low in calcium_Rate_YLLs_lower" DOUBLE PRECISION,
   "Diet low in calcium_Rate_YLLs_upper" DOUBLE PRECISION,
   "Diet low in calcium_Rate_YLLs_val" DOUBLE PRECISION,
   "Diet low in fiber_Percent_DALYs_lower" DOUBLE PRECISION,
   "Diet low in fiber_Percent_DALYs_upper" DOUBLE PRECISION,
   "Diet low in fiber_Percent_DALYs_val" DOUBLE PRECISION,
   "Diet low in fiber_Percent_Deaths_lower" DOUBLE PRECISION,
   "Diet low in fiber_Percent_Deaths_upper" DOUBLE PRECISION,
   "Diet low in fiber_Percent_Deaths_val" DOUBLE PRECISION,
   "Diet low in fiber_Percent_YLDs_lower" DOUBLE PRECISION,
   "Diet low in fiber_Percent_YLDs_upper" DOUBLE PRECISION,
   "Diet low in fiber_Percent_YLDs_val" DOUBLE PRECISION,
   "Diet low in fiber_Percent_YLLs_lower" DOUBLE PRECISION,
   "Diet low in fiber_Percent_YLLs_upper" DOUBLE PRECISION,
   "Diet low in fiber_Percent_YLLs_val" DOUBLE PRECISION,
   "Diet low in fiber_Rate_DALYs_lower" DOUBLE PRECISION,
   "Diet low in fiber_Rate_DALYs_upper" DOUBLE PRECISION,
   "Diet low in fiber_Rate_DALYs_val" DOUBLE PRECISION,
   "Diet low in fiber_Rate_Deaths_lower" DOUBLE PRECISION,
   "Diet low in fiber_Rate_Deaths_upper" DOUBLE PRECISION,
   "Diet low in fiber_Rate_Deaths_val" DOUBLE PRECISION,
   "Diet low in fiber_Rate_YLDs_lower" DOUBLE PRECISION,
   "Diet low in fiber_Rate_YLDs_upper" DOUBLE PRECISION,
   "Diet low in fiber_Rate_YLDs_val" DOUBLE PRECISION,
   "Diet low in fiber_Rate_YLLs_lower" DOUBLE PRECISION,
   "Diet low in fiber_Rate_YLLs_upper" DOUBLE PRECISION,
   "Diet low in fiber_Rate_YLLs_val" DOUBLE PRECISION,
   "Diet low in milk_Percent_DALYs_lower" DOUBLE PRECISION,
   "Diet low in milk_Percent_DALYs_upper" DOUBLE PRECISION,
   "Diet low in milk_Percent_DALYs_val" DOUBLE PRECISION,
   "Diet low in milk_Percent_Deaths_lower" DOUBLE PRECISION,
   "Diet low in milk_Percent_Deaths_upper" DOUBLE PRECISION,
   "Diet low in milk_Percent_Deaths_val" DOUBLE PRECISION,
   "Diet low in milk_Percent_YLDs_lower" DOUBLE PRECISION,
   "Diet low in milk_Percent_YLDs_upper" DOUBLE PRECISION,
   "Diet low in milk_Percent_YLDs_val" DOUBLE PRECISION,
   "Diet low in milk_Percent_YLLs_lower" DOUBLE PRECISION,
   "Diet low in milk_Percent_YLLs_upper" DOUBLE PRECISION,
   "Diet low in milk_Percent_YLLs_val" DOUBLE PRECISION,
   "Diet low in milk_Rate_DALYs_lower" DOUBLE PRECISION,
   "Diet low in milk_Rate_DALYs_upper" DOUBLE PRECISION,
   "Diet low in milk_Rate_DALYs_val" DOUBLE PRECISION,
   "Diet low in milk_Rate_Deaths_lower" DOUBLE PRECISION,
   "Diet low in milk_Rate_Deaths_upper" DOUBLE PRECISION,
   "Diet low in milk_Rate_Deaths_val" DOUBLE PRECISION,
   "Diet low in milk_Rate_YLDs_lower" DOUBLE PRECISION,
   "Diet low in milk_Rate_YLDs_upper" DOUBLE PRECISION,
   "Diet low in milk_Rate_YLDs_val" DOUBLE PRECISION,
   "Diet low in milk_Rate_YLLs_lower" DOUBLE PRECISION,
   "Diet low in milk_Rate_YLLs_upper" DOUBLE PRECISION,
   "Diet low in milk_Rate_YLLs_val" DOUBLE PRECISION,
   "Diet low in whole grains_Percent_DALYs_lower" DOUBLE PRECISION,
   "Diet low in whole grains_Percent_DALYs_upper" DOUBLE PRECISION,
   "Diet low in whole grains_Percent_DALYs_val" DOUBLE PRECISION,
   "Diet low in whole grains_Percent_Deaths_lower" DOUBLE PRECISION,
   "Diet low in whole grains_Percent_Deaths_upper" DOUBLE PRECISION,
   "Diet low in whole grains_Percent_Deaths_val" DOUBLE PRECISION,
   "Diet low in whole grains_Percent_YLDs_lower" DOUBLE PRECISION,
   "Diet low in whole grains_Percent_YLDs_upper" DOUBLE PRECISION,
   "Diet low in whole grains_Percent_YLDs_val" DOUBLE PRECISION,
   "Diet low in whole grains_Percent_YLLs_lower" DOUBLE PRECISION,
   "Diet low in whole grains_Percent_YLLs_upper" DOUBLE PRECISION,
   "Diet low in whole grains_Percent_YLLs_val" DOUBLE PRECISION,
   "Diet low in whole grains_Rate_DALYs_lower" DOUBLE PRECISION,
   "Diet low in whole grains_Rate_DALYs_upper" DOUBLE PRECISION,
   "Diet low in whole grains_Rate_DALYs_val" DOUBLE PRECISION,
   "Diet low in whole grains_Rate_Deaths_lower" DOUBLE PRECISION,
   "Diet low in whole grains_Rate_Deaths_upper" DOUBLE PRECISION,
   "Diet low in whole grains_Rate_Deaths_val" DOUBLE PRECISION,
   "Diet low in whole grains_Rate_YLDs_lower" DOUBLE PRECISION,
   "Diet low in whole grains_Rate_YLDs_upper" DOUBLE PRECISION,
   "Diet low in whole grains_Rate_YLDs_val" DOUBLE PRECISION,
   "Diet low in whole grains_Rate_YLLs_lower" DOUBLE PRECISION,
   "Diet low in whole grains_Rate_YLLs_upper" DOUBLE PRECISION,
   "Diet low in whole grains_Rate_YLLs_val" DOUBLE PRECISION,
   "Smoking_Percent_DALYs_lower" DOUBLE PRECISION,
   "Smoking_Percent_DALYs_upper" DOUBLE PRECISION,
   "Smoking_Percent_DALYs_val" DOUBLE PRECISION,
   "Smoking_Percent_Deaths_lower" DOUBLE PRECISION,
   "Smoking_Percent_Deaths_upper" DOUBLE PRECISION,
   "Smoking_Percent_Deaths_val" DOUBLE PRECISION,
   "Smoking_Percent_YLDs_lower" DOUBLE PRECISION,
   "Smoking_Percent_YLDs_upper" DOUBLE PRECISION,
   "Smoking_Percent_YLDs_val" DOUBLE PRECISION,
   "Smoking_Percent_YLLs_lower" DOUBLE PRECISION,
   "Smoking_Percent_YLLs_upper" DOUBLE PRECISION,
   "Smoking_Percent_YLLs_val" DOUBLE PRECISION,
   "Smoking_Rate_DALYs_lower" DOUBLE PRECISION,
   "Smoking_Rate_DALYs_upper" DOUBLE PRECISION,
   "Smoking_Rate_DALYs_val" DOUBLE PRECISION,
   "Smoking_Rate_Deaths_lower" DOUBLE PRECISION,
   "Smoking_Rate_Deaths_upper" DOUBLE PRECISION,
   "Smoking_Rate_Deaths_val" DOUBLE PRECISION,
   "Smoking_Rate_YLDs_lower" DOUBLE PRECISION,
   "Smoking_Rate_YLDs_upper" DOUBLE PRECISION,
   "Smoking_Rate_YLDs_val" DOUBLE PRECISION,
   "Smoking_Rate_YLLs_lower" DOUBLE PRECISION,
   "Smoking_Rate_YLLs_upper" DOUBLE PRECISION,
   "Smoking_Rate_YLLs_val" DOUBLE PRECISION,
   "Alcohol use_Rate_SEV_lower" DOUBLE PRECISION,
   "Alcohol use_Rate_SEV_upper" DOUBLE PRECISION,
   "Alcohol use_Rate_SEV_val" DOUBLE PRECISION,
   "Diet high in processed meat_Rate_SEV_lower" DOUBLE PRECISION,
   "Diet high in processed meat_Rate_SEV_upper" DOUBLE PRECISION,
   "Diet high in processed meat_Rate_SEV_val" DOUBLE PRECISION,
   "Diet high in red meat_Rate_SEV_lower" DOUBLE PRECISION,
   "Diet high in red meat_Rate_SEV_upper" DOUBLE PRECISION,
   "Diet high in red meat_Rate_SEV_val" DOUBLE PRECISION,
   "Diet high in sodium_Rate_SEV_lower" DOUBLE PRECISION,
   "Diet high in sodium_Rate_SEV_upper" DOUBLE PRECISION,
   "Diet high in sodium_Rate_SEV_val" DOUBLE PRECISION,
   "Diet high in sugar-sweetened beverages_Rate_SEV_lower" DOUBLE PRECISION,
   "Diet high in sugar-sweetened beverages_Rate_SEV_upper" DOUBLE PRECISION,
   "Diet high in sugar-sweetened beverages_Rate_SEV_val" DOUBLE PRECISION,
   "Diet high in trans fatty acids_Rate_SEV_lower" DOUBLE PRECISION,
   "Diet high in trans fatty acids_Rate_SEV_upper" DOUBLE PRECISION,
   "Diet high in trans fatty acids_Rate_SEV_val" DOUBLE PRECISION,
   "Diet low in calcium_Rate_SEV_lower" DOUBLE PRECISION,
   "Diet low in calcium_Rate_SEV_upper" DOUBLE PRECISION,
   "Diet low in calcium_Rate_SEV_val" DOUBLE PRECISION,
   "Diet low in fiber_Rate_SEV_lower" DOUBLE PRECISION,
   "Diet low in fiber_Rate_SEV_upper" DOUBLE PRECISION,
   "Diet low in fiber_Rate_SEV_val" DOUBLE PRECISION,
   "Diet low in fruits_Rate_SEV_lower" DOUBLE PRECISION,
   "Diet low in fruits_Rate_SEV_upper" DOUBLE PRECISION,
   "Diet low in fruits_Rate_SEV_val" DOUBLE PRECISION,
   "Diet low in legumes_Rate_SEV_lower" DOUBLE PRECISION,
   "Diet low in legumes_Rate_SEV_upper" DOUBLE PRECISION,
   "Diet low in legumes_Rate_SEV_val" DOUBLE PRECISION,
   "Diet low in milk_Rate_SEV_lower" DOUBLE PRECISION,
   "Diet low in milk_Rate_SEV_upper" DOUBLE PRECISION,
   "Diet low in milk_Rate_SEV_val" DOUBLE PRECISION,
   "Diet low in nuts and seeds_Rate_SEV_lower" DOUBLE PRECISION,
   "Diet low in nuts and seeds_Rate_SEV_upper" DOUBLE PRECISION,
   "Diet low in nuts and seeds_Rate_SEV_val" DOUBLE PRECISION,
   "Diet low in polyunsaturated fatty acids_Rate_SEV_lower" DOUBLE PRECISION,
   "Diet low in polyunsaturated fatty acids_Rate_SEV_upper" DOUBLE PRECISION,
   "Diet low in polyunsaturated fatty acids_Rate_SEV_val" DOUBLE PRECISION,
   "Diet low in seafood omega-3 fatty acids_Rate_SEV_lower" DOUBLE PRECISION,
   "Diet low in seafood omega-3 fatty acids_Rate_SEV_upper" DOUBLE PRECISION,
   "Diet low in seafood omega-3 fatty acids_Rate_SEV_val" DOUBLE PRECISION,
   "Diet low in vegetables_Rate_SEV_lower" DOUBLE PRECISION,
   "Diet low in vegetables_Rate_SEV_upper" DOUBLE PRECISION,
   "Diet low in vegetables_Rate_SEV_val" DOUBLE PRECISION,
   "Diet low in whole grains_Rate_SEV_lower" DOUBLE PRECISION,
   "Diet low in whole grains_Rate_SEV_upper" DOUBLE PRECISION,
   "Diet low in whole grains_Rate_SEV_val" DOUBLE PRECISION,
   "High body-mass index_Rate_SEV_lower" DOUBLE PRECISION,
   "High body-mass index_Rate_SEV_upper" DOUBLE PRECISION,
   "High body-mass index_Rate_SEV_val" DOUBLE PRECISION,
   "Low physical activity_Rate_SEV_lower" DOUBLE PRECISION,
   "Low physical activity_Rate_SEV_upper" DOUBLE PRECISION,
   "Low physical activity_Rate_SEV_val" DOUBLE PRECISION,
   "Smoking_Rate_SEV_lower" DOUBLE PRECISION,
   "Smoking_Rate_SEV_upper" DOUBLE PRECISION,
   "Smoking_Rate_SEV_val" DOUBLE PRECISION,
   "Unsafe water source_Rate_SEV_lower" DOUBLE PRECISION,
   "Unsafe water source_Rate_SEV_upper" DOUBLE PRECISION,
   "Unsafe water source_Rate_SEV_val" DOUBLE PRECISION,
   "%% of the population unable to afford a healthy diet_Value" DOUBLE PRECISION,
   "PPP $/person/day of a healthy diet_Value" DOUBLE PRECISION,
   "PPP $/person/day of animal source foods_Value" DOUBLE PRECISION,
   "PPP $/person/day of fruits_Value" DOUBLE PRECISION,
   "PPP $/person/day of legumes nuts and seeds_Value" DOUBLE PRECISION,
   "PPP $/person/day of oils and fats_Value" DOUBLE PRECISION,
   "PPP $/person/day of starchy staples_Value" DOUBLE PRECISION,
   "PPP $/person/day of vegetables_Value" DOUBLE PRECISION,
   "people unable to afford a healthy diet (million)_Value" DOUBLE PRECISION,
   "CRC_incidence_val_Number" DOUBLE PRECISION,
   "CRC_incidence_upper_Number" DOUBLE PRECISION,
   "CRC_incidence_lower_Number" DOUBLE PRECISION,
   "Alcohol use_Number_DALYs_lower" DOUBLE PRECISION,
   "Alcohol use_Number_DALYs_upper" DOUBLE PRECISION,
   "Alcohol use_Number_DALYs_val" DOUBLE PRECISION,
   "Alcohol use_Number_Deaths_lower" DOUBLE PRECISION,
   "Alcohol use_Number_Deaths_upper" DOUBLE PRECISION,
   "Alcohol use_Number_Deaths_val" DOUBLE PRECISION,
   "Alcohol use_Number_YLDs_lower" DOUBLE PRECISION,
   "Alcohol use_Number_YLDs_upper" DOUBLE PRECISION,
   "Alcohol use_Number_YLDs_val" DOUBLE PRECISION,
   "Alcohol use_Number_YLLs_lower" DOUBLE PRECISION,
   "Alcohol use_Number_YLLs_upper" DOUBLE PRECISION,
   "Alcohol use_Number_YLLs_val" DOUBLE PRECISION,
   "Diet high in processed meat_Number_DALYs_lower" DOUBLE PRECISION,
   "Diet high in processed meat_Number_DALYs_upper" DOUBLE PRECISION,
   "Diet high in processed meat_Number_DALYs_val" DOUBLE PRECISION,
   "Diet high in processed meat_Number_Deaths_lower" DOUBLE PRECISION,
   "Diet high in processed meat_Number_Deaths_upper" DOUBLE PRECISION,
   "Diet high in processed meat_Number_Deaths_val" DOUBLE PRECISION,
   "Diet high in processed meat_Number_YLDs_lower" DOUBLE PRECISION,
   "Diet high in processed meat_Number_YLDs_upper" DOUBLE PRECISION,
   "Diet high in processed meat_Number_YLDs_val" DOUBLE PRECISION,
   "Diet high in processed meat_Number_YLLs_lower" DOUBLE PRECISION,
   "Diet high in processed meat_Number_YLLs_upper" DOUBLE PRECISION,
   "Diet high in processed meat_Number_YLLs_val" DOUBLE PRECISION,
   "Diet high in red meat_Number_DALYs_lower" DOUBLE PRECISION,
   "Diet high in red meat_Number_DALYs_upper" DOUBLE PRECISION,
   "Diet high in red meat_Number_DALYs_val" DOUBLE PRECISION,
   "Diet high in red meat_Number_Deaths_lower" DOUBLE PRECISION,
   "Diet high in red meat_Number_Deaths_upper" DOUBLE PRECISION,
   "Diet high in red meat_Number_Deaths_val" DOUBLE PRECISION,
   "Diet high in red meat_Number_YLDs_lower" DOUBLE PRECISION,
   "Diet high in red meat_Number_YLDs_upper" DOUBLE PRECISION,
   "Diet high in red meat_Number_YLDs_val" DOUBLE PRECISION,
   "Diet high in red meat_Number_YLLs_lower" DOUBLE PRECISION,
   "Diet high in red meat_Number_YLLs_upper" DOUBLE PRECISION,
   "Diet high in red meat_Number_YLLs_val" DOUBLE PRECISION,
   "Diet low in calcium_Number_DALYs_lower" DOUBLE PRECISION,
   "Diet low in calcium_Number_DALYs_upper" DOUBLE PRECISION,
   "Diet low in calcium_Number_DALYs_val" DOUBLE PRECISION,
   "Diet low in calcium_Number_Deaths_lower" DOUBLE PRECISION,
   "Diet low in calcium_Number_Deaths_upper" DOUBLE PRECISION,
   "Diet low in calcium_Number_Deaths_val" DOUBLE PRECISION,
   "Diet low in calcium_Number_YLDs_lower" DOUBLE PRECISION,
   "Diet low in calcium_Number_YLDs_upper" DOUBLE PRECISION,
   "Diet low in calcium_Number_YLDs_val" DOUBLE PRECISION,
   "Diet low in calcium_Number_YLLs_lower" DOUBLE PRECISION,
   "Diet low in calcium_Number_YLLs_upper" DOUBLE PRECISION,
   "Diet low in calcium_Number_YLLs_val" DOUBLE PRECISION,
   "Diet low in fiber_Number_DALYs_lower" DOUBLE PRECISION,
   "Diet low in fiber_Number_DALYs_upper" DOUBLE PRECISION,
   "Diet low in fiber_Number_DALYs_val" DOUBLE PRECISION,
   "Diet low in fiber_Number_Deaths_lower" DOUBLE PRECISION,
   "Diet low in fiber_Number_Deaths_upper" DOUBLE PRECISION,
   "Diet low in fiber_Number_Deaths_val" DOUBLE PRECISION,
   "Diet low in fiber_Number_YLDs_lower" DOUBLE PRECISION,
   "Diet low in fiber_Number_YLDs_upper" DOUBLE PRECISION,
   "Diet low in fiber_Number_YLDs_val" DOUBLE PRECISION,
   "Diet low in fiber_Number_YLLs_lower" DOUBLE PRECISION,
   "Diet low in fiber_Number_YLLs_upper" DOUBLE PRECISION,
   "Diet low in fiber_Number_YLLs_val" DOUBLE PRECISION,
   "Diet low in milk_Number_DALYs_lower" DOUBLE PRECISION,
   "Diet low in milk_Number_DALYs_upper" DOUBLE PRECISION,
   "Diet low in milk_Number_DALYs_val" DOUBLE PRECISION,
   "Diet low in milk_Number_Deaths_lower" DOUBLE PRECISION,
   "Diet low in milk_Number_Deaths_upper" DOUBLE PRECISION,
   "Diet low in milk_Number_Deaths_val" DOUBLE PRECISION,
   "Diet low in milk_Number_YLDs_lower" DOUBLE PRECISION,
   "Diet low in milk_Number_YLDs_upper" DOUBLE PRECISION,
   "Diet low in milk_Number_YLDs_val" DOUBLE PRECISION,
   "Diet low in milk_Number_YLLs_lower" DOUBLE PRECISION,
   "Diet low in milk_Number_YLLs_upper" DOUBLE PRECISION,
   "Diet low in milk_Number_YLLs_val" DOUBLE PRECISION,
   "Diet low in whole grains_Number_DALYs_lower" DOUBLE PRECISION,
   "Diet low in whole grains_Number_DALYs_upper" DOUBLE PRECISION,
   "Diet low in whole grains_Number_DALYs_val" DOUBLE PRECISION,
   "Diet low in whole grains_Number_Deaths_lower" DOUBLE PRECISION,
   "Diet low in whole grains_Number_Deaths_upper" DOUBLE PRECISION,
   "Diet low in whole grains_Number_Deaths_val" DOUBLE PRECISION,
   "Diet low in whole grains_Number_YLDs_lower" DOUBLE PRECISION,
   "Diet low in whole grains_Number_YLDs_upper" DOUBLE PRECISION,
   "Diet low in whole grains_Number_YLDs_val" DOUBLE PRECISION,
   "Diet low in whole grains_Number_YLLs_lower" DOUBLE PRECISION,
   "Diet low in whole grains_Number_YLLs_upper" DOUBLE PRECISION,
   "Diet low in whole grains_Number_YLLs_val" DOUBLE PRECISION,
   "Smoking_Number_DALYs_lower" DOUBLE PRECISION,
   "Smoking_Number_DALYs_upper" DOUBLE PRECISION,
   "Smoking_Number_DALYs_val" DOUBLE PRECISION,
   "Smoking_Number_Deaths_lower" DOUBLE PRECISION,
   "Smoking_Number_Deaths_upper" DOUBLE PRECISION,
   "Smoking_Number_Deaths_val" DOUBLE PRECISION,
   "Smoking_Number_YLDs_lower" DOUBLE PRECISION,
   "Smoking_Number_YLDs_upper" DOUBLE PRECISION,
   "Smoking_Number_YLDs_val" DOUBLE PRECISION,
   "Smoking_Number_YLLs_lower" DOUBLE PRECISION,
   "Smoking_Number_YLLs_upper" DOUBLE PRECISION,
   "Smoking_Number_YLLs_val" DOUBLE PRECISION,
   "Population_ECIS" DOUBLE PRECISION,
   "CRC_Cases" DOUBLE PRECISION,
   "2040_est_Population" DOUBLE PRECISION,
   "2040_est_CRC_Cases" DOUBLE PRECISION,
   "2040_CRC_Cases_Relative change_%" DOUBLE PRECISION,
   "Primary care costs €" DOUBLE PRECISION,
   "% CRC health-care costs on Primary care" DOUBLE PRECISION,
   "Outpatient care costs €" DOUBLE PRECISION,
   "% CRC health-care costs on Outpatient care" DOUBLE PRECISION,
   "Emergency care costs €" DOUBLE PRECISION,
   "% CRC health-care costs on Emergency care" DOUBLE PRECISION,
   "Hospital care costs €" DOUBLE PRECISION,
   "% CRC health-care costs on Hospital care" DOUBLE PRECISION,
   "Systemic anti-cancer therapy costs €" DOUBLE PRECISION,
   "% CRC health-care costs on Systemic anti-cancer therapy" DOUBLE PRECISION,
   "Total health- care expenditure costs €" DOUBLE PRECISION,
   "% CRC economic burden on health-care expenditure" DOUBLE PRECISION,
   "Mortality costs €" DOUBLE PRECISION,
   "% CRC economic burden on Mortality" DOUBLE PRECISION,
   "Morbidity costs €" DOUBLE PRECISION,
   "% CRC economic burden on Morbidity" DOUBLE PRECISION,
   "Informal care costs €" DOUBLE PRECISION,
   "% CRC economic burden on Informal care" DOUBLE PRECISION,
   "Total non- health-care expenditure costs €" DOUBLE PRECISION,
   "% CRC economic burden on non- health-care expenditure" DOUBLE PRECISION,
   "% health-care expenditure" DOUBLE PRECISION,
   "Total costs €" DOUBLE PRECISION,
   "Health expenditure_per_capita" DOUBLE PRECISION,
   "Cancer drugs*_per_capita" DOUBLE PRECISION,
   "Informal care costs_per_capita" DOUBLE PRECISION,
   "Mortality_per_capita" DOUBLE PRECISION,
   "Morbidity_per_capita" DOUBLE PRECISION,
   "Total costs_per_capita" DOUBLE PRECISION,
   "Health expenditure_total_cost" DOUBLE PRECISION,
   "Cancer drugs_total_cost" DOUBLE PRECISION,
   "Informal care costs_total_cost" DOUBLE PRECISION,
   "Mortality_total_cost" DOUBLE PRECISION,
   "Morbidity_total_cost" DOUBLE PRECISION,
   "Total costs_total_cost" DOUBLE PRECISION,
   "Populated Area [km2]" DOUBLE PRECISION,
   "Population_WHO" DOUBLE PRECISION,
   "Air Pollution Average [ug/m3]_NO2" DOUBLE PRECISION,
   "Air Pollution Population Weighted Average [ug/m3]_NO2" DOUBLE PRECISION,
   "Air Pollution Average [ug/m3]_O3" DOUBLE PRECISION,
   "Air Pollution Population Weighted Average [ug/m3]_O3" DOUBLE PRECISION,
   "Air Pollution Average [ug/m3]_PM10" DOUBLE PRECISION,
   "Air Pollution Population Weighted Average [ug/m3]_PM10" DOUBLE PRECISION,
   "Air Pollution Average [ug/m3]_PM2.5" DOUBLE PRECISION,
   "Air Pollution Population Weighted Average [ug/m3]_PM2.5" DOUBLE PRECISION
);

CREATE TABLE policies_tbl (
   id SERIAL PRIMARY KEY,
   "Country" VARCHAR(250),
   "Value" INT,
   "Policy" VARCHAR(250)
);