package com.tutorials.spring_react.datarepo;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;

import com.tutorials.spring_react.security.payloads.LoginRequest;

import reactor.core.publisher.Mono;

@Service
public class DataUpdateService {

   // private static final String login_endpoint="v1/services/login/";
   private static final String login_endpoint="api/v1/auth/login";
   private static final String data_endpoint="v1/retrospective/fused_european_only_new/";
   private static final String test_endpoint="/api/v1/content/all";
   
   
   private String jwt = null;

   @Autowired
   private WebClient webClient;

   public void login(){
      System.out.println("--- GK> Trying to login ");
      Map<String, String> body_map = new HashMap<>();

      body_map.put("username", "george");
      body_map.put("password", "1234567");

      LoginRequest rq = new LoginRequest("george", "1234567");

      jwt = webClient
         .post()
         .uri(login_endpoint)
         .header("Accept","*/*")
         .header("Content-Type","application/json")
         // .body(rq, LoginRequest.class)
         // .body(body_map, Map.class)
         // .bodyValue("{ \"service_name\": \"deli_certh\",\"password\": \"C_+7'oF2^gGuyCn\"}")
         .bodyValue("{ \"username\": \"george\",\"password\": \"1234567\"}")
         // .body(Mono.just(employee), Employee.class)
         .retrieve()                                           // Send the request
         .onStatus(
            httpStatus -> !httpStatus.is2xxSuccessful(),
            clientResponse -> handleErrorResponse(clientResponse)
         )
         .bodyToMono(String.class)
         .block()
      ;
      System.out.println("--- GK> Login got: " + jwt);
       
   }
   
   private Mono<? extends Throwable> handleErrorResponse(ClientResponse response) {
      // Handle non-success status codes here (e.g., logging or custom error handling)
      
      System.out.println("--- GK> Request failed with response: " + response );
      return Mono.error(new Exception("--- GK> Request failed with status code: " + response.statusCode().toString()));
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

   public void getDataset(String collection_name){

   }

}
