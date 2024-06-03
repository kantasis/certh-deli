SELECT 
   AVG("CRC_incidence_val_Rate") as "CRC incidence", 
   AVG("High body-mass index_Percent_DALYs_val") as "BMI",
   AVG("Alcohol use_Percent_DALYs_val") as "Alcohol",
   AVG("Smoking_Percent_DALYs_val") as "Smoking",
   AVG("Diet high in processed meat_Percent_DALYs_val") as "Processed meat",
   "Country" 
FROM data_tbl 
GROUP BY "Country" 