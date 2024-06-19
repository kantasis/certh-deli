package com.tutorials.spring_react.datarepo;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

import org.postgresql.copy.CopyManager;
import org.postgresql.core.BaseConnection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class DataUpdateService {

   @Value("${custom.app.datarepo_user}")
   private String _datarepo_user;

   @Value("${custom.app.datarepo_pass}")
   private String _datarepo_pass;

   @Value("${spring.datasource.url}")
   private String _db_url;

   @Value("${spring.datasource.username}")
   private String _db_user;

   @Value("${spring.datasource.password}")
   private String _db_pass;

   @Autowired
   private JdbcTemplate jdbcTemplate;

   private static final String login_endpoint="v1/services/login/";
   private static final String data_endpoint="v1/retrospective/fused_european_only_new/";
   private static final String dataset_afile="/tmp/fused_dataset.csv";
   
   // TODO: put this in a different file
   private static final String importQuery_str = """
      COPY data_tbl(
         "_id",
   "Country",
   "Year",
   "age",
   "CRC_incidence_val_Percent",
   "CRC_incidence_upper_Percent",
   "CRC_incidence_lower_Percent",
   "CRC_incidence_val_Rate",
   "CRC_incidence_upper_Rate",
   "CRC_incidence_lower_Rate",
   "High body-mass index_Number_DALYs_lower",
   "High body-mass index_Number_DALYs_upper",
   "High body-mass index_Number_DALYs_val",
   "High body-mass index_Number_Deaths_lower",
   "High body-mass index_Number_Deaths_upper",
   "High body-mass index_Number_Deaths_val",
   "High body-mass index_Number_YLDs_lower",
   "High body-mass index_Number_YLDs_upper",
   "High body-mass index_Number_YLDs_val",
   "High body-mass index_Number_YLLs_lower",
   "High body-mass index_Number_YLLs_upper",
   "High body-mass index_Number_YLLs_val",
   "High body-mass index_Percent_DALYs_lower",
   "High body-mass index_Percent_DALYs_upper",
   "High body-mass index_Percent_DALYs_val",
   "High body-mass index_Percent_Deaths_lower",
   "High body-mass index_Percent_Deaths_upper",
   "High body-mass index_Percent_Deaths_val",
   "High body-mass index_Percent_YLDs_lower",
   "High body-mass index_Percent_YLDs_upper",
   "High body-mass index_Percent_YLDs_val",
   "High body-mass index_Percent_YLLs_lower",
   "High body-mass index_Percent_YLLs_upper",
   "High body-mass index_Percent_YLLs_val",
   "High body-mass index_Rate_DALYs_lower",
   "High body-mass index_Rate_DALYs_upper",
   "High body-mass index_Rate_DALYs_val",
   "High body-mass index_Rate_Deaths_lower",
   "High body-mass index_Rate_Deaths_upper",
   "High body-mass index_Rate_Deaths_val",
   "High body-mass index_Rate_YLDs_lower",
   "High body-mass index_Rate_YLDs_upper",
   "High body-mass index_Rate_YLDs_val",
   "High body-mass index_Rate_YLLs_lower",
   "High body-mass index_Rate_YLLs_upper",
   "High body-mass index_Rate_YLLs_val",
   "Low physical activity_Number_DALYs_lower",
   "Low physical activity_Number_DALYs_upper",
   "Low physical activity_Number_DALYs_val",
   "Low physical activity_Number_Deaths_lower",
   "Low physical activity_Number_Deaths_upper",
   "Low physical activity_Number_Deaths_val",
   "Low physical activity_Number_YLDs_lower",
   "Low physical activity_Number_YLDs_upper",
   "Low physical activity_Number_YLDs_val",
   "Low physical activity_Number_YLLs_lower",
   "Low physical activity_Number_YLLs_upper",
   "Low physical activity_Number_YLLs_val",
   "Low physical activity_Percent_DALYs_lower",
   "Low physical activity_Percent_DALYs_upper",
   "Low physical activity_Percent_DALYs_val",
   "Low physical activity_Percent_Deaths_lower",
   "Low physical activity_Percent_Deaths_upper",
   "Low physical activity_Percent_Deaths_val",
   "Low physical activity_Percent_YLDs_lower",
   "Low physical activity_Percent_YLDs_upper",
   "Low physical activity_Percent_YLDs_val",
   "Low physical activity_Percent_YLLs_lower",
   "Low physical activity_Percent_YLLs_upper",
   "Low physical activity_Percent_YLLs_val",
   "Low physical activity_Rate_DALYs_lower",
   "Low physical activity_Rate_DALYs_upper",
   "Low physical activity_Rate_DALYs_val",
   "Low physical activity_Rate_Deaths_lower",
   "Low physical activity_Rate_Deaths_upper",
   "Low physical activity_Rate_Deaths_val",
   "Low physical activity_Rate_YLDs_lower",
   "Low physical activity_Rate_YLDs_upper",
   "Low physical activity_Rate_YLDs_val",
   "Low physical activity_Rate_YLLs_lower",
   "Low physical activity_Rate_YLLs_upper",
   "Low physical activity_Rate_YLLs_val",
   "Alcohol use_Percent_DALYs_lower",
   "Alcohol use_Percent_DALYs_upper",
   "Alcohol use_Percent_DALYs_val",
   "Alcohol use_Percent_Deaths_lower",
   "Alcohol use_Percent_Deaths_upper",
   "Alcohol use_Percent_Deaths_val",
   "Alcohol use_Percent_YLDs_lower",
   "Alcohol use_Percent_YLDs_upper",
   "Alcohol use_Percent_YLDs_val",
   "Alcohol use_Percent_YLLs_lower",
   "Alcohol use_Percent_YLLs_upper",
   "Alcohol use_Percent_YLLs_val",
   "Alcohol use_Rate_DALYs_lower",
   "Alcohol use_Rate_DALYs_upper",
   "Alcohol use_Rate_DALYs_val",
   "Alcohol use_Rate_Deaths_lower",
   "Alcohol use_Rate_Deaths_upper",
   "Alcohol use_Rate_Deaths_val",
   "Alcohol use_Rate_YLDs_lower",
   "Alcohol use_Rate_YLDs_upper",
   "Alcohol use_Rate_YLDs_val",
   "Alcohol use_Rate_YLLs_lower",
   "Alcohol use_Rate_YLLs_upper",
   "Alcohol use_Rate_YLLs_val",
   "Diet high in processed meat_Percent_DALYs_lower",
   "Diet high in processed meat_Percent_DALYs_upper",
   "Diet high in processed meat_Percent_DALYs_val",
   "Diet high in processed meat_Percent_Deaths_lower",
   "Diet high in processed meat_Percent_Deaths_upper",
   "Diet high in processed meat_Percent_Deaths_val",
   "Diet high in processed meat_Percent_YLDs_lower",
   "Diet high in processed meat_Percent_YLDs_upper",
   "Diet high in processed meat_Percent_YLDs_val",
   "Diet high in processed meat_Percent_YLLs_lower",
   "Diet high in processed meat_Percent_YLLs_upper",
   "Diet high in processed meat_Percent_YLLs_val",
   "Diet high in processed meat_Rate_DALYs_lower",
   "Diet high in processed meat_Rate_DALYs_upper",
   "Diet high in processed meat_Rate_DALYs_val",
   "Diet high in processed meat_Rate_Deaths_lower",
   "Diet high in processed meat_Rate_Deaths_upper",
   "Diet high in processed meat_Rate_Deaths_val",
   "Diet high in processed meat_Rate_YLDs_lower",
   "Diet high in processed meat_Rate_YLDs_upper",
   "Diet high in processed meat_Rate_YLDs_val",
   "Diet high in processed meat_Rate_YLLs_lower",
   "Diet high in processed meat_Rate_YLLs_upper",
   "Diet high in processed meat_Rate_YLLs_val",
   "Diet high in red meat_Percent_DALYs_lower",
   "Diet high in red meat_Percent_DALYs_upper",
   "Diet high in red meat_Percent_DALYs_val",
   "Diet high in red meat_Percent_Deaths_lower",
   "Diet high in red meat_Percent_Deaths_upper",
   "Diet high in red meat_Percent_Deaths_val",
   "Diet high in red meat_Percent_YLDs_lower",
   "Diet high in red meat_Percent_YLDs_upper",
   "Diet high in red meat_Percent_YLDs_val",
   "Diet high in red meat_Percent_YLLs_lower",
   "Diet high in red meat_Percent_YLLs_upper",
   "Diet high in red meat_Percent_YLLs_val",
   "Diet high in red meat_Rate_DALYs_lower",
   "Diet high in red meat_Rate_DALYs_upper",
   "Diet high in red meat_Rate_DALYs_val",
   "Diet high in red meat_Rate_Deaths_lower",
   "Diet high in red meat_Rate_Deaths_upper",
   "Diet high in red meat_Rate_Deaths_val",
   "Diet high in red meat_Rate_YLDs_lower",
   "Diet high in red meat_Rate_YLDs_upper",
   "Diet high in red meat_Rate_YLDs_val",
   "Diet high in red meat_Rate_YLLs_lower",
   "Diet high in red meat_Rate_YLLs_upper",
   "Diet high in red meat_Rate_YLLs_val",
   "Diet low in calcium_Percent_DALYs_lower",
   "Diet low in calcium_Percent_DALYs_upper",
   "Diet low in calcium_Percent_DALYs_val",
   "Diet low in calcium_Percent_Deaths_lower",
   "Diet low in calcium_Percent_Deaths_upper",
   "Diet low in calcium_Percent_Deaths_val",
   "Diet low in calcium_Percent_YLDs_lower",
   "Diet low in calcium_Percent_YLDs_upper",
   "Diet low in calcium_Percent_YLDs_val",
   "Diet low in calcium_Percent_YLLs_lower",
   "Diet low in calcium_Percent_YLLs_upper",
   "Diet low in calcium_Percent_YLLs_val",
   "Diet low in calcium_Rate_DALYs_lower",
   "Diet low in calcium_Rate_DALYs_upper",
   "Diet low in calcium_Rate_DALYs_val",
   "Diet low in calcium_Rate_Deaths_lower",
   "Diet low in calcium_Rate_Deaths_upper",
   "Diet low in calcium_Rate_Deaths_val",
   "Diet low in calcium_Rate_YLDs_lower",
   "Diet low in calcium_Rate_YLDs_upper",
   "Diet low in calcium_Rate_YLDs_val",
   "Diet low in calcium_Rate_YLLs_lower",
   "Diet low in calcium_Rate_YLLs_upper",
   "Diet low in calcium_Rate_YLLs_val",
   "Diet low in fiber_Percent_DALYs_lower",
   "Diet low in fiber_Percent_DALYs_upper",
   "Diet low in fiber_Percent_DALYs_val",
   "Diet low in fiber_Percent_Deaths_lower",
   "Diet low in fiber_Percent_Deaths_upper",
   "Diet low in fiber_Percent_Deaths_val",
   "Diet low in fiber_Percent_YLDs_lower",
   "Diet low in fiber_Percent_YLDs_upper",
   "Diet low in fiber_Percent_YLDs_val",
   "Diet low in fiber_Percent_YLLs_lower",
   "Diet low in fiber_Percent_YLLs_upper",
   "Diet low in fiber_Percent_YLLs_val",
   "Diet low in fiber_Rate_DALYs_lower",
   "Diet low in fiber_Rate_DALYs_upper",
   "Diet low in fiber_Rate_DALYs_val",
   "Diet low in fiber_Rate_Deaths_lower",
   "Diet low in fiber_Rate_Deaths_upper",
   "Diet low in fiber_Rate_Deaths_val",
   "Diet low in fiber_Rate_YLDs_lower",
   "Diet low in fiber_Rate_YLDs_upper",
   "Diet low in fiber_Rate_YLDs_val",
   "Diet low in fiber_Rate_YLLs_lower",
   "Diet low in fiber_Rate_YLLs_upper",
   "Diet low in fiber_Rate_YLLs_val",
   "Diet low in milk_Percent_DALYs_lower",
   "Diet low in milk_Percent_DALYs_upper",
   "Diet low in milk_Percent_DALYs_val",
   "Diet low in milk_Percent_Deaths_lower",
   "Diet low in milk_Percent_Deaths_upper",
   "Diet low in milk_Percent_Deaths_val",
   "Diet low in milk_Percent_YLDs_lower",
   "Diet low in milk_Percent_YLDs_upper",
   "Diet low in milk_Percent_YLDs_val",
   "Diet low in milk_Percent_YLLs_lower",
   "Diet low in milk_Percent_YLLs_upper",
   "Diet low in milk_Percent_YLLs_val",
   "Diet low in milk_Rate_DALYs_lower",
   "Diet low in milk_Rate_DALYs_upper",
   "Diet low in milk_Rate_DALYs_val",
   "Diet low in milk_Rate_Deaths_lower",
   "Diet low in milk_Rate_Deaths_upper",
   "Diet low in milk_Rate_Deaths_val",
   "Diet low in milk_Rate_YLDs_lower",
   "Diet low in milk_Rate_YLDs_upper",
   "Diet low in milk_Rate_YLDs_val",
   "Diet low in milk_Rate_YLLs_lower",
   "Diet low in milk_Rate_YLLs_upper",
   "Diet low in milk_Rate_YLLs_val",
   "Diet low in whole grains_Percent_DALYs_lower",
   "Diet low in whole grains_Percent_DALYs_upper",
   "Diet low in whole grains_Percent_DALYs_val",
   "Diet low in whole grains_Percent_Deaths_lower",
   "Diet low in whole grains_Percent_Deaths_upper",
   "Diet low in whole grains_Percent_Deaths_val",
   "Diet low in whole grains_Percent_YLDs_lower",
   "Diet low in whole grains_Percent_YLDs_upper",
   "Diet low in whole grains_Percent_YLDs_val",
   "Diet low in whole grains_Percent_YLLs_lower",
   "Diet low in whole grains_Percent_YLLs_upper",
   "Diet low in whole grains_Percent_YLLs_val",
   "Diet low in whole grains_Rate_DALYs_lower",
   "Diet low in whole grains_Rate_DALYs_upper",
   "Diet low in whole grains_Rate_DALYs_val",
   "Diet low in whole grains_Rate_Deaths_lower",
   "Diet low in whole grains_Rate_Deaths_upper",
   "Diet low in whole grains_Rate_Deaths_val",
   "Diet low in whole grains_Rate_YLDs_lower",
   "Diet low in whole grains_Rate_YLDs_upper",
   "Diet low in whole grains_Rate_YLDs_val",
   "Diet low in whole grains_Rate_YLLs_lower",
   "Diet low in whole grains_Rate_YLLs_upper",
   "Diet low in whole grains_Rate_YLLs_val",
   "Smoking_Percent_DALYs_lower",
   "Smoking_Percent_DALYs_upper",
   "Smoking_Percent_DALYs_val",
   "Smoking_Percent_Deaths_lower",
   "Smoking_Percent_Deaths_upper",
   "Smoking_Percent_Deaths_val",
   "Smoking_Percent_YLDs_lower",
   "Smoking_Percent_YLDs_upper",
   "Smoking_Percent_YLDs_val",
   "Smoking_Percent_YLLs_lower",
   "Smoking_Percent_YLLs_upper",
   "Smoking_Percent_YLLs_val",
   "Smoking_Rate_DALYs_lower",
   "Smoking_Rate_DALYs_upper",
   "Smoking_Rate_DALYs_val",
   "Smoking_Rate_Deaths_lower",
   "Smoking_Rate_Deaths_upper",
   "Smoking_Rate_Deaths_val",
   "Smoking_Rate_YLDs_lower",
   "Smoking_Rate_YLDs_upper",
   "Smoking_Rate_YLDs_val",
   "Smoking_Rate_YLLs_lower",
   "Smoking_Rate_YLLs_upper",
   "Smoking_Rate_YLLs_val",
   "Alcohol use_Rate_SEV_lower",
   "Alcohol use_Rate_SEV_upper",
   "Alcohol use_Rate_SEV_val",
   "Diet high in processed meat_Rate_SEV_lower",
   "Diet high in processed meat_Rate_SEV_upper",
   "Diet high in processed meat_Rate_SEV_val",
   "Diet high in red meat_Rate_SEV_lower",
   "Diet high in red meat_Rate_SEV_upper",
   "Diet high in red meat_Rate_SEV_val",
   "Diet high in sodium_Rate_SEV_lower",
   "Diet high in sodium_Rate_SEV_upper",
   "Diet high in sodium_Rate_SEV_val",
   "Diet high in sugar-sweetened beverages_Rate_SEV_lower",
   "Diet high in sugar-sweetened beverages_Rate_SEV_upper",
   "Diet high in sugar-sweetened beverages_Rate_SEV_val",
   "Diet high in trans fatty acids_Rate_SEV_lower",
   "Diet high in trans fatty acids_Rate_SEV_upper",
   "Diet high in trans fatty acids_Rate_SEV_val",
   "Diet low in calcium_Rate_SEV_lower",
   "Diet low in calcium_Rate_SEV_upper",
   "Diet low in calcium_Rate_SEV_val",
   "Diet low in fiber_Rate_SEV_lower",
   "Diet low in fiber_Rate_SEV_upper",
   "Diet low in fiber_Rate_SEV_val",
   "Diet low in fruits_Rate_SEV_lower",
   "Diet low in fruits_Rate_SEV_upper",
   "Diet low in fruits_Rate_SEV_val",
   "Diet low in legumes_Rate_SEV_lower",
   "Diet low in legumes_Rate_SEV_upper",
   "Diet low in legumes_Rate_SEV_val",
   "Diet low in milk_Rate_SEV_lower",
   "Diet low in milk_Rate_SEV_upper",
   "Diet low in milk_Rate_SEV_val",
   "Diet low in nuts and seeds_Rate_SEV_lower",
   "Diet low in nuts and seeds_Rate_SEV_upper",
   "Diet low in nuts and seeds_Rate_SEV_val",
   "Diet low in polyunsaturated fatty acids_Rate_SEV_lower",
   "Diet low in polyunsaturated fatty acids_Rate_SEV_upper",
   "Diet low in polyunsaturated fatty acids_Rate_SEV_val",
   "Diet low in seafood omega-3 fatty acids_Rate_SEV_lower",
   "Diet low in seafood omega-3 fatty acids_Rate_SEV_upper",
   "Diet low in seafood omega-3 fatty acids_Rate_SEV_val",
   "Diet low in vegetables_Rate_SEV_lower",
   "Diet low in vegetables_Rate_SEV_upper",
   "Diet low in vegetables_Rate_SEV_val",
   "Diet low in whole grains_Rate_SEV_lower",
   "Diet low in whole grains_Rate_SEV_upper",
   "Diet low in whole grains_Rate_SEV_val",
   "High body-mass index_Rate_SEV_lower",
   "High body-mass index_Rate_SEV_upper",
   "High body-mass index_Rate_SEV_val",
   "Low physical activity_Rate_SEV_lower",
   "Low physical activity_Rate_SEV_upper",
   "Low physical activity_Rate_SEV_val",
   "Smoking_Rate_SEV_lower",
   "Smoking_Rate_SEV_upper",
   "Smoking_Rate_SEV_val",
   "Unsafe water source_Rate_SEV_lower",
   "Unsafe water source_Rate_SEV_upper",
   "Unsafe water source_Rate_SEV_val",
   "%% of the population unable to afford a healthy diet_Value",
   "PPP $/person/day of a healthy diet_Value",
   "PPP $/person/day of animal source foods_Value",
   "PPP $/person/day of fruits_Value",
   "PPP $/person/day of legumes nuts and seeds_Value",
   "PPP $/person/day of oils and fats_Value",
   "PPP $/person/day of starchy staples_Value",
   "PPP $/person/day of vegetables_Value",
   "people unable to afford a healthy diet (million)_Value",
   "CRC_incidence_val_Number",
   "CRC_incidence_upper_Number",
   "CRC_incidence_lower_Number",
   "Alcohol use_Number_DALYs_lower",
   "Alcohol use_Number_DALYs_upper",
   "Alcohol use_Number_DALYs_val",
   "Alcohol use_Number_Deaths_lower",
   "Alcohol use_Number_Deaths_upper",
   "Alcohol use_Number_Deaths_val",
   "Alcohol use_Number_YLDs_lower",
   "Alcohol use_Number_YLDs_upper",
   "Alcohol use_Number_YLDs_val",
   "Alcohol use_Number_YLLs_lower",
   "Alcohol use_Number_YLLs_upper",
   "Alcohol use_Number_YLLs_val",
   "Diet high in processed meat_Number_DALYs_lower",
   "Diet high in processed meat_Number_DALYs_upper",
   "Diet high in processed meat_Number_DALYs_val",
   "Diet high in processed meat_Number_Deaths_lower",
   "Diet high in processed meat_Number_Deaths_upper",
   "Diet high in processed meat_Number_Deaths_val",
   "Diet high in processed meat_Number_YLDs_lower",
   "Diet high in processed meat_Number_YLDs_upper",
   "Diet high in processed meat_Number_YLDs_val",
   "Diet high in processed meat_Number_YLLs_lower",
   "Diet high in processed meat_Number_YLLs_upper",
   "Diet high in processed meat_Number_YLLs_val",
   "Diet high in red meat_Number_DALYs_lower",
   "Diet high in red meat_Number_DALYs_upper",
   "Diet high in red meat_Number_DALYs_val",
   "Diet high in red meat_Number_Deaths_lower",
   "Diet high in red meat_Number_Deaths_upper",
   "Diet high in red meat_Number_Deaths_val",
   "Diet high in red meat_Number_YLDs_lower",
   "Diet high in red meat_Number_YLDs_upper",
   "Diet high in red meat_Number_YLDs_val",
   "Diet high in red meat_Number_YLLs_lower",
   "Diet high in red meat_Number_YLLs_upper",
   "Diet high in red meat_Number_YLLs_val",
   "Diet low in calcium_Number_DALYs_lower",
   "Diet low in calcium_Number_DALYs_upper",
   "Diet low in calcium_Number_DALYs_val",
   "Diet low in calcium_Number_Deaths_lower",
   "Diet low in calcium_Number_Deaths_upper",
   "Diet low in calcium_Number_Deaths_val",
   "Diet low in calcium_Number_YLDs_lower",
   "Diet low in calcium_Number_YLDs_upper",
   "Diet low in calcium_Number_YLDs_val",
   "Diet low in calcium_Number_YLLs_lower",
   "Diet low in calcium_Number_YLLs_upper",
   "Diet low in calcium_Number_YLLs_val",
   "Diet low in fiber_Number_DALYs_lower",
   "Diet low in fiber_Number_DALYs_upper",
   "Diet low in fiber_Number_DALYs_val",
   "Diet low in fiber_Number_Deaths_lower",
   "Diet low in fiber_Number_Deaths_upper",
   "Diet low in fiber_Number_Deaths_val",
   "Diet low in fiber_Number_YLDs_lower",
   "Diet low in fiber_Number_YLDs_upper",
   "Diet low in fiber_Number_YLDs_val",
   "Diet low in fiber_Number_YLLs_lower",
   "Diet low in fiber_Number_YLLs_upper",
   "Diet low in fiber_Number_YLLs_val",
   "Diet low in milk_Number_DALYs_lower",
   "Diet low in milk_Number_DALYs_upper",
   "Diet low in milk_Number_DALYs_val",
   "Diet low in milk_Number_Deaths_lower",
   "Diet low in milk_Number_Deaths_upper",
   "Diet low in milk_Number_Deaths_val",
   "Diet low in milk_Number_YLDs_lower",
   "Diet low in milk_Number_YLDs_upper",
   "Diet low in milk_Number_YLDs_val",
   "Diet low in milk_Number_YLLs_lower",
   "Diet low in milk_Number_YLLs_upper",
   "Diet low in milk_Number_YLLs_val",
   "Diet low in whole grains_Number_DALYs_lower",
   "Diet low in whole grains_Number_DALYs_upper",
   "Diet low in whole grains_Number_DALYs_val",
   "Diet low in whole grains_Number_Deaths_lower",
   "Diet low in whole grains_Number_Deaths_upper",
   "Diet low in whole grains_Number_Deaths_val",
   "Diet low in whole grains_Number_YLDs_lower",
   "Diet low in whole grains_Number_YLDs_upper",
   "Diet low in whole grains_Number_YLDs_val",
   "Diet low in whole grains_Number_YLLs_lower",
   "Diet low in whole grains_Number_YLLs_upper",
   "Diet low in whole grains_Number_YLLs_val",
   "Smoking_Number_DALYs_lower",
   "Smoking_Number_DALYs_upper",
   "Smoking_Number_DALYs_val",
   "Smoking_Number_Deaths_lower",
   "Smoking_Number_Deaths_upper",
   "Smoking_Number_Deaths_val",
   "Smoking_Number_YLDs_lower",
   "Smoking_Number_YLDs_upper",
   "Smoking_Number_YLDs_val",
   "Smoking_Number_YLLs_lower",
   "Smoking_Number_YLLs_upper",
   "Smoking_Number_YLLs_val",
   "Population_ECIS",
   "CRC_Cases",
   "2040_est_Population",
   "2040_est_CRC_Cases",
   "2040_CRC_Cases_Relative change_%",
   "Primary care costs €",
   "% CRC health-care costs on Primary care",
   "Outpatient care costs €",
   "% CRC health-care costs on Outpatient care",
   "Emergency care costs €",
   "% CRC health-care costs on Emergency care",
   "Hospital care costs €",
   "% CRC health-care costs on Hospital care",
   "Systemic anti-cancer therapy costs €",
   "% CRC health-care costs on Systemic anti-cancer therapy",
   "Total health- care expenditure costs €",
   "% CRC economic burden on health-care expenditure",
   "Mortality costs €",
   "% CRC economic burden on Mortality",
   "Morbidity costs €",
   "% CRC economic burden on Morbidity",
   "Informal care costs €",
   "% CRC economic burden on Informal care",
   "Total non- health-care expenditure costs €",
   "% CRC economic burden on non- health-care expenditure",
   "% health-care expenditure",
   "Total costs €",
   "Health expenditure_per_capita",
   "Cancer drugs*_per_capita",
   "Informal care costs_per_capita",
   "Mortality_per_capita",
   "Morbidity_per_capita",
   "Total costs_per_capita",
   "Health expenditure_total_cost",
   "Cancer drugs_total_cost",
   "Informal care costs_total_cost",
   "Mortality_total_cost",
   "Morbidity_total_cost",
   "Total costs_total_cost",
   "Populated Area [km2]",
   "Population_WHO",
   "Air Pollution Average [ug/m3]_NO2",
   "Air Pollution Population Weighted Average [ug/m3]_NO2",
   "Air Pollution Average [ug/m3]_O3",
   "Air Pollution Population Weighted Average [ug/m3]_O3",
   "Air Pollution Average [ug/m3]_PM10",
   "Air Pollution Population Weighted Average [ug/m3]_PM10",
   "Air Pollution Average [ug/m3]_PM2.5",
   "Air Pollution Population Weighted Average [ug/m3]_PM2.5"
      )
      FROM STDIN
      CSV HEADER
      DELIMITER ','
      ;
   """;

   // TODO: Handle token expiration
   private String jwt = null;

   @Autowired
   private WebClient webClient;

   public void login(){

      String response_json = webClient
         .post()
         .uri(login_endpoint)
         .header("Accept","*/*")
         .header("Content-Type","application/json")
         .bodyValue(getCredentialsJson())
         .retrieve()                                           // Send the request
         .onStatus(
            httpStatus -> !httpStatus.is2xxSuccessful(),
            clientResponse -> handleErrorResponse(clientResponse)
         )
         .bodyToMono(String.class)
         .block()
      ;

      jwt = (String) json2map(response_json).get("token");
   }
   
   private Mono<? extends Throwable> handleErrorResponse(ClientResponse clientResponse) {
      // Handle non-success status codes here (e.g., logging or custom error handling)
      
      System.out.println("--- GK> Request failed with response: " + clientResponse );
      return Mono.error(new Exception("--- GK> Request failed with status code: " + clientResponse.statusCode().toString()));
   }

   public void getData() {
      System.out.println("--- GK> Entering the service ");

      if (jwt == null) {
         System.out.println("GK> Not logged in yet: "+jwt);
         login();
         System.out.println("GK> Fixed: "+jwt);
      }else{
         System.out.println("GK> Already logged: "+jwt);
      }

      Flux<DataBuffer> response_flux = webClient
         .get()
         .uri(data_endpoint)
         .header("Accept","*/*")
         .header("Content-Type","application/json")
         .header("Authorization","Bearer " + jwt)
         .retrieve()                                           // Send the request
         .onStatus(
            httpStatus -> !httpStatus.is2xxSuccessful(),
            clientResponse -> handleErrorResponse(clientResponse)
         )
         .bodyToFlux(DataBuffer.class)
      ;

      Path dataFile_path = Paths.get(dataset_afile);
      DataBufferUtils
         .write(response_flux,dataFile_path)
         .block();
   }

   private String getCredentialsJson(){
      Map<String, String> body_map = new HashMap<>();
      body_map.put("service_name", _datarepo_user);
      body_map.put("password", _datarepo_pass);
      return map2json(body_map);
   }

   private Map<String,Object> json2map(String json){
      Map<String, Object> result_map = null;
      try {
         ObjectMapper objectMapper = new ObjectMapper();
         result_map = objectMapper.readValue(json, new TypeReference<Map<String,Object>>(){});
      } catch(JsonProcessingException e){
         e.printStackTrace();
      } 
      return result_map;
   }

   private String map2json(Map<String,String> map){
      String result_json="";
      try {
         ObjectMapper objectMapper = new ObjectMapper();
         result_json = objectMapper.writeValueAsString(map);
      } catch (JsonProcessingException e){
         e.printStackTrace();
      }
      return result_json;
   }

   public void importDataset(){

      System.out.println("GK> truncating the table");
      jdbcTemplate.execute("TRUNCATE TABLE data_tbl;");

      System.out.println("GK> Importing the data");
      Path dataFile_path = Paths.get(dataset_afile);
      try (
         Connection connection = getConnection();
         InputStream inputStream = Files.newInputStream(dataFile_path);
      ) {
         // TODO: When I learn better Spring Boot, I should do dependency injection here
         CopyManager copyManager = new CopyManager((BaseConnection) connection);
         
         long rowsWritten_cnt = copyManager.copyIn(importQuery_str, inputStream);
         System.out.printf("GK> Loaded %d lines\n", rowsWritten_cnt);

         connection.commit();
         connection.close();
 
      } catch (SQLException e) {
         e.printStackTrace();
      } catch (IOException e) {
         e.printStackTrace();
      }
   }

   private Connection getConnection() {
      Connection connection = null;
      try {
         connection = DriverManager.getConnection(
            _db_url, 
            _db_user, 
            _db_pass
         );
         connection.setAutoCommit(false);
      } catch (SQLException e) {
         e.printStackTrace();
      }
      return connection;
   }

}
