package com.tutorials.spring_react.datarepo;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class DataUpdateService {
   // TODO: Handle token expiration

   @Value("${custom.app.datarepo_user}")
   private String _datarepo_user;
   // private String _datarepo_user="george";

   @Value("${custom.app.datarepo_pass}")
   private String _datarepo_pass;
   // private String _datarepo_pass="1234567";

   private static final String login_endpoint="v1/services/login/";
   // private static final String login_endpoint="api/v1/auth/login";
   private static final String data_endpoint="v1/retrospective/fused_european_only_new/";
   // private static final String data_endpoint="v1/deli/";
   private static final String test_endpoint="/api/v1/content/all";
   
   
   private String jwt = null;

   @Autowired
   private WebClient webClient;

   @Autowired
   private JdbcTemplate jdbcTemplate;

   @Autowired
   private CsvDataRepository csvDataRepository;

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
      
      try (
         PipedOutputStream pipedOutputStream = new PipedOutputStream();
         // InputStream inputStream = new InputStream();
         PipedInputStream pipedInputStream = new PipedInputStream();
         InputStreamReader inputStreamReader = new InputStreamReader(pipedInputStream);
         CSVReader csvReader = new CSVReader(inputStreamReader)
      ) {
         pipedInputStream.connect(pipedOutputStream);

         DataBufferUtils
            .write(response_flux,pipedOutputStream)
            .subscribe();

      }catch (IOException e){
         e.printStackTrace();
      }


      // Path path = Paths.get("/tmp/download.dat");
      // DataBufferUtils
      //    .write(response_flux,path)
      //    .block();

      System.out.println("GK> Response:");
      System.out.println(response_flux);
      System.out.println("GK> /Response:");

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
      // finally{}
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

   public void loadToDatabase(MultipartFile file){
      // csvDataRepository;
      try (
         InputStreamReader inputStreamReader = new InputStreamReader(file.getInputStream());
         CSVReader csvReader = new CSVReader(inputStreamReader)
      ) {
         String[] headers = csvReader.readNext();
         if (headers == null) 
            throw new RuntimeException("Empty CSV file");
         String[] values;

         
         while ((values = csvReader.readNext()) != null) {
            Map<String, String> attributes = new HashMap<>();
            for (int i = 0; i < headers.length; i++)
               attributes.put(headers[i], values[i]);

            CsvDataEntity csvDataEntity = new CsvDataEntity();
            csvDataEntity.setAttributes(attributes);
            csvDataRepository.save(csvDataEntity);
         }

      }catch (IOException | CsvValidationException e) {
         throw new RuntimeException("Failed to parse CSV file: " + e.getMessage());
      }

   }

   public void getDataset(String collection_name){

   }

   public void silly(){
      jdbcTemplate.execute("""
         CREATE TABLE Persons (
            PersonID int,
            LastName varchar(255),
            FirstName varchar(255),
            Address varchar(255),
            City varchar(255)
         );
      """);
   }

}
