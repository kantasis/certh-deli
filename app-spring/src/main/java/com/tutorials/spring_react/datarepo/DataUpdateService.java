package com.tutorials.spring_react.datarepo;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutorials.spring_react.security.payloads.LoginRequest;

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
   private static final String test_endpoint="/api/v1/content/all";
   
   
   private String jwt = null;

   @Autowired
   private WebClient webClient;

   public void login(){
      System.out.println("--- GK> Trying to login ");


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

      System.out.println("--- GK> Response: " + response_json);
      jwt = (String) json2map(response_json).get("token");
      System.out.println("--- GK> Token: " + jwt);
       
   }
   
   private Mono<? extends Throwable> handleErrorResponse(ClientResponse clientResponse) {
      // Handle non-success status codes here (e.g., logging or custom error handling)
      
      System.out.println("--- GK> Request failed with response: " + clientResponse );
      return Mono.error(new Exception("--- GK> Request failed with status code: " + clientResponse.statusCode().toString()));
   }

   public String getData() {
      System.out.println("--- GK> Entering the service ");

      return webClient
         .get()
         .uri(test_endpoint)
         .header("Accept","*/*")
         .retrieve()
         .bodyToMono(String.class)
         .block()
      ;
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

   public void getDataset(String collection_name){

   }

}
